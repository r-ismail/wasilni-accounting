import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceLineDocument = InvoiceLine & Document;

@Schema({ timestamps: true })
export class InvoiceLine {
  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true, index: true })
  invoiceId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['rent', 'service', 'meter'],
    required: true,
  })
  type: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Meter' })
  meterId?: Types.ObjectId;
}

export const InvoiceLineSchema = SchemaFactory.createForClass(InvoiceLine);
