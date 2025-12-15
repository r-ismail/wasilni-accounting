# 🚀 المرحلة 2: معالج الإعداد الأولي (Setup Wizard)

## 🎯 الهدف

بناء معالج إعداد تفاعلي يظهر عند أول استخدام للنظام، يقوم بتهيئة:
- معلومات الشركة
- المباني والوحدات (مفروشة/غير مفروشة)
- الخدمات الافتراضية
- مستخدم الإدارة

---

## 📋 الخطوات المطلوبة

### **الخطوة 1: إعداد قاعدة البيانات**

#### Backend Schemas

**1. Building Schema** (`apps/api/src/modules/buildings/schemas/building.schema.ts`)
```typescript
{
  _id: ObjectId,
  companyId: ObjectId,
  name: string,
  address?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**2. Unit Schema** (`apps/api/src/modules/units/schemas/unit.schema.ts`)
```typescript
{
  _id: ObjectId,
  companyId: ObjectId,
  buildingId: ObjectId,
  unitNumber: string,
  furnishingStatus: 'furnished' | 'unfurnished',
  usageType: 'apartment' | 'hotel',
  defaultRentMonthly: number,
  defaultRentDaily?: number,
  status: 'available' | 'occupied',
  createdAt: Date,
  updatedAt: Date
}
```

**3. Service Schema** (`apps/api/src/modules/services/schemas/service.schema.ts`)
```typescript
{
  _id: ObjectId,
  companyId: ObjectId,
  name: string,
  type: 'metered' | 'fixed_fee',
  defaultPrice: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**4. Update Company Schema**
إضافة حقل `setupCompleted: boolean` للتحقق من إتمام الإعداد

---

### **الخطوة 2: Backend Modules**

#### 1. Buildings Module
- `buildings.module.ts`
- `buildings.service.ts`
- `buildings.controller.ts`
- `dto/create-building.dto.ts`

**Endpoints:**
- `POST /api/buildings` - إنشاء مبنى
- `GET /api/buildings` - قائمة المباني
- `GET /api/buildings/:id` - تفاصيل مبنى
- `PUT /api/buildings/:id` - تحديث مبنى
- `DELETE /api/buildings/:id` - حذف مبنى

#### 2. Units Module
- `units.module.ts`
- `units.service.ts`
- `units.controller.ts`
- `dto/create-unit.dto.ts`
- `dto/bulk-create-units.dto.ts`

**Endpoints:**
- `POST /api/units` - إنشاء وحدة
- `POST /api/units/bulk` - إنشاء وحدات بالجملة
- `GET /api/units` - قائمة الوحدات (مع فلترة)
- `GET /api/units/:id` - تفاصيل وحدة
- `PUT /api/units/:id` - تحديث وحدة
- `DELETE /api/units/:id` - حذف وحدة

#### 3. Services Module
- `services.module.ts`
- `services.service.ts`
- `services.controller.ts`
- `dto/create-service.dto.ts`

**Endpoints:**
- `POST /api/services` - إنشاء خدمة
- `GET /api/services` - قائمة الخدمات
- `PUT /api/services/:id` - تحديث خدمة
- `DELETE /api/services/:id` - حذف خدمة

#### 4. Setup Module
- `setup.module.ts`
- `setup.service.ts`
- `setup.controller.ts`
- `dto/run-setup.dto.ts`

**Endpoints:**
- `GET /api/setup/status` - حالة الإعداد
- `POST /api/setup/run` - تشغيل معالج الإعداد

**Setup DTO Structure:**
```typescript
{
  // Step 1: Company Info
  company: {
    name: string,
    currency: string,
    defaultLanguage: 'ar' | 'en',
    mergeServicesWithRent: boolean
  },
  
  // Step 2: Buildings & Units
  buildings: [
    {
      name: string,
      address?: string,
      furnishedUnits: {
        count: number,
        startNumber: number,
        defaultRentMonthly: number,
        defaultRentDaily?: number
      },
      unfurnishedUnits: {
        count: number,
        startNumber: number,
        defaultRentMonthly: number,
        defaultRentDaily?: number
      }
    }
  ],
  
  // Step 3: Default Services
  services: [
    {
      name: string,
      type: 'metered' | 'fixed_fee',
      defaultPrice: number
    }
  ],
  
  // Step 4: Admin User
  adminUser: {
    username: string,
    password: string
  }
}
```

---

### **الخطوة 3: Frontend Components**

#### 1. Setup Wizard Component
**المسار**: `apps/web/src/pages/Setup/SetupWizard.tsx`

**الميزات:**
- Multi-step wizard (4 خطوات)
- Progress indicator
- Form validation
- Navigation (Next/Back/Finish)
- RTL/LTR support

#### 2. Step Components

**Step 1: Company Information**
`apps/web/src/pages/Setup/steps/CompanyInfoStep.tsx`
- اسم الشركة (مطلوب)
- العملة (قائمة منسدلة: SAR, USD, EUR, AED, EGP)
- اللغة الافتراضية (عربي/إنجليزي)
- دمج الخدمات مع الإيجار (نعم/لا)

**Step 2: Buildings & Units**
`apps/web/src/pages/Setup/steps/BuildingsUnitsStep.tsx`
- إضافة مبنى واحد أو أكثر
- لكل مبنى:
  - الاسم (مطلوب)
  - العنوان (اختياري)
  - **الوحدات المفروشة:**
    - العدد
    - رقم البداية
    - الإيجار الشهري الافتراضي
    - الإيجار اليومي (اختياري)
  - **الوحدات غير المفروشة:**
    - نفس الحقول أعلاه

**Step 3: Default Services**
`apps/web/src/pages/Setup/steps/ServicesStep.tsx`
- خدمات افتراضية مع إمكانية التعديل:
  - ماء (Metered)
  - كهرباء (Metered)
  - إنترنت (Fixed Fee)
- إضافة خدمات إضافية

**Step 4: Admin User**
`apps/web/src/pages/Setup/steps/AdminUserStep.tsx`
- اسم المستخدم (مطلوب)
- كلمة المرور (مطلوب، 8 أحرف على الأقل)
- تأكيد كلمة المرور

#### 3. Setup Check
**المسار**: `apps/web/src/components/SetupCheck.tsx`

**الوظيفة:**
- يتحقق من حالة الإعداد عند تحميل التطبيق
- إذا لم يكتمل الإعداد → توجيه إلى `/setup`
- إذا اكتمل الإعداد → السماح بالوصول للنظام

---

### **الخطوة 4: Translations**

#### إضافة الترجمات للمعالج

**English** (`apps/web/src/i18n/locales/en.json`)
```json
{
  "setup": {
    "title": "Initial Setup",
    "subtitle": "Let's set up your property management system",
    "step1": "Company Information",
    "step2": "Buildings & Units",
    "step3": "Default Services",
    "step4": "Admin User",
    "companyName": "Company Name",
    "currency": "Currency",
    "defaultLanguage": "Default Language",
    "mergeServices": "Merge services with rent invoices",
    "buildingName": "Building Name",
    "address": "Address",
    "furnishedUnits": "Furnished Units",
    "unfurnishedUnits": "Unfurnished Units",
    "unitCount": "Number of Units",
    "startNumber": "Starting Number",
    "monthlyRent": "Monthly Rent",
    "dailyRent": "Daily Rent (Optional)",
    "serviceName": "Service Name",
    "serviceType": "Service Type",
    "defaultPrice": "Default Price",
    "metered": "Metered",
    "fixedFee": "Fixed Fee",
    "adminUsername": "Admin Username",
    "adminPassword": "Admin Password",
    "confirmPassword": "Confirm Password",
    "addBuilding": "Add Building",
    "addService": "Add Service",
    "complete": "Complete Setup",
    "setupSuccess": "Setup completed successfully!",
    "redirecting": "Redirecting to dashboard..."
  }
}
```

**Arabic** (`apps/web/src/i18n/locales/ar.json`)
- نفس المفاتيح بالترجمة العربية

---

### **الخطوة 5: Validation**

#### Backend Validation
- استخدام `class-validator` على جميع DTOs
- التحقق من:
  - الحقول المطلوبة
  - صيغة البيانات
  - القيم الرقمية (موجبة)
  - عدم تكرار أسماء المباني
  - قوة كلمة المرور

#### Frontend Validation
- استخدام `Zod` مع `React Hook Form`
- التحقق الفوري (Real-time validation)
- رسائل خطأ واضحة بالعربية والإنجليزية

---

### **الخطوة 6: Testing**

#### Backend Tests
```bash
# Test setup status endpoint
GET /api/setup/status

# Test setup wizard
POST /api/setup/run
{
  "company": {...},
  "buildings": [...],
  "services": [...],
  "adminUser": {...}
}
```

#### Frontend Tests
1. فتح `/setup` بعد تسجيل الدخول كـ super admin
2. إكمال جميع الخطوات
3. التحقق من إنشاء البيانات في قاعدة البيانات
4. التحقق من التوجيه إلى Dashboard
5. التحقق من عدم إمكانية الوصول لـ `/setup` بعد الإكمال

---

## 🎯 معايير النجاح

- ✅ جميع Schemas تعمل بدون أخطاء
- ✅ جميع API Endpoints تعمل
- ✅ المعالج يظهر بشكل احترافي
- ✅ جميع الخطوات قابلة للملء
- ✅ Validation يعمل على Frontend و Backend
- ✅ إنشاء البيانات في قاعدة البيانات بنجاح
- ✅ التوجيه التلقائي بعد الإكمال
- ✅ دعم كامل للعربية والإنجليزية
- ✅ RTL/LTR يعمل بشكل صحيح
- ✅ صفر أخطاء في Console

---

## 📦 الملفات المطلوبة

### Backend (NestJS)
```
apps/api/src/modules/
├── buildings/
│   ├── schemas/building.schema.ts
│   ├── dto/create-building.dto.ts
│   ├── buildings.module.ts
│   ├── buildings.service.ts
│   └── buildings.controller.ts
├── units/
│   ├── schemas/unit.schema.ts
│   ├── dto/create-unit.dto.ts
│   ├── dto/bulk-create-units.dto.ts
│   ├── units.module.ts
│   ├── units.service.ts
│   └── units.controller.ts
├── services/
│   ├── schemas/service.schema.ts
│   ├── dto/create-service.dto.ts
│   ├── services.module.ts
│   ├── services.service.ts
│   └── services.controller.ts
└── setup/
    ├── dto/run-setup.dto.ts
    ├── setup.module.ts
    ├── setup.service.ts
    └── setup.controller.ts
```

### Frontend (React)
```
apps/web/src/
├── pages/
│   └── Setup/
│       ├── SetupWizard.tsx
│       └── steps/
│           ├── CompanyInfoStep.tsx
│           ├── BuildingsUnitsStep.tsx
│           ├── ServicesStep.tsx
│           └── AdminUserStep.tsx
├── components/
│   └── SetupCheck.tsx
└── i18n/locales/
    ├── en.json (updated)
    └── ar.json (updated)
```

---

## ⏱️ الوقت المتوقع

- **Backend**: 2-3 ساعات
- **Frontend**: 3-4 ساعات
- **Testing**: 1 ساعة
- **الإجمالي**: 6-8 ساعات

---

## 🚀 هل نبدأ؟

سأقوم بتنفيذ المرحلة 2 بالكامل خطوة بخطوة، مع التأكد من عمل كل جزء قبل الانتقال للتالي.

**الترتيب:**
1. ✅ Backend Schemas
2. ✅ Backend Modules & Services
3. ✅ Backend Controllers & Endpoints
4. ✅ Frontend Setup Wizard
5. ✅ Frontend Step Components
6. ✅ Translations
7. ✅ Testing
8. ✅ Commit to GitHub

**هل تريد البدء الآن؟** 🚀
