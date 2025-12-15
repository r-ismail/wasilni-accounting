import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FurnishingStatus {
  FURNISHED = 'furnished',
  UNFURNISHED = 'unfurnished',
}

export enum UsageType {
  APARTMENT = 'apartment',
  HOTEL = 'hotel',
}

export enum UnitStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Schema({ timestamps: true })
export class Unit extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Building', required: true, index: true })
  buildingId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  unitNumber: string;

  @Prop({
    type: String,
    enum: Object.values(FurnishingStatus),
    required: true,
  })
  furnishingStatus: FurnishingStatus;

  @Prop({
    type: String,
    enum: Object.values(UsageType),
    default: UsageType.APARTMENT,
  })
  usageType: UsageType;

  @Prop({ required: true, min: 0 })
  defaultRentMonthly: number;

  @Prop({ min: 0 })
  defaultRentDaily?: number;

  @Prop({
    type: String,
    enum: Object.values(UnitStatus),
    default: UnitStatus.AVAILABLE,
  })
  status: UnitStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

// Indexes for multi-tenant queries and filtering
UnitSchema.index({ companyId: 1, buildingId: 1 });
UnitSchema.index({ companyId: 1, status: 1 });
UnitSchema.index({ companyId: 1, furnishingStatus: 1 });
UnitSchema.index({ companyId: 1, unitNumber: 1 }, { unique: true });
