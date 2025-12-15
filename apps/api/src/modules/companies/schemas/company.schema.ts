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

  // Advanced Notification Settings - Channel Configuration
  @Prop()
  smsApiKey?: string;

  @Prop()
  smsSenderId?: string;

  @Prop()
  whatsappApiKey?: string;

  @Prop()
  whatsappPhoneNumber?: string;

  @Prop()
  emailSmtpHost?: string;

  @Prop({ default: 587 })
  emailSmtpPort?: number;

  @Prop()
  emailSmtpUser?: string;

  @Prop()
  emailSmtpPassword?: string;

  @Prop()
  emailFromAddress?: string;

  @Prop()
  emailFromName?: string;

  // Advanced Notification Settings - Sending Schedule
  @Prop({ default: '08:00' })
  sendingStartTime?: string;

  @Prop({ default: '20:00' })
  sendingEndTime?: string;

  @Prop({ default: true })
  enableQuietHours?: boolean;

  @Prop({ default: '22:00' })
  quietHoursStart?: string;

  @Prop({ default: '08:00' })
  quietHoursEnd?: string;

  // Advanced Notification Settings - Retry Settings
  @Prop({ default: 3 })
  maxRetries?: number;

  @Prop({ default: 30 })
  retryIntervalMinutes?: number;

  @Prop({ default: 'log' })
  failureAction?: string; // 'log' | 'email_admin' | 'disable'

  // Advanced Invoice Customization
  @Prop({ default: true })
  showInvoiceHeader?: boolean;

  @Prop({ default: true })
  showInvoiceFooter?: boolean;

  @Prop({ default: true })
  showCustomerDetails?: boolean;

  @Prop({ default: true })
  showUnitDetails?: boolean;

  @Prop({ default: true })
  showContractDetails?: boolean;

  @Prop({ default: true })
  showPaymentTerms?: boolean;

  @Prop({ default: true })
  showTaxBreakdown?: boolean;

  @Prop({ default: 0 })
  defaultTaxRate?: number; // Default tax rate percentage

  @Prop({ default: false })
  enableDiscount?: boolean;

  @Prop({ default: 0 })
  defaultDiscountPercent?: number;

  @Prop()
  invoiceHeaderText?: string; // Custom header text

  @Prop()
  invoiceNotes?: string; // Default notes for invoices

  @Prop()
  paymentInstructions?: string; // Payment instructions text

  @Prop({ default: 'A4' })
  invoicePageSize?: string; // 'A4' | 'Letter' | 'A5'

  @Prop({ default: 'portrait' })
  invoiceOrientation?: string; // 'portrait' | 'landscape'

  // Meter Pricing Configuration
  @Prop({ default: 0 })
  electricityPricePerKwh?: number; // Price per kWh

  @Prop({ default: 0 })
  waterPricePerCubicMeter?: number; // Price per m³

  @Prop({ default: false })
  enableTieredPricing?: boolean; // Enable tiered/progressive pricing

  @Prop({ type: Object })
  electricityTiers?: {
    tier1?: { max: number; price: number };
    tier2?: { max: number; price: number };
    tier3?: { max: number; price: number };
  };

  @Prop({ type: Object })
  waterTiers?: {
    tier1?: { max: number; price: number };
    tier2?: { max: number; price: number };
    tier3?: { max: number; price: number };
  };

  @Prop({ default: 0 })
  electricityFixedCharge?: number; // Fixed monthly charge

  @Prop({ default: 0 })
  waterFixedCharge?: number; // Fixed monthly charge
}

export const CompanySchema = SchemaFactory.createForClass(Company);
