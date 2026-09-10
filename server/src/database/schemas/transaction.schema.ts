import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ required: true, unique: true, index: true })
  transactionId: string;

  @Prop({ required: true, index: true })
  fromType: string;

  @Prop({ required: true, index: true })
  fromId: string;

  @Prop({ required: true, index: true })
  toType: string;

  @Prop({ required: true, index: true })
  toId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ default: 'bank_transfer' })
  channel: string;

  @Prop({ default: false, index: true })
  isFlagged: boolean;

  @Prop({ index: true })
  caseId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ fromId: 1, toId: 1, timestamp: -1 });
