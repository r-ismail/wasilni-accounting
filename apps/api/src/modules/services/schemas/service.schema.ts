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

  // Additional customization fields
  @Prop()
  nameAr?: string; // Arabic name

  @Prop()
  nameEn?: string; // English name

  @Prop()
  description?: string; // Service description

  @Prop()
  unit?: string; // Unit of measurement (e.g., 'month', 'kWh', 'm³', 'day')

  @Prop({ default: 0 })
  taxRate?: number; // Tax rate percentage for this service

  @Prop({ default: false })
  taxable?: boolean; // Whether this service is taxable

  @Prop({ default: 0 })
  minCharge?: number; // Minimum charge for this service

  @Prop({ default: 0 })
  maxCharge?: number; // Maximum charge for this service (0 = no limit)

  @Prop()
  category?: string; // Service category (e.g., 'utilities', 'maintenance', 'amenities')

  @Prop({ default: false })
  requiresApproval?: boolean; // Whether adding this service requires approval

  @Prop({ default: 1 })
  displayOrder?: number; // Order in which to display in lists

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Indexes for multi-tenant queries
ServiceSchema.index({ companyId: 1, name: 1 });
ServiceSchema.index({ companyId: 1, isActive: 1 });
