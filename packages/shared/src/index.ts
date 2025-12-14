// Enums
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
}

export enum RentType {
  MONTHLY = 'monthly',
  DAILY = 'daily',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  PAID = 'paid',
}

export enum InvoiceLineType {
  RENT = 'rent',
  SERVICE = 'service',
  METER = 'meter',
}

export enum ServiceType {
  METERED = 'metered',
  FIXED = 'fixed',
}

export enum Language {
  AR = 'ar',
  EN = 'en',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

// Base Types
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MultiTenantEntity extends BaseEntity {
  companyId: string;
}

// DTOs
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
    companyId?: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface CreateCompanyDto {
  name: string;
  currency: string;
  defaultLanguage: Language;
  mergeServicesWithRent: boolean;
}

export interface CreateBuildingDto {
  name: string;
  address?: string;
  companyId: string;
}

export interface CreateUnitDto {
  buildingId: string;
  unitNumber: string;
  furnishingStatus: FurnishingStatus;
  usageType: UsageType;
  defaultRentMonthly: number;
  defaultRentDaily?: number;
}

export interface CreateCustomerDto {
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
}

export interface CreateContractDto {
  companyId: string;
  unitId: string;
  customerId: string;
  rentType: RentType;
  baseRentAmount: number;
  startDate: Date;
  endDate?: Date;
}

export interface CreateServiceDto {
  companyId: string;
  name: string;
  type: ServiceType;
  defaultPrice?: number;
  pricePerUnit?: number;
}

export interface GenerateInvoiceDto {
  contractId: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface CreatePaymentDto {
  companyId: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  notes?: string;
}

export interface CreateMeterReadingDto {
  companyId: string;
  meterId: string;
  reading: number;
  readingDate: Date;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}
