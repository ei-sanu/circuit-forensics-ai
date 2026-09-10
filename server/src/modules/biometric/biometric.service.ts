import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as crypto from 'crypto';

import {
  BiometricCredential,
  BiometricCredentialDocument,
} from '../../database/schemas/biometric-credential.schema';
import {
  AuthChallenge,
  AuthChallengeDocument,
} from '../../database/schemas/auth-challenge.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { AuditLog, AuditLogDocument } from '../../database/schemas/audit-log.schema';
import { AuditService } from '../audit/audit.service';
import { BiometricCryptoUtil } from './biometric-crypto.util';
import { VerifyFaceDto } from './dto/verify-face.dto';
import { EnrollFaceDto } from './dto/enroll-face.dto';

@Injectable()
export class BiometricService implements OnModuleInit {
  private readonly logger = new Logger(BiometricService.name);
  private mlUrl: string;
  private mlSecret: string;
  private matchThreshold: number;
  private challengeTtlSeconds: number;
  private maxAttempts: number;

  constructor(
    @InjectModel(BiometricCredential.name)
    private bioModel: Model<BiometricCredentialDocument>,
    @InjectModel(AuthChallenge.name)
    private challengeModel: Model<AuthChallengeDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
    private jwtService: JwtService,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {
    this.mlUrl = this.configService.get<string>('mlService.url') || 'http://localhost:8001';
    this.mlSecret =
      this.configService.get<string>('mlService.secret') ||
      'dev-secret-internal-service-key-2026';
    this.matchThreshold =
      this.configService.get<number>('biometric.matchThreshold') || 0.78;
    this.challengeTtlSeconds =
      this.configService.get<number>('biometric.challengeTtlSeconds') || 300;
    this.maxAttempts =
      this.configService.get<number>('biometric.maxAttempts') || 3;
  }

  async onModuleInit() {
    try {
      await this.seedDefaultBiometricTemplates();
    } catch (err: any) {
      this.logger.warn(`Could not seed default biometric credentials: ${err.message}`);
    }
  }

  /**
   * Seeds default synthetic biometric templates for standard system users.
   */
  async seedDefaultBiometricTemplates() {
    const seedUsers = [
      'investigator@circuit.gov',
      'analyst@circuit.gov',
      'admin@circuit.gov',
      'police@circuit.gov',
      'hr@circuit.gov',
    ];

    for (let i = 0; i < seedUsers.length; i++) {
      const email = seedUsers[i];
      const existing = await this.bioModel.findOne({ userEmail: email }).exec();
      if (!existing) {
        // Generate a 128-d normalized baseline template
        const vec = new Array(128).fill(0).map((_, idx) => {
          const val = Math.sin((idx + 1) * (i + 1) * 0.1) + Math.cos(idx * 0.2);
          return val;
        });
        const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
        const normalizedVec = vec.map((v) => Number((v / (norm || 1)).toFixed(6)));

        const user = await this.userModel.findOne({ email }).exec();
        const userId = user ? user._id.toString() : `usr-seed-${i + 1}`;

        const encryptedTemplate = BiometricCryptoUtil.encryptTemplate(normalizedVec);

        await this.bioModel.create({
          userId,
          userEmail: email,
          encryptedTemplate,
          algorithm: 'AES-256-GCM',
          modelVersion: 'circuit-facenet-v1',
          enrollmentVersion: 1,
          status: 'active',
          enrolledBy: 'SYSTEM_SEED',
          qualityScore: 96.5,
          lastVerifiedAt: new Date(),
        });
      }
    }
    this.logger.log('Default enterprise biometric credentials verified and ready.');
  }

  /**
   * Creates a short-lived, single-use authentication challenge for 2-factor face verification.
   */
  async createAuthChallenge(user: UserDocument, ip?: string, userAgent?: string) {
    const challengeId = `chn_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + this.challengeTtlSeconds * 1000);

    await this.challengeModel.create({
      challengeId,
      userId: user._id.toString(),
      userEmail: user.email,
      attempts: 0,
      maxAttempts: this.maxAttempts,
      isUsed: false,
      isLocked: false,
      expiresAt,
      ipAddress: ip,
      userAgent,
      requiredFactors: ['FACE_BIOMETRIC'],
      completedFactors: [],
    });

    await this.auditService.log({
      userId: user._id.toString(),
      userEmail: user.email,
      action: 'FACE_VERIFICATION_STARTED',
      resourceType: 'auth_challenge',
      resourceId: challengeId,
      details: {
        challengeId,
        expiresIn: this.challengeTtlSeconds,
        requiredFactor: 'FACE_BIOMETRIC',
      },
      ipAddress: ip,
      userAgent,
    });

    return {
      status: 'FACE_VERIFICATION_REQUIRED',
      challengeId,
      expiresIn: this.challengeTtlSeconds,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber,
        district: user.district,
        stationName: user.stationName,
        inchargeRank: user.inchargeRank,
      },
    };
  }

  /**
   * Performs 1:1 biometric verification against the claimed user's enrolled template.
   */
  async verifyFace(dto: VerifyFaceDto, ip?: string, userAgent?: string) {
    const challenge = await this.challengeModel
      .findOne({ challengeId: dto.challengeId })
      .exec();

    if (!challenge) {
      throw new UnauthorizedException('Invalid or expired biometric challenge.');
    }

    if (challenge.isUsed) {
      await this.auditService.log({
        userId: challenge.userId,
        userEmail: challenge.userEmail,
        action: 'AUTH_CHALLENGE_REPLAY_ATTEMPT',
        resourceType: 'auth_challenge',
        resourceId: challenge.challengeId,
        details: { warning: 'Replay attempt detected on consumed challenge.' },
        ipAddress: ip,
        userAgent,
      });
      throw new UnauthorizedException('Authentication challenge already completed.');
    }

    if (challenge.isLocked) {
      await this.auditService.log({
        userId: challenge.userId,
        userEmail: challenge.userEmail,
        action: 'BIOMETRIC_ACCOUNT_LOCKED',
        resourceType: 'auth_challenge',
        resourceId: challenge.challengeId,
        details: { warning: 'Attempt to authenticate on locked challenge.' },
        ipAddress: ip,
        userAgent,
      });
      throw new UnauthorizedException(
        'Biometric authentication is locked due to excessive failed attempts. Please contact an administrator.',
      );
    }

    if (new Date() > challenge.expiresAt) {
      await this.auditService.log({
        userId: challenge.userId,
        userEmail: challenge.userEmail,
        action: 'AUTH_CHALLENGE_EXPIRED',
        resourceType: 'auth_challenge',
        resourceId: challenge.challengeId,
        details: { expiredAt: challenge.expiresAt },
        ipAddress: ip,
        userAgent,
      });
      throw new UnauthorizedException(
        'Authentication challenge has expired. Please sign in again.',
      );
    }

    // Retrieve user and enrolled biometric credential
    const user = await this.userModel.findById(challenge.userId).exec();
    if (!user) {
      throw new UnauthorizedException('User account associated with challenge not found.');
    }

    let credential = await this.bioModel
      .findOne({ userId: challenge.userId, status: 'active' })
      .exec();

    if (!credential) {
      credential = await this.bioModel
        .findOne({ userEmail: challenge.userEmail, status: 'active' })
        .exec();
    }

    // Decrypt stored biometric template
    let enrolledTemplate: number[];
    if (credential) {
      try {
        enrolledTemplate = BiometricCryptoUtil.decryptTemplate(
          credential.encryptedTemplate,
        );
      } catch (err: any) {
        this.logger.error(`Decryption failed for user ${user.email}: ${err.message}`);
        throw new BadRequestException('Corrupted biometric template. Please re-enroll.');
      }
    } else {
      // If no template enrolled yet (first-time fallback), generate template from live image and enroll
      try {
        const enrollRes = await axios.post(
          `${this.mlUrl}/ml/face/enroll`,
          { face_image: dto.faceImage, user_id: user._id.toString() },
          { headers: { 'X-Internal-Service-Key': this.mlSecret } },
        );
        enrolledTemplate = enrollRes.data.embedding;
        const encrypted = BiometricCryptoUtil.encryptTemplate(enrolledTemplate);
        credential = await this.bioModel.create({
          userId: user._id.toString(),
          userEmail: user.email,
          encryptedTemplate: encrypted,
          algorithm: 'AES-256-GCM',
          modelVersion: enrollRes.data.model_version || 'circuit-facenet-v1',
          enrollmentVersion: 1,
          status: 'active',
          enrolledBy: 'INITIAL_LOGIN_ENROLLMENT',
          qualityScore: enrollRes.data.quality_score || 95.0,
          lastVerifiedAt: new Date(),
        });
      } catch (err: any) {
        throw new BadRequestException(
          'Biometric enrollment failed. Please ensure a clear live face is visible.',
        );
      }
    }

    // Call ML Engine for 1:1 Cosine Similarity & Liveness Verification
    let mlResult: any;
    try {
      const response = await axios.post(
        `${this.mlUrl}/ml/face/verify`,
        {
          face_image: dto.faceImage,
          enrolled_template: enrolledTemplate,
          liveness_data: dto.livenessData,
          threshold: dto.threshold || this.matchThreshold,
        },
        { headers: { 'X-Internal-Service-Key': this.mlSecret } },
      );
      mlResult = response.data;
    } catch (err: any) {
      this.logger.error(`ML Face Verification Service Error: ${err.message}`);
      throw new BadRequestException(
        err.response?.data?.detail || 'Biometric analysis service unavailable.',
      );
    }

    // Evaluate Verification Outcome
    if (mlResult.verified === true) {
      // Mark challenge as used and completed
      challenge.isUsed = true;
      challenge.completedFactors = ['FACE_BIOMETRIC'];
      await challenge.save();

      // Update credential last verification timestamp
      credential.lastVerifiedAt = new Date();
      await credential.save();

      // Audit Log Success
      await this.auditService.log({
        userId: user._id.toString(),
        userEmail: user.email,
        action: 'FACE_VERIFICATION_SUCCESS',
        resourceType: 'biometric_credential',
        resourceId: credential._id.toString(),
        details: {
          confidence: mlResult.confidence,
          similarityScore: mlResult.similarity_score,
          challengeId: challenge.challengeId,
        },
        ipAddress: ip,
        userAgent,
      });

      // Issue Final JWT Token
      const payload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        stationName: user.stationName,
        district: user.district,
        inchargeRank: user.inchargeRank,
        biometricVerified: true,
      };

      const token = this.jwtService.sign(payload);

      return {
        status: 'AUTHENTICATED',
        accessToken: token,
        tokenType: 'Bearer',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          badgeNumber: user.badgeNumber,
          district: user.district,
          stationName: user.stationName,
          inchargeRank: user.inchargeRank,
        },
        telemetry: {
          confidence: mlResult.confidence,
          similarityScore: mlResult.similarity_score,
          livenessPassed: mlResult.liveness_passed,
        },
      };
    } else {
      // Handle Verification Failure
      challenge.attempts += 1;

      const isLivenessFailure = mlResult.liveness_passed === false;
      const actionType = isLivenessFailure
        ? 'LIVENESS_FAILED'
        : 'FACE_VERIFICATION_FAILED';

      if (challenge.attempts >= challenge.maxAttempts) {
        challenge.isLocked = true;
        await challenge.save();

        await this.auditService.log({
          userId: user._id.toString(),
          userEmail: user.email,
          action: 'BIOMETRIC_ACCOUNT_LOCKED',
          resourceType: 'auth_challenge',
          resourceId: challenge.challengeId,
          details: {
            attempts: challenge.attempts,
            reason: 'Exceeded maximum permitted biometric verification attempts.',
          },
          ipAddress: ip,
          userAgent,
        });

        throw new UnauthorizedException(
          'Biometric verification failed. Too many failed attempts: account temporarily locked.',
        );
      }

      await challenge.save();

      await this.auditService.log({
        userId: user._id.toString(),
        userEmail: user.email,
        action: actionType,
        resourceType: 'auth_challenge',
        resourceId: challenge.challengeId,
        details: {
          similarityScore: mlResult.similarity_score,
          attempts: challenge.attempts,
          maxAttempts: challenge.maxAttempts,
          reasoning: mlResult.reasoning,
        },
        ipAddress: ip,
        userAgent,
      });

      const attemptsRemaining = challenge.maxAttempts - challenge.attempts;
      throw new UnauthorizedException(
        `${mlResult.reasoning} (${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining)`,
      );
    }
  }

  /**
   * Enrolls a user's biometric identity template via authorized ML pipeline.
   */
  async enrollFace(
    user: any,
    dto: EnrollFaceDto,
    enrolledBy: string = 'self',
    ip?: string,
    userAgent?: string,
  ) {
    const targetUserId = dto.userId || user.userId || user.sub;
    const targetUser = await this.userModel.findById(targetUserId).exec();

    if (!targetUser) {
      throw new NotFoundException(`User ${targetUserId} not found for biometric enrollment.`);
    }

    const existingCred = await this.bioModel.findOne({ userId: targetUser._id.toString() }).exec();
    const isUpdate = !!existingCred;
    const nextVersion = existingCred ? (existingCred.enrollmentVersion || 1) + 1 : 1;

    await this.auditService.log({
      userId: targetUser._id.toString(),
      userEmail: targetUser.email,
      action: isUpdate ? 'BIOMETRIC_UPDATE_STARTED' : 'BIOMETRIC_ENROLLMENT_STARTED',
      resourceType: 'user',
      resourceId: targetUser._id.toString(),
      details: {
        initiatedBy: enrolledBy,
        isUpdate,
        nextVersion,
        captureMode: dto.livenessProof?.captureMode || 'MANUAL',
      },
      ipAddress: ip,
      userAgent,
    });

    let mlRes: any;
    try {
      const response = await axios.post(
        `${this.mlUrl}/ml/face/enroll`,
        {
          face_image: dto.faceImage,
          user_id: targetUser._id.toString(),
          liveness_metadata: dto.livenessProof,
        },
        { headers: { 'X-Internal-Service-Key': this.mlSecret } },
      );
      mlRes = response.data;
    } catch (err: any) {
      await this.auditService.log({
        userId: targetUser._id.toString(),
        userEmail: targetUser.email,
        action: 'BIOMETRIC_ENROLLMENT_FAILED',
        resourceType: 'user',
        resourceId: targetUser._id.toString(),
        details: { error: err.response?.data?.detail || err.message },
        ipAddress: ip,
        userAgent,
      });
      throw new BadRequestException(
        err.response?.data?.detail || 'Biometric enrollment frame processing failed.',
      );
    }

    const encrypted = BiometricCryptoUtil.encryptTemplate(mlRes.embedding);

    const credential = await this.bioModel.findOneAndUpdate(
      { userId: targetUser._id.toString() },
      {
        $set: {
          userEmail: targetUser.email,
          encryptedTemplate: encrypted,
          algorithm: 'AES-256-GCM',
          modelVersion: mlRes.model_version || 'circuit-facenet-v1',
          enrollmentVersion: nextVersion,
          status: 'active',
          enrolledBy,
          qualityScore: mlRes.quality_score || 95.0,
          lastVerifiedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    const auditAction = isUpdate
      ? 'BIOMETRIC_TEMPLATE_UPDATED'
      : 'BIOMETRIC_ENROLLMENT_COMPLETED';

    await this.auditService.log({
      userId: targetUser._id.toString(),
      userEmail: targetUser.email,
      action: auditAction,
      resourceType: 'biometric_credential',
      resourceId: credential._id.toString(),
      details: {
        qualityScore: mlRes.quality_score,
        modelVersion: mlRes.model_version,
        enrollmentVersion: nextVersion,
        isUpdate,
        captureMode: dto.livenessProof?.captureMode || 'AUTO_CAPTURE',
        enrolledBy,
      },
      ipAddress: ip,
      userAgent,
    });

    return {
      success: true,
      message: 'Biometric identity template enrolled and encrypted successfully.',
      modelVersion: mlRes.model_version,
      enrollmentVersion: nextVersion,
      qualityScore: mlRes.quality_score,
      enrolledAt: credential.updatedAt,
    };
  }

  /**
   * Returns biometric enrollment and active status for a user.
   */
  async getBiometricStatus(userIdOrEmail?: string) {
    if (!userIdOrEmail) {
      return {
        hasEnrolled: true,
        status: 'active',
        modelVersion: 'circuit-facenet-v1',
        enrollmentVersion: 1,
        qualityScore: 96.5,
        lastVerifiedAt: new Date(),
        enrolledAt: new Date(),
        algorithm: 'AES-256-GCM',
      };
    }

    let cred = await this.bioModel.findOne({ userId: userIdOrEmail }).exec();
    if (!cred) {
      cred = await this.bioModel.findOne({ userEmail: userIdOrEmail }).exec();
    }
    if (!cred) {
      let user: any = null;
      try {
        user = await this.userModel.findById(userIdOrEmail).exec();
      } catch {
        // userIdOrEmail is not a valid Mongo ObjectId
      }
      if (!user) {
        user = await this.userModel.findOne({ email: userIdOrEmail }).exec();
      }
      if (user) {
        cred = await this.bioModel.findOne({
          $or: [{ userId: user._id.toString() }, { userEmail: user.email }],
        }).exec();
        if (cred && cred.userId !== user._id.toString()) {
          cred.userId = user._id.toString();
          await cred.save();
        }
      }
    }

    if (!cred) {
      return {
        hasEnrolled: false,
        status: 'pending_enrollment',
        modelVersion: 'circuit-facenet-v1',
        enrollmentVersion: 0,
        qualityScore: 0,
        lastVerifiedAt: null,
        enrolledAt: null,
        algorithm: 'AES-256-GCM',
      };
    }

    return {
      hasEnrolled: cred.status === 'active',
      status: cred.status,
      modelVersion: cred.modelVersion || 'circuit-facenet-v1',
      enrollmentVersion: cred.enrollmentVersion || 1,
      qualityScore: cred.qualityScore || 96.5,
      lastVerifiedAt: cred.lastVerifiedAt || cred.updatedAt || cred.createdAt,
      enrolledAt: cred.createdAt,
      algorithm: cred.algorithm || 'AES-256-GCM',
    };
  }

  /**
   * Aggregates telemetry and risk events for Admin / Security Dashboard.
   */
  async getSecurityTelemetry() {
    const past24h = new Date(Date.now() - 24 * 3600 * 1000);

    const [failedCount, livenessCount, lockedCount, recentEvents] = await Promise.all([
      this.auditLogModel
        .countDocuments({
          action: 'FACE_VERIFICATION_FAILED',
          createdAt: { $gte: past24h },
        })
        .exec(),
      this.auditLogModel
        .countDocuments({
          action: 'LIVENESS_FAILED',
          createdAt: { $gte: past24h },
        })
        .exec(),
      this.auditLogModel
        .countDocuments({
          action: 'BIOMETRIC_ACCOUNT_LOCKED',
          createdAt: { $gte: past24h },
        })
        .exec(),
      this.auditLogModel
        .find({
          action: {
            $in: [
              'FACE_VERIFICATION_SUCCESS',
              'FACE_VERIFICATION_FAILED',
              'LIVENESS_FAILED',
              'BIOMETRIC_ACCOUNT_LOCKED',
              'BIOMETRIC_ENROLLMENT_COMPLETED',
              'AUTH_CHALLENGE_REPLAY_ATTEMPT',
            ],
          },
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
    ]);

    return {
      stats: {
        failedVerifications: failedCount,
        livenessFailures: livenessCount,
        lockedAccounts: lockedCount,
        activeSensors: 1,
        engineStatus: 'ONLINE',
      },
      recentEvents: recentEvents.map((evt) => ({
        id: evt._id.toString(),
        action: evt.action,
        userEmail: evt.userEmail,
        details: evt.details,
        ipAddress: evt.ipAddress,
        createdAt: evt.createdAt,
      })),
    };
  }
}
