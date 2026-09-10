import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

import { BiometricService } from './biometric.service';
import { BiometricCredential } from '../../database/schemas/biometric-credential.schema';
import { AuthChallenge } from '../../database/schemas/auth-challenge.schema';
import { User } from '../../database/schemas/user.schema';
import { AuditLog } from '../../database/schemas/audit-log.schema';
import { AuditService } from '../audit/audit.service';

describe('BiometricService', () => {
  let service: BiometricService;
  let mockChallengeModel: any;
  let mockBioModel: any;
  let mockUserModel: any;
  let mockAuditLogModel: any;
  let mockAuditService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockChallengeModel = {
      create: jest.fn().mockImplementation((doc) => Promise.resolve({ ...doc, save: jest.fn() })),
      findOne: jest.fn(),
    };
    mockBioModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };
    mockAuditLogModel = {
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };
    mockAuditService = {
      log: jest.fn().mockResolvedValue({}),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token-biometric-verified'),
    };
    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'mlService.url') return 'http://localhost:8001';
        if (key === 'mlService.secret') return 'test-key';
        if (key === 'biometric.matchThreshold') return 0.78;
        if (key === 'biometric.challengeTtlSeconds') return 300;
        if (key === 'biometric.maxAttempts') return 3;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiometricService,
        { provide: getModelToken(BiometricCredential.name), useValue: mockBioModel },
        { provide: getModelToken(AuthChallenge.name), useValue: mockChallengeModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(AuditLog.name), useValue: mockAuditLogModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<BiometricService>(BiometricService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a short-lived authentication challenge upon password success', async () => {
    const mockUser: any = {
      _id: 'user-123',
      email: 'investigator@circuit.gov',
      name: 'Vikram Rao',
      role: 'investigator',
    };

    const res = await service.createAuthChallenge(mockUser, '127.0.0.1', 'JestTest');
    expect(res.status).toBe('FACE_VERIFICATION_REQUIRED');
    expect(res.challengeId).toMatch(/^chn_/);
    expect(res.expiresIn).toBe(300);
    expect(res.user.email).toBe('investigator@circuit.gov');
    expect(mockChallengeModel.create).toHaveBeenCalled();
  });

  it('should reject verification if challenge has expired', async () => {
    mockChallengeModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        challengeId: 'chn_expired',
        userId: 'user-123',
        userEmail: 'test@circuit.gov',
        isUsed: false,
        isLocked: false,
        expiresAt: new Date(Date.now() - 10000), // expired in past
        attempts: 0,
        maxAttempts: 3,
      }),
    });

    await expect(
      service.verifyFace({
        challengeId: 'chn_expired',
        faceImage: 'data:image/jpeg;base64,123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject verification if challenge was already used (replay attack protection)', async () => {
    mockChallengeModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        challengeId: 'chn_used',
        userId: 'user-123',
        userEmail: 'test@circuit.gov',
        isUsed: true,
        isLocked: false,
        expiresAt: new Date(Date.now() + 10000),
        attempts: 0,
        maxAttempts: 3,
      }),
    });

    await expect(
      service.verifyFace({
        challengeId: 'chn_used',
        faceImage: 'data:image/jpeg;base64,123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should enroll a new biometric template with version 1 and audit log', async () => {
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        embedding: new Array(128).fill(0.088),
        model_version: 'circuit-facenet-v1',
        quality_score: 97.2,
      },
    });

    mockUserModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'user-789',
        email: 'analyst@circuit.gov',
      }),
    });

    mockBioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null), // no existing template
    });

    mockBioModel.findOneAndUpdate.mockResolvedValue({
      _id: 'cred-123',
      enrollmentVersion: 1,
      updatedAt: new Date(),
    });

    const res = await service.enrollFace(
      { userId: 'user-789' },
      {
        faceImage: 'data:image/jpeg;base64,sample',
        livenessProof: { captureMode: 'AUTO_CAPTURE' },
      },
      'admin',
      '127.0.0.1',
      'TestAgent',
    );

    expect(res.success).toBe(true);
    expect(res.enrollmentVersion).toBe(1);
    expect(res.qualityScore).toBe(97.2);
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'BIOMETRIC_ENROLLMENT_COMPLETED',
        details: expect.objectContaining({
          enrollmentVersion: 1,
          isUpdate: false,
          captureMode: 'AUTO_CAPTURE',
        }),
      }),
    );
  });

  it('should increment version to 2 and log BIOMETRIC_TEMPLATE_UPDATED when re-enrolling', async () => {
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        embedding: new Array(128).fill(0.088),
        model_version: 'circuit-facenet-v1',
        quality_score: 98.4,
      },
    });

    mockUserModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'user-789',
        email: 'analyst@circuit.gov',
      }),
    });

    mockBioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'cred-123',
        enrollmentVersion: 1,
      }),
    });

    mockBioModel.findOneAndUpdate.mockResolvedValue({
      _id: 'cred-123',
      enrollmentVersion: 2,
      updatedAt: new Date(),
    });

    const res = await service.enrollFace(
      { userId: 'user-789' },
      {
        faceImage: 'data:image/jpeg;base64,sample2',
        livenessProof: { captureMode: 'AUTO_CAPTURE' },
      },
      'admin',
      '127.0.0.1',
      'TestAgent',
    );

    expect(res.success).toBe(true);
    expect(res.enrollmentVersion).toBe(2);
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'BIOMETRIC_TEMPLATE_UPDATED',
        details: expect.objectContaining({
          enrollmentVersion: 2,
          isUpdate: true,
          captureMode: 'AUTO_CAPTURE',
        }),
      }),
    );
  });
});
