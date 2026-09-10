import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongoDoc, Schema as MongooseSchema } from 'mongoose';

export type CaseDocumentDocument = CaseDocument & MongoDoc;

@Schema({ timestamps: true, collection: 'documents' })
export class CaseDocument {
  @Prop({ required: true, unique: true, index: true })
  documentId: string;

  @Prop({ index: true })
  caseId?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  r2Key: string; // Cloudflare R2 Storage object key

  @Prop()
  r2Url?: string; // Pre-signed or storage URL

  @Prop({ default: '' })
  rawText: string;

  @Prop({ default: 'uploaded', index: true })
  status: string; // 'uploaded' | 'extracted' | 'reviewed' | 'committed'

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  extractedEntities: Array<Record<string, any>>;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  proposedRelationships: Array<Record<string, any>>;

  @Prop({ index: true })
  uploadedBy?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, any>;
}

export const CaseDocumentSchema = SchemaFactory.createForClass(CaseDocument);
