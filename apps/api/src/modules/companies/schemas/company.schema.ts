import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Language, Currency } from '@aqarat/shared';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Object.values(Currency) })
  currency: Currency;

  @Prop({ required: true, enum: Object.values(Language) })
  defaultLanguage: Language;

  @Prop({ required: true, default: false })
  mergeServicesWithRent: boolean;

  @Prop()
  logo?: string; // URL or base64 encoded image

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  setupCompleted: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
