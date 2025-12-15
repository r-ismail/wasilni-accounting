import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeterDocument = Meter & Document;

@Schema({ timestamps: true })
export class Meter {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Building', index: true })
  buildingId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Unit', index: true })
  unitId?: Types.ObjectId;

  @Prop({ required: true })
  meterNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ required: true, enum: ['building', 'unit'] })
  type: 'building' | 'unit';

  @Prop({ default: true })
  isActive: boolean;
}

export const MeterSchema = SchemaFactory.createForClass(Meter);

MeterSchema.index({ companyId: 1, meterNumber: 1 }, { unique: true });
