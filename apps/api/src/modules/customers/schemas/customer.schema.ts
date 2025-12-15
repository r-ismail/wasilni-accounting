import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, enum: ['individual', 'company'] })
  type: 'individual' | 'company';

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop()
  idNumber?: string;

  @Prop()
  taxNumber?: string;

  @Prop()
  address?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Indexes
CustomerSchema.index({ companyId: 1, phone: 1 }, { unique: true });
CustomerSchema.index({ companyId: 1, name: 1 });
CustomerSchema.index({ companyId: 1, isActive: 1 });
