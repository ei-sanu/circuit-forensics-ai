import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FirDocument = Fir & Document;

@Schema({ timestamps: true, collection: 'firs' })
export class Fir {
  @Prop({ required: true, unique: true, index: true, trim: true })
  firNumber: string; // e.g. "FIR-MUM-2026-0891"

  @Prop({ required: true, index: true, trim: true })
  policeStation: string; // e.g. "Colaba Cyber Crime PS"

  @Prop({ required: true, index: true, trim: true })
  district: string; // e.g. "Mumbai South"

  @Prop({ required: true, trim: true })
  inchargeOfficer: string; // e.g. "Inspector Vikram Shinde, SHO"

  @Prop({ required: true, trim: true })
  complainantName: string;

  @Prop({ trim: true })
  complainantPhone?: string;

  @Prop({ type: [String], default: [], index: true })
  accusedNames: string[]; // e.g. ["Vikram Rathore", "Sunil Verma"]

  @Prop({ type: [String], default: [] })
  ipcSections: string[]; // e.g. ["IPC 420 (Cheating)", "IPC 120B (Criminal Conspiracy)", "Hawala Act"]

  @Prop({ default: Date.now })
  incidentDate: Date;

  @Prop({ trim: true })
  incidentLocation: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  firCopyUrl?: string; // Cloudinary / Storage link

  @Prop()
  ocrExtractedText?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  ocrEntities?: Record<string, any>;

  @Prop({ type: [String], default: [] })
  matchedSuspectIds?: string[]; // IDs in entity registry

  @Prop({ default: 0 })
  matchedSyndicateRisk?: number;

  @Prop({ default: 'registered', enum: ['registered', 'under_investigation', 'chargesheet_filed', 'closed'], index: true })
  status: string;

  @Prop({ index: true })
  filedByUserId?: string;

  @Prop({ index: true })
  filedByStation?: string;
}

export const FirSchema = SchemaFactory.createForClass(Fir);
