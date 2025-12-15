import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true })
  invoiceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  contractId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'cash' })
  paymentMethod: string; // cash only for now

  @Prop({ required: true })
  paymentDate: Date;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recordedBy: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes for performance
PaymentSchema.index({ companyId: 1, invoiceId: 1 });
PaymentSchema.index({ companyId: 1, contractId: 1 });
PaymentSchema.index({ companyId: 1, customerId: 1 });
PaymentSchema.index({ companyId: 1, paymentDate: -1 });
