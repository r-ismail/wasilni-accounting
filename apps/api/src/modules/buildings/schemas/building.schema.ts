import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BuildingType {
  APARTMENT = 'apartment',
  HOTEL = 'hotel',
}

@Schema({ timestamps: true })
export class Building extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ enum: Object.values(BuildingType), default: BuildingType.APARTMENT })
  buildingType: BuildingType;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }], default: [] })
  services?: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BuildingSchema = SchemaFactory.createForClass(Building);

// Indexes for multi-tenant queries
BuildingSchema.index({ companyId: 1, name: 1 });
