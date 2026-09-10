import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  userEmail: string;

  @Prop({ required: true, index: true })
  action: string; // 'CREATE_CASE', 'COMMIT_AI_DOCUMENT', 'DELETE_ENTITY', etc.

  @Prop({ required: true, index: true })
  resourceType: string; // 'case', 'entity', 'document', 'relationship', 'alert'

  @Prop({ required: true, index: true })
  resourceId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  details: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
