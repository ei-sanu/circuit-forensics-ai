import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BiometricCredentialDocument = BiometricCredential & Document;

@Schema({ timestamps: true, collection: 'biometric_credentials' })
export class BiometricCredential {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ required: true, index: true, lowercase: true, trim: true })
  userEmail: string;

  @Prop({ required: true })
  encryptedTemplate: string; // Authenticated ciphertext format: "iv:authTag:encryptedData"

  @Prop({ required: true, default: 'AES-256-GCM' })
  algorithm: string;

  @Prop({ required: true, default: 'circuit-facenet-v1' })
  modelVersion: string;

  @Prop({ required: true, default: 1 })
  enrollmentVersion: number;

  @Prop({ required: true, default: 'active', enum: ['active', 'revoked', 'suspended'] })
  status: string;

  @Prop({ default: 'self' })
  enrolledBy: string;

  @Prop({ default: 95.0 })
  qualityScore: number;

  @Prop()
  lastVerifiedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BiometricCredentialSchema = SchemaFactory.createForClass(BiometricCredential);
BiometricCredentialSchema.index({ userEmail: 1, status: 1 });
