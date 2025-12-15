# 📋 Phase 3: Units & Contracts Management

## 🎯 Goal

Build complete CRUD functionality for Units, Customers, and Contracts with professional UI and full integration.

---

## 📦 What Will Be Built

### Backend (Already Complete from Phase 2)

✅ **Units Module**
- CRUD operations
- Bulk create
- Filtering (building, status, furnishing)

✅ **Buildings Module**
- CRUD operations

**New Modules Needed:**

#### 1. Customers Module
- Customer Schema
- CRUD operations
- Search functionality
- Customer types (individual/company)

#### 2. Contracts Module
- Contract Schema
- CRUD operations
- Link to Unit and Customer
- Rent type (monthly/daily)
- Active/Inactive status
- Date validation

---

### Frontend (New)

#### 1. Units Management Page
- List all units with filters
- View unit details
- Edit unit information
- Delete unit
- Search and filter:
  - By building
  - By status (available/occupied/maintenance)
  - By furnishing (furnished/unfurnished)
- Professional table with pagination

#### 2. Customers Management Page
- List all customers
- Add new customer
- Edit customer information
- Delete customer
- Search by name/phone/email
- Customer types:
  - Individual (name, phone, email, ID number)
  - Company (company name, contact person, tax number)

#### 3. Contracts Management Page
- List all contracts
- Create new contract:
  - Select customer
  - Select available unit
  - Choose rent type (monthly/daily)
  - Set base rent amount
  - Set start and end dates
- Edit contract
- Terminate contract
- View contract details
- Filter by status (active/expired)

---

## 🔧 Technical Requirements

### Backend

**Customers Schema:**
```typescript
{
  _id: ObjectId,
  companyId: ObjectId,
  type: 'individual' | 'company',
  name: string,
  phone: string,
  email?: string,
  idNumber?: string,
  taxNumber?: string,
  address?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Contracts Schema:**
```typescript
{
  _id: ObjectId,
  companyId: ObjectId,
  unitId: ObjectId,
  customerId: ObjectId,
  rentType: 'monthly' | 'daily',
  baseRentAmount: number,
  startDate: Date,
  endDate: Date,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Validation:**
- Customer phone must be unique per company
- Unit must be available when creating contract
- Contract dates must be valid (end > start)
- Cannot create contract for occupied unit

**Business Logic:**
- When contract is created, unit status → 'occupied'
- When contract is terminated, unit status → 'available'
- Suggest rent amount based on unit's defaultRent

### Frontend

**Components:**
- UnitsTable
- CustomerForm
- CustomersList
- ContractForm
- ContractsList
- SearchBar
- FilterPanel

**Features:**
- React Query for data fetching
- Material-UI DataGrid or Table
- Form validation with Zod
- Success/Error notifications
- Confirmation dialogs for delete
- Loading states
- Empty states

---

## 📊 Implementation Steps

### Step 1: Backend - Customers Module
1. Create Customer schema
2. Create DTOs (Create, Update)
3. Create CustomersService
4. Create CustomersController
5. Add to app.module
6. Test endpoints

### Step 2: Backend - Contracts Module
1. Create Contract schema
2. Create DTOs (Create, Update)
3. Create ContractsService
4. Create ContractsController
5. Add business logic (unit status update)
6. Add to app.module
7. Test endpoints

### Step 3: Frontend - Units Page
1. Create Units page component
2. Create UnitsTable component
3. Add filters and search
4. Add edit functionality
5. Add delete functionality
6. Add translations
7. Test UI

### Step 4: Frontend - Customers Page
1. Create Customers page component
2. Create CustomerForm component
3. Create CustomersList component
4. Add CRUD operations
5. Add search functionality
6. Add translations
7. Test UI

### Step 5: Frontend - Contracts Page
1. Create Contracts page component
2. Create ContractForm component
3. Create ContractsList component
4. Add unit/customer selection
5. Add date pickers
6. Add rent calculation
7. Add translations
8. Test UI

### Step 6: Integration & Testing
1. Test all CRUD operations
2. Test filters and search
3. Test business logic
4. Fix any bugs
5. Commit to GitHub

---

## 🌐 Translations Needed

### English
- Units: title, columns, actions, filters
- Customers: title, form fields, types
- Contracts: title, form fields, rent types
- Common: search, filter, add, edit, delete, save, cancel

### Arabic
- Same as English

---

## ⏱️ Estimated Time

- **Backend**: 2-3 hours
- **Frontend**: 4-5 hours
- **Testing**: 1 hour
- **Total**: 7-9 hours

---

## ✅ Success Criteria

- ✅ All CRUD operations work
- ✅ Filters and search functional
- ✅ Business logic enforced
- ✅ Professional UI
- ✅ Full i18n support
- ✅ Zero errors
- ✅ Responsive design
- ✅ Data validation working

---

**Ready to start Phase 3!** 🚀
