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

  // Brand Colors
  @Prop({ default: '#1976d2' })
  primaryColor?: string;

  @Prop({ default: '#dc004e' })
  secondaryColor?: string;

  @Prop({ default: '#2e7d32' })
  accentColor?: string;

  // Invoice Layout
  @Prop({ default: 'modern' })
  invoiceTemplate?: string; // 'modern' | 'classic' | 'minimal'

  @Prop({ default: true })
  showInvoiceLogo?: boolean;

  @Prop({ default: true })
  showInvoiceColors?: boolean;

  @Prop({ default: 'right' })
  invoiceLogoPosition?: string; // 'left' | 'right' | 'center'

  @Prop()
  invoiceFooterText?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  setupCompleted: boolean;

  // Advanced Settings - Invoice Customization
  @Prop({ type: [String], default: [] })
  mergedServices?: string[]; // Array of service IDs to merge automatically

  @Prop({ default: true })
  showServiceDetails?: boolean; // Show individual service line items

  @Prop({ default: 'service-rent-meter' })
  invoiceItemOrder?: string; // Order of items in invoice

  @Prop()
  customInvoiceDescription?: string; // Custom description for merged items

  // Advanced Settings - Number & Date Formatting
  @Prop({ default: 'DD/MM/YYYY' })
  dateFormat?: string; // Date format preference

  @Prop({ default: ',' })
  thousandsSeparator?: string; // Thousands separator

  @Prop({ default: 2 })
  decimalPlaces?: number; // Decimal places for amounts

  @Prop({ default: 'before' })
  currencyPosition?: string; // 'before' | 'after'

  // Advanced Settings - Automatic Notifications
  @Prop({ default: true })
  autoSendInvoice?: boolean; // Send invoice automatically on creation

  @Prop({ default: 3 })
  reminderDaysBefore?: number; // Days before due date to send reminder

  @Prop({ default: 1 })
  overdueNotificationDays?: number; // Days after due date to send overdue notice

  @Prop({ default: true })
  sendPaymentConfirmation?: boolean; // Send confirmation on payment received

  // Advanced Settings - Contract Settings
  @Prop({ default: false })
  autoRenewContracts?: boolean; // Automatically renew contracts

  @Prop({ default: 30 })
  contractExpiryNoticeDays?: number; // Days before expiry to notify

  @Prop({ default: 0 })
  defaultRenewalIncreasePercent?: number; // Default increase % on renewal

  // Advanced Settings - System Preferences
  @Prop({ default: 25 })
  defaultPageSize?: number; // Default rows per page in tables

  @Prop({ default: '/dashboard' })
  defaultLandingPage?: string; // Page to show after login

  @Prop({ default: 480 })
  sessionTimeoutMinutes?: number; // Session timeout in minutes
}

export const CompanySchema = SchemaFactory.createForClass(Company);
