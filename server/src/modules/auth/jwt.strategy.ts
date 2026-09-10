import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'super-secret-jwt-circuit-key',
    });
  }

  async validate(payload: { sub: string; email: string; role: string; name?: string }) {
    let user: UserDocument | null = null;
    try {
      if (payload.sub && /^[0-9a-fA-F]{24}$/.test(payload.sub)) {
        user = await this.userModel.findById(payload.sub).exec();
      } else if (payload.email) {
        user = await this.userModel.findOne({ email: payload.email.toLowerCase() }).exec();
      }
    } catch {
      // Catch cast errors or connection hiccups
    }

    if (user && user.isActive) {
      return {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    if (payload.email) {
      return {
        userId: payload.sub || 'usr-default',
        email: payload.email,
        name: payload.name || 'Investigator',
        role: payload.role || 'investigator',
      };
    }

    throw new UnauthorizedException('User is inactive or token has been revoked');
  }
}
