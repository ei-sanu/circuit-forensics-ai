import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CaseDocument = Case & Document;

@Schema({ timestamps: true, collection: 'cases' })
export class Case {
  @Prop({ required: true, unique: true, index: true })
  caseNumber: string; // e.g. CR-2026-00124

  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'active', index: true })
  status: string; // 'active' | 'under_review' | 'closed' | 'archived'

  @Prop({ default: 'medium', index: true })
  priority: string; // 'low' | 'medium' | 'high' | 'critical'

  @Prop({ type: [String], default: [] })
  leadInvestigators: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  entityIds: string[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, any>;
}

export const CaseSchema = SchemaFactory.createForClass(Case);
