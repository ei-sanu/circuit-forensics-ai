import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../../database/schemas/user.schema';
import { Role } from '../../common/enums/role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuditService } from '../audit/audit.service';
import { BiometricService } from '../biometric/biometric.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private auditService: AuditService,
    private biometricService: BiometricService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultUsers();
  }

  async seedDefaultUsers() {
    try {
      const salt = await bcrypt.genSalt(10);
      const seedPassword = process.env.SEED_DEFAULT_PASSWORD || 'demo123';
      const passwordHash = await bcrypt.hash(seedPassword, salt);

      const defaultUsers = [
        {
          email: 'investigator@circuit.gov',
          passwordHash,
          name: 'Lead Investigator Vikram Rao',
          role: Role.INVESTIGATOR,
          department: 'Special Crime Intelligence Wing',
          badgeNumber: 'SCIW-4401',
          isActive: true,
          status: 'approved',
          reviewedByAdmin: true,
        },
        {
          email: 'analyst@circuit.gov',
          passwordHash,
          name: 'Senior Analyst Maya Sen',
          role: Role.ANALYST,
          department: 'Financial Forensics Unit',
          badgeNumber: 'FFU-1022',
          isActive: true,
          status: 'approved',
          reviewedByAdmin: true,
        },
        {
          email: 'admin@circuit.gov',
          passwordHash,
          name: 'System Administrator',
          role: Role.ADMIN,
          department: 'Operations Command',
          badgeNumber: 'ADMIN-0001',
          isActive: true,
          status: 'approved',
          reviewedByAdmin: true,
        },
        {
          email: 'police@circuit.gov',
          passwordHash,
          name: 'Senior Inspector Vikram Shinde',
          role: Role.POLICE_STATION,
          department: 'District Cyber Crime Wing',
          badgeNumber: 'PS-MUM-891',
          district: 'Mumbai South',
          stationName: 'Colaba Cyber Crime PS',
          inchargeRank: 'Senior Inspector / SHO',
          inchargeName: 'Inspector Vikram Shinde',
          phone: '+912222019944',
          isActive: true,
          status: 'approved',
          reviewedByAdmin: true,
        },
        {
          email: 'hr@circuit.gov',
          passwordHash,
          name: 'Personnel Manager Ananya Roy',
          role: Role.HR,
          department: 'HR & Personnel Directorate',
          badgeNumber: 'HR-HQ-019',
          isActive: true,
          status: 'approved',
          reviewedByAdmin: true,
        },
      ];

      for (const u of defaultUsers) {
        await this.userModel.findOneAndUpdate(
          { email: u.email },
          { $set: u },
          { upsert: true, new: true },
        ).exec();
      }
      this.logger.log('Default enterprise users ready in database across all 5 roles.');
    } catch (err: any) {
      this.logger.warn(`Could not seed default users: ${err.message}`);
    }
  }

  async demoLogin(role: string = 'investigator', ipAddress?: string, userAgent?: string) {
    const roleStr = role.toLowerCase();
    const targetEmail =
      roleStr === 'analyst'
        ? 'analyst@circuit.gov'
        : roleStr === 'admin'
        ? 'admin@circuit.gov'
        : roleStr === 'police_station' || roleStr === 'police'
        ? 'police@circuit.gov'
        : roleStr === 'hr'
        ? 'hr@circuit.gov'
        : 'investigator@circuit.gov';

    let user: UserDocument | null = null;
    try {
      user = await this.userModel.findOne({ email: targetEmail }).exec();
      if (!user) {
        await this.seedDefaultUsers();
        user = await this.userModel.findOne({ email: targetEmail }).exec();
      }
    } catch {
      // Ignore DB errors during fallback
    }

    const payload = {
      sub: user?._id?.toString() || `usr-${roleStr}`,
      email: targetEmail,
      role: user?.role || roleStr,
      name:
        user?.name ||
        (roleStr === 'analyst'
          ? 'Senior Analyst Maya Sen'
          : roleStr === 'admin'
          ? 'System Administrator'
          : roleStr === 'police_station' || roleStr === 'police'
          ? 'Senior Inspector Vikram Shinde'
          : roleStr === 'hr'
          ? 'Personnel Manager Ananya Roy'
          : 'Lead Investigator Vikram Rao'),
      stationName: user?.stationName,
      district: user?.district,
      inchargeRank: user?.inchargeRank,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        department: user?.department || 'Special Operations',
        badgeNumber: user?.badgeNumber || 'CIRCUIT-01',
        district: user?.district,
        stationName: user?.stationName,
        inchargeRank: user?.inchargeRank,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'pending_approval') {
      throw new UnauthorizedException(
        'Your account has been submitted by HR and is currently pending Admin review and approval.',
      );
    }

    if (user.status === 'rejected' || !user.isActive) {
      throw new UnauthorizedException('This account is deactivated or was rejected.');
    }

    const isBiometricEnabled =
      this.configService.get<boolean>('biometric.enabled') !== false;

    if (isBiometricEnabled) {
      // Step 2-Factor: Credentials validated. Create temporary auth challenge for live biometric verification.
      return this.biometricService.createAuthChallenge(user, ipAddress, userAgent);
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      stationName: user.stationName,
      district: user.district,
      inchargeRank: user.inchargeRank,
    };

    const token = this.jwtService.sign(payload);

    await this.auditService.log({
      userId: user._id.toString(),
      userEmail: user.email,
      action: 'LOGIN',
      resourceType: 'user',
      resourceId: user._id.toString(),
      details: { role: user.role, stationName: user.stationName },
      ipAddress,
      userAgent,
    });

    return {
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
    };
  }


  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existing = await this.userModel.findOne({ email: registerDto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const isHrCreation = registerDto.createdByHr === true;
    const initialStatus = isHrCreation ? 'pending_approval' : 'approved';

    const user = new this.userModel({
      email: registerDto.email.toLowerCase(),
      passwordHash,
      name: registerDto.name,
      role: registerDto.role || Role.INVESTIGATOR,
      department: registerDto.department,
      badgeNumber: registerDto.badgeNumber,
      district: registerDto.district,
      stationName: registerDto.stationName,
      inchargeRank: registerDto.inchargeRank,
      inchargeName: registerDto.inchargeName,
      phone: registerDto.phone,
      createdByHr: isHrCreation,
      status: initialStatus,
      reviewedByAdmin: !isHrCreation,
    });

    const saved = await user.save();

    await this.auditService.log({
      userId: saved._id.toString(),
      userEmail: saved.email,
      action: isHrCreation ? 'HR_ONBOARD_USER' : 'REGISTER_USER',
      resourceType: 'user',
      resourceId: saved._id.toString(),
      details: { role: saved.role, status: saved.status, createdByHr: isHrCreation },
      ipAddress,
      userAgent,
    });

    return {
      id: saved._id.toString(),
      email: saved.email,
      name: saved.name,
      role: saved.role,
      status: saved.status,
      stationName: saved.stationName,
      district: saved.district,
    };
  }

  async getPendingUsers() {
    return this.userModel
      .find({ status: 'pending_approval' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllUsers() {
    return this.userModel
      .find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveUser(userId: string, adminUser: any) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: 'approved',
          isActive: true,
          reviewedByAdmin: true,
          reviewedAt: new Date(),
        },
      },
      { new: true },
    ).select('-passwordHash');

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    await this.auditService.log({
      userId: adminUser?.userId || 'admin',
      userEmail: adminUser?.email || 'admin@circuit.gov',
      action: 'APPROVE_USER_ONBOARDING',
      resourceType: 'user',
      resourceId: userId,
      details: { approvedUser: user.email, role: user.role },
    });

    return user;
  }

  async rejectUser(userId: string, adminUser: any) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: 'rejected',
          isActive: false,
          reviewedByAdmin: true,
          reviewedAt: new Date(),
        },
      },
      { new: true },
    ).select('-passwordHash');

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    await this.auditService.log({
      userId: adminUser?.userId || 'admin',
      userEmail: adminUser?.email || 'admin@circuit.gov',
      action: 'REJECT_USER_ONBOARDING',
      resourceType: 'user',
      resourceId: userId,
      details: { rejectedUser: user.email, role: user.role },
    });

    return user;
  }
}

