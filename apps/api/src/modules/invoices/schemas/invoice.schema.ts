import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true, index: true })
  contractId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  invoiceNumber: string;

  @Prop({ required: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  @Prop({ required: true })
  issueDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({
    type: String,
    enum: ['draft', 'posted', 'paid', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop()
  notes?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Compound index to prevent duplicate invoices for same contract and period
InvoiceSchema.index({ companyId: 1, contractId: 1, periodStart: 1 }, { unique: true });
