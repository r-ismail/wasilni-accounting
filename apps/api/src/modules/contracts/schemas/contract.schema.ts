import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContractDocument = Contract & Document;

@Schema({ timestamps: true })
export class Contract {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Unit', index: true })
  unitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Customer', index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, enum: ['monthly', 'daily'] })
  rentType: 'monthly' | 'daily';

  @Prop({ required: true })
  baseRentAmount: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);

// Indexes
ContractSchema.index({ companyId: 1, unitId: 1, isActive: 1 });
ContractSchema.index({ companyId: 1, customerId: 1 });
ContractSchema.index({ companyId: 1, startDate: 1, endDate: 1 });
