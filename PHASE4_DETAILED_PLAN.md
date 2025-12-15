# المرحلة 4: Invoice Service - خطة التنفيذ التفصيلية

## 🎯 الهدف الرئيسي

بناء نظام الفواتير الآلي - القلب المحاسبي للنظام - مع إمكانية توليد الفواتير تلقائياً، دمج الخدمات، منع التكرار، وتوليد PDF.

---

## 📋 الخطوات الفرعية (7 خطوات)

### **المرحلة 4.1: Backend - Invoice Schema & DTOs** ⏱️ 30 دقيقة

**الهدف:** إنشاء نموذج البيانات الأساسي للفواتير

**المخرجات:**
1. **Invoice Schema** (`apps/api/src/modules/invoices/schemas/invoice.schema.ts`)
   ```typescript
   {
     _id: ObjectId,
     companyId: ObjectId,
     contractId: ObjectId (ref: Contract),
     invoiceNumber: string (auto-generated),
     periodStart: Date,
     periodEnd: Date,
     issueDate: Date,
     dueDate: Date,
     status: 'draft' | 'posted' | 'paid' | 'cancelled',
     totalAmount: number,
     paidAmount: number,
     notes?: string,
     createdAt: Date,
     updatedAt: Date
   }
   ```

2. **InvoiceLine Schema** (`apps/api/src/modules/invoices/schemas/invoice-line.schema.ts`)
   ```typescript
   {
     _id: ObjectId,
     invoiceId: ObjectId (ref: Invoice),
     type: 'rent' | 'service' | 'meter',
     description: string,
     quantity: number,
     unitPrice: number,
     amount: number (calculated: quantity * unitPrice),
     serviceId?: ObjectId (ref: Service),
     meterId?: ObjectId (ref: Meter)
   }
   ```

3. **DTOs:**
   - `GenerateInvoiceDto` - لتوليد فاتورة جديدة
   - `UpdateInvoiceDto` - لتحديث الفاتورة
   - `UpdateInvoiceStatusDto` - لتغيير حالة الفاتورة

**المعايير:**
- ✅ Indexes على companyId, contractId, invoiceNumber
- ✅ Unique constraint على (companyId, contractId, periodStart)
- ✅ Validation على التواريخ والمبالغ

---

### **المرحلة 4.2: Backend - Invoice Service (Core Logic)** ⏱️ 90 دقيقة

**الهدف:** بناء المنطق المحاسبي الأساسي

**الوظائف المطلوبة:**

1. **generateInvoice(contractId, periodStart, periodEnd)**
   - التحقق من عدم وجود فاتورة لنفس الفترة (منع التكرار)
   - جلب بيانات العقد والوحدة
   - حساب الإيجار حسب النوع (شهري/يومي)
   - إنشاء Invoice
   - إنشاء InvoiceLine للإيجار
   - إضافة الخدمات الثابتة (إذا كان الدمج مفعل)
   - حساب المجموع الكلي
   - إرجاع الفاتورة مع البنود

2. **findAll(companyId, filters)**
   - فلترة حسب الحالة، العقد، التواريخ
   - Populate: contract, unit, customer
   - Sorting حسب تاريخ الإصدار

3. **findOne(id)**
   - Populate: contract, unit, customer, lines

4. **updateStatus(id, status)**
   - تحديث حالة الفاتورة
   - Validation: لا يمكن تغيير فاتورة مدفوعة

5. **delete(id)**
   - حذف الفاتورة والبنود
   - Validation: لا يمكن حذف فاتورة مدفوعة

**Business Rules:**
- ✅ لا يمكن توليد فاتورتين لنفس العقد ونفس الفترة
- ✅ periodEnd يجب أن يكون بعد periodStart
- ✅ dueDate يتم حسابه تلقائياً (issueDate + 30 يوم)
- ✅ invoiceNumber يتم توليده تلقائياً (INV-YYYYMM-XXXX)
- ✅ الفواتير المدفوعة لا يمكن تعديلها أو حذفها

---

### **المرحلة 4.3: Backend - Invoice Controller & Routes** ⏱️ 30 دقيقة

**الهدف:** إنشاء API endpoints

**Endpoints المطلوبة:**

```typescript
POST   /api/invoices/generate        // توليد فاتورة جديدة
GET    /api/invoices                 // جلب جميع الفواتير (مع filters)
GET    /api/invoices/:id             // جلب فاتورة واحدة
PATCH  /api/invoices/:id/status      // تحديث حالة الفاتورة
DELETE /api/invoices/:id             // حذف فاتورة
GET    /api/invoices/:id/pdf         // توليد PDF (المرحلة 4.5)
```

**Features:**
- ✅ JWT Authentication
- ✅ Multi-tenant isolation
- ✅ Validation (class-validator)
- ✅ Error handling
- ✅ Swagger documentation

---

### **المرحلة 4.4: Backend - Service Integration** ⏱️ 45 دقيقة

**الهدف:** دمج الخدمات الثابتة مع الفواتير

**الوظائف:**

1. **addServiceLines(invoiceId, services)**
   - جلب الخدمات النشطة للشركة
   - فلترة الخدمات من نوع fixed_fee
   - إنشاء InvoiceLine لكل خدمة
   - تحديث totalAmount

2. **Integration في generateInvoice:**
   - التحقق من إعدادات الشركة (mergeServicesWithRent)
   - إذا كان true: إضافة الخدمات تلقائياً
   - إذا كان false: الفاتورة تحتوي على الإيجار فقط

**Business Rules:**
- ✅ فقط الخدمات النشطة (isActive: true)
- ✅ فقط الخدمات الثابتة (serviceType: 'fixed_fee')
- ✅ الخدمات العدادية (metered) لا تُضاف تلقائياً (المرحلة 5)

---

### **المرحلة 4.5: Backend - PDF Generation** ⏱️ 60 دقيقة

**الهدف:** توليد فواتير PDF احترافية

**المكتبة:** `pdfmake` (أسهل من puppeteer)

**التثبيت:**
```bash
pnpm add pdfmake
pnpm add -D @types/pdfmake
```

**الوظيفة:**
```typescript
async generatePDF(invoiceId: string): Promise<Buffer>
```

**محتوى PDF:**
1. **Header:**
   - اسم الشركة
   - رقم الفاتورة
   - تاريخ الإصدار
   - تاريخ الاستحقاق

2. **Customer Info:**
   - اسم العميل
   - رقم الوحدة
   - العنوان

3. **Invoice Lines Table:**
   | الوصف | الكمية | السعر | المبلغ |
   |-------|--------|-------|--------|
   | إيجار شهري | 1 | 5000 | 5000 |
   | إنترنت | 1 | 200 | 200 |

4. **Footer:**
   - المجموع الكلي
   - المبلغ المدفوع
   - المتبقي

**Features:**
- ✅ RTL support للعربية
- ✅ Professional design
- ✅ Company logo (optional)
- ✅ Bilingual (Arabic/English based on company settings)

---

### **المرحلة 4.6: Frontend - Invoices Management Page** ⏱️ 90 دقيقة

**الهدف:** بناء واجهة إدارة الفواتير

**Components:**

1. **Invoices List Table:**
   - عرض جميع الفواتير
   - Columns: رقم الفاتورة، العميل، الوحدة، الفترة، المبلغ، الحالة، الإجراءات
   - Filters: الحالة، العقد، التاريخ
   - Status chips (draft/posted/paid/cancelled)

2. **Generate Invoice Dialog:**
   - اختيار العقد (dropdown)
   - تحديد فترة الفاتورة (date pickers)
   - عرض معاينة (العقد، الوحدة، العميل، المبلغ المتوقع)
   - زر "Generate"

3. **Invoice Details Dialog:**
   - عرض تفاصيل الفاتورة
   - جدول البنود (lines)
   - المجموع الكلي
   - أزرار: Print PDF, Update Status, Delete

4. **Actions:**
   - Generate Invoice (زر رئيسي)
   - View Details (عين)
   - Print PDF (طابعة)
   - Update Status (dropdown: draft → posted → paid)
   - Delete (سلة مهملات)

**Features:**
- ✅ React Query
- ✅ Material-UI
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Translations

---

### **المرحلة 4.7: Frontend - PDF Preview & Print** ⏱️ 30 دقيقة

**الهدف:** معاينة وطباعة الفواتير

**الوظائف:**

1. **Print Button:**
   - استدعاء `/api/invoices/:id/pdf`
   - فتح PDF في نافذة جديدة
   - إمكانية الطباعة مباشرة

2. **Download Button:**
   - تحميل PDF
   - اسم الملف: `Invoice-{invoiceNumber}.pdf`

**Implementation:**
```typescript
const handlePrint = async (invoiceId: string) => {
  const response = await api.get(`/invoices/${invoiceId}/pdf`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  window.open(url, '_blank');
};
```

---

## 📊 ملخص الخطوات

| الخطوة | الوصف | الوقت | المخرجات |
|--------|-------|-------|-----------|
| 4.1 | Schemas & DTOs | 30 دقيقة | 2 Schemas + 3 DTOs |
| 4.2 | Invoice Service | 90 دقيقة | 5 وظائف رئيسية |
| 4.3 | Controller & Routes | 30 دقيقة | 6 API endpoints |
| 4.4 | Service Integration | 45 دقيقة | دمج الخدمات |
| 4.5 | PDF Generation | 60 دقيقة | توليد PDF |
| 4.6 | Frontend Page | 90 دقيقة | صفحة إدارة كاملة |
| 4.7 | PDF Preview | 30 دقيقة | معاينة وطباعة |

**الوقت الإجمالي:** ~6 ساعات

---

## 🎯 المخرجات النهائية

### Backend:
- ✅ 2 Schemas (Invoice, InvoiceLine)
- ✅ 3 DTOs
- ✅ InvoiceService مع 5+ وظائف
- ✅ InvoiceController مع 6 endpoints
- ✅ PDF generation
- ✅ Service integration
- ✅ Business logic كامل

### Frontend:
- ✅ Invoices Management Page
- ✅ Generate Invoice Dialog
- ✅ Invoice Details Dialog
- ✅ PDF Preview/Print
- ✅ Status management
- ✅ Filters and search

### Features:
- ✅ Auto-generate invoices
- ✅ Prevent duplicates
- ✅ Merge services
- ✅ Calculate totals
- ✅ PDF generation
- ✅ Status workflow
- ✅ Multi-tenant
- ✅ Bilingual

---

## 🔧 التقنيات المستخدمة

**Backend:**
- NestJS
- Mongoose
- class-validator
- pdfmake
- Winston (logging)

**Frontend:**
- React 18
- TypeScript
- Material-UI
- React Query
- React Hook Form

---

## ✅ معايير النجاح

**Backend:**
- ✅ جميع الـ endpoints تعمل
- ✅ منع التكرار يعمل
- ✅ PDF يتم توليده بنجاح
- ✅ الخدمات تُدمج تلقائياً
- ✅ صفر أخطاء TypeScript

**Frontend:**
- ✅ يمكن توليد فاتورة جديدة
- ✅ عرض جميع الفواتير
- ✅ فلترة وبحث يعملان
- ✅ طباعة PDF تعمل
- ✅ تحديث الحالة يعمل

**Business Logic:**
- ✅ لا توجد فواتير مكررة
- ✅ الحسابات صحيحة
- ✅ الحالات تتغير بشكل صحيح
- ✅ الفواتير المدفوعة محمية

---

## 🚀 الخطوة التالية

بعد إكمال المرحلة 4، سيكون لدينا:
- ✅ نظام فواتير كامل
- ✅ توليد تلقائي
- ✅ PDF احترافي
- ✅ دمج الخدمات

**المرحلة 5** ستضيف:
- العدادات (Meters)
- قراءات العدادات
- توزيع الاستهلاك
- إضافة بنود العدادات للفواتير

---

**هل أنت جاهز للبدء بالمرحلة 4؟** 🚀
