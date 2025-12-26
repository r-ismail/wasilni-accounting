import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
    @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
    companyId: Types.ObjectId;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    category: string; // e.g., 'Maintenance', 'Utilities', 'Salaries', 'Insurance'

    @Prop({ type: Types.ObjectId, ref: 'Vendor' })
    vendorId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Building' })
    buildingId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Unit' })
    unitId?: Types.ObjectId;

    @Prop()
    description?: string;

    @Prop({ default: 'cash' })
    paymentMethod: string; // 'cash', 'bank_transfer', 'check', 'credit_card'

    @Prop()
    referenceNumber?: string; // e.g., Check number, Transaction ID

    @Prop()
    invoiceNumber?: string; // Vendor's invoice number

    @Prop({ type: [String] })
    attachments?: string[]; // URLs to receipt images/PDFs

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    recordedBy: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.index({ companyId: 1, date: -1 });
ExpenseSchema.index({ companyId: 1, vendorId: 1 });
ExpenseSchema.index({ companyId: 1, buildingId: 1 });
