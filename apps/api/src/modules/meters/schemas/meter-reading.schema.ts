import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeterReadingDocument = MeterReading & Document;

@Schema({ timestamps: true })
export class MeterReading {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Meter', required: true, index: true })
  meterId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  readingDate: Date;

  @Prop({ required: true })
  currentReading: number;

  @Prop()
  previousReading?: number;

  @Prop()
  consumption?: number;

  @Prop()
  notes?: string;
}

export const MeterReadingSchema = SchemaFactory.createForClass(MeterReading);

MeterReadingSchema.index({ companyId: 1, meterId: 1, readingDate: 1 }, { unique: true });
