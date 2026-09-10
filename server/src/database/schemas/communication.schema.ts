import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CommunicationDocument = Communication & Document;

@Schema({ timestamps: true, collection: 'communications' })
export class Communication {
  @Prop({ required: true, unique: true, index: true })
  communicationId: string;

  @Prop({ required: true, index: true })
  fromNumber: string;

  @Prop({ required: true, index: true })
  toNumber: string;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ default: 0 })
  durationSeconds: number;

  @Prop({ index: true })
  towerId?: string;

  @Prop({ index: true })
  fromPersonId?: string;

  @Prop({ index: true })
  toPersonId?: string;

  @Prop({ default: 'voice_call' })
  commType: string; // 'voice_call' | 'sms' | 'voip'

  @Prop({ index: true })
  caseId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, any>;
}

export const CommunicationSchema = SchemaFactory.createForClass(Communication);
CommunicationSchema.index({ fromNumber: 1, toNumber: 1, timestamp: -1 });
