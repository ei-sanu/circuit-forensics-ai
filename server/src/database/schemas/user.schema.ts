import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: Role, default: Role.INVESTIGATOR })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'approved', enum: ['pending_approval', 'approved', 'rejected'] })
  status: string;

  @Prop()
  department?: string;

  @Prop()
  badgeNumber?: string;

  @Prop()
  district?: string;

  @Prop()
  stationName?: string;

  @Prop()
  inchargeRank?: string; // e.g. "Senior Inspector", "SHO", "DSP", "Superintendent of Police"

  @Prop()
  inchargeName?: string;

  @Prop()
  phone?: string;

  @Prop({ default: false })
  createdByHr?: boolean;

  @Prop({ default: true })
  reviewedByAdmin?: boolean;

  @Prop()
  reviewedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

