export declare enum FurnishingStatus {
    FURNISHED = "furnished",
    UNFURNISHED = "unfurnished"
}
export declare enum UsageType {
    APARTMENT = "apartment",
    HOTEL = "hotel"
}
export declare enum UnitStatus {
    AVAILABLE = "available",
    OCCUPIED = "occupied"
}
export declare enum RentType {
    MONTHLY = "monthly",
    DAILY = "daily"
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    POSTED = "posted",
    PAID = "paid"
}
export declare enum InvoiceLineType {
    RENT = "rent",
    SERVICE = "service",
    METER = "meter"
}
export declare enum ServiceType {
    METERED = "metered",
    FIXED = "fixed"
}
export declare enum Language {
    AR = "ar",
    EN = "en"
}
export declare enum Currency {
    SAR = "SAR",
    YER = "YER",
    USD = "USD",
    EUR = "EUR"
}
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    USER = "user"
}
export interface BaseEntity {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface MultiTenantEntity extends BaseEntity {
    companyId: string;
}
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
    currency: Currency;
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
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any[];
}
