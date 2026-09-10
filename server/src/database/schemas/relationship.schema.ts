import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RelationshipDocument = Relationship & Document;

@Schema({ timestamps: true, collection: 'relationships' })
export class Relationship {
  @Prop({ required: true, index: true })
  sourceId: string; // Source entity ID (e.g. P-0001)

  @Prop({ required: true, index: true })
  targetId: string; // Target entity ID (e.g. O-0001)

  @Prop({ required: true, index: true })
  relType: string; // 'uses_phone', 'drives_vehicle', 'transferred_money', 'associate_of', 'director_of', 'called'

  @Prop({ default: 1 })
  weight: number;

  @Prop({ default: 0.0 })
  totalAmount: number;

  @Prop({ default: 1.0, min: 0.0, max: 1.0 })
  confidence: number;

  @Prop({ default: 'explicit' })
  sourceType: string; // 'explicit' | 'cdr' | 'financial' | 'ai_inferred'

  @Prop({ default: false, index: true })
  isAiInferred: boolean;

  @Prop({ type: [String], default: [] })
  evidenceIds: string[];

  @Prop({ index: true })
  caseId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  properties: Record<string, any>;
}

export const RelationshipSchema = SchemaFactory.createForClass(Relationship);
RelationshipSchema.index({ sourceId: 1, targetId: 1, relType: 1 });
