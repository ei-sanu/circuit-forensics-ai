import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EntityDocument = Entity & Document;

@Schema({ timestamps: true, collection: 'entities' })
export class Entity {
  @Prop({ required: true, unique: true, index: true })
  entityId: string; // e.g. P-0001, O-0001, PH-0001, V-0001, L-0001

  @Prop({ required: true, index: true })
  type: string; // 'person' | 'organization' | 'phone' | 'vehicle' | 'location' | 'event'

  @Prop({ required: true, index: true, trim: true })
  label: string; // Primary name or formatted identifier

  @Prop({ type: [String], default: [], index: true })
  aliases: string[];

  @Prop({ default: false, index: true })
  riskFlag: boolean;

  @Prop({ default: 0.0 })
  influenceScore: number;

  @Prop({ type: [String], default: [], index: true })
  cases: string[]; // Associated case IDs

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  properties: Record<string, any>; // Polymorphic: phone carrier, vehicle make/plate, coordinates, etc.

  @Prop({ default: 'user' })
  source: string; // 'user' | 'document_extract' | 'synthetic_seed'
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
EntitySchema.index({ label: 'text', aliases: 'text' });
