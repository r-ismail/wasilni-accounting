import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ServiceType {
  METERED = 'metered',
  FIXED_FEE = 'fixed_fee',
}

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    type: String,
    enum: Object.values(ServiceType),
    required: true,
  })
  type: ServiceType;

  @Prop({ required: true, min: 0 })
  defaultPrice: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Indexes for multi-tenant queries
ServiceSchema.index({ companyId: 1, name: 1 });
ServiceSchema.index({ companyId: 1, isActive: 1 });
