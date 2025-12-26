import { z } from 'zod';

// Step 1: Company Information
export const companyInfoSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  defaultLanguage: z.enum(['ar', 'en'], {
    required_error: 'Default language is required',
  }),
  mergeServicesWithRent: z.boolean(),
});

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;

// Units Configuration
export const unitsConfigSchema = z.object({
  count: z.number().min(0, 'Count must be 0 or more'),
  startNumber: z.number().min(1, 'Start number must be at least 1'),
  defaultRentMonthly: z.number().min(0, 'Monthly rent must be 0 or more'),
  defaultRentDaily: z.number().min(0, 'Daily rent must be 0 or more').optional(),
});

// Step 2: Buildings & Units
export const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required'),
  address: z.string().optional(),
  buildingType: z.enum(['apartment', 'hotel']).default('apartment'),
  furnishedUnits: unitsConfigSchema,
  unfurnishedUnits: unitsConfigSchema,
});

export const buildingsUnitsSchema = z.object({
  buildings: z.array(buildingSchema).min(1, 'At least one building is required'),
});

export type BuildingsUnitsFormData = z.infer<typeof buildingsUnitsSchema>;
export type BuildingFormData = z.infer<typeof buildingSchema>;

// Step 3: Default Services
export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  type: z.enum(['metered', 'fixed_fee'], {
    required_error: 'Service type is required',
  }),
  defaultPrice: z.number().min(0, 'Price must be 0 or more'),
});

export const servicesSchema = z.object({
  services: z.array(serviceSchema).min(1, 'At least one service is required'),
});

export type ServicesFormData = z.infer<typeof servicesSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;

// Step 4: Admin User
export const adminUserSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type AdminUserFormData = z.infer<typeof adminUserSchema>;

// Complete Setup Data
export const completeSetupSchema = z.object({
  company: companyInfoSchema,
  buildings: z.array(buildingSchema),
  services: z.array(serviceSchema),
  adminUser: z.object({
    username: z.string(),
    password: z.string(),
  }),
});

export type CompleteSetupData = z.infer<typeof completeSetupSchema>;
