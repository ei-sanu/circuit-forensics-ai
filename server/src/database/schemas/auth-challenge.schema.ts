import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthChallengeDocument = AuthChallenge & Document;

@Schema({ timestamps: true, collection: 'auth_challenges' })
export class AuthChallenge {
  @Prop({ required: true, unique: true, index: true })
  challengeId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true, lowercase: true, trim: true })
  userEmail: string;

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop({ required: true, default: 3 })
  maxAttempts: number;

  @Prop({ required: true, default: false })
  isUsed: boolean;

  @Prop({ required: true, default: false })
  isLocked: boolean;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: [String], default: ['FACE_BIOMETRIC'] })
  requiredFactors: string[];

  @Prop({ type: [String], default: [] })
  completedFactors: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const AuthChallengeSchema = SchemaFactory.createForClass(AuthChallenge);
AuthChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
