import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: true, collection: 'alerts' })
export class Alert {
  @Prop({ required: true, unique: true, index: true })
  alertId: string;

  @Prop({ required: true, index: true })
  detectorName: string;

  @Prop({ required: true, index: true })
  severity: string; // 'low' | 'medium' | 'high' | 'critical'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  explanation: string;

  @Prop({ default: 0.9 })
  confidence: number;

  @Prop({ default: 'open', index: true })
  status: string; // 'open' | 'investigating' | 'dismissed' | 'confirmed'

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  entities: Array<Record<string, any>>;

  @Prop({ type: [String], default: [] })
  evidenceIds: string[];

  @Prop({ index: true })
  caseId?: string;

  @Prop()
  methodology: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, any>;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
