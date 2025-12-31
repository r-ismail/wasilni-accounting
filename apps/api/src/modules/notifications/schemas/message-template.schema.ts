import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from './notification.schema';

export type MessageTemplateDocument = MessageTemplate & Document;

export enum TemplateType {
  PAYMENT_REMINDER = 'payment_reminder',
  PAYMENT_RECEIVED = 'payment_received',
  INVOICE_GENERATED = 'invoice_generated',
  CONTRACT_EXPIRING = 'contract_expiring',
  OVERDUE_NOTICE = 'overdue_notice',
}

@Schema({ timestamps: true })
export class MessageTemplate {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(TemplateType) })
  type: TemplateType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  subject?: string; // For emails

  @Prop({ required: true })
  body: string;

  @Prop({ type: [String], default: [] })
  variables: string[]; // e.g., ['customerName', 'invoiceNumber', 'amount']

  @Prop({
    type: [String],
    enum: Object.values(NotificationType),
    default: [NotificationType.SMS],
  })
  channels: NotificationType[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean; // System default templates
}

export const MessageTemplateSchema =
  SchemaFactory.createForClass(MessageTemplate);

// Indexes
MessageTemplateSchema.index({ companyId: 1, type: 1 });
MessageTemplateSchema.index({ isDefault: 1 });
