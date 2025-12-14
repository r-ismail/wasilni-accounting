# Wasilni Accounting System

Multi-tenant property management accounting system for furnished/unfurnished apartments and hotels.

## 🏗️ Project Structure

```
wasilni-accounting/
├── apps/
│   ├── api/          # NestJS Backend
│   └── web/          # React Frontend
├── packages/
│   └── shared/       # Shared types and enums
└── README.md
```

## 🚀 Tech Stack

### Backend
- **Node.js 20+**
- **NestJS** (TypeScript)
- **MongoDB** (Mongoose)
- **JWT Authentication** + Refresh Token
- **class-validator** for validation
- **BullMQ** + Redis for background jobs
- **pdfmake** for PDF generation
- **Swagger** for API documentation
- **Winston** for logging

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **Material-UI (MUI)**
- **React Router**
- **React Query** + Axios
- **React Hook Form** + Zod
- **react-i18next** for internationalization
- **RTL/LTR** support for Arabic/English

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **MongoDB** (running locally or remote)
- **Redis** (for BullMQ background jobs)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/r-ismail/wasilni-accounting.git
cd wasilni-accounting
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example environment file and update it:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your configuration:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wasilni-accounting
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:5173
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB service
mongod
```

### 5. Start Redis

Make sure Redis is running:

```bash
# If using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or start your local Redis service
redis-server
```

## 🎯 Running the Application

### Development Mode

Run both backend and frontend concurrently:

```bash
pnpm dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
pnpm dev:api

# Terminal 2 - Frontend
pnpm dev:web
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs

### Default Admin Credentials

The system automatically creates a super admin user on first run:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials immediately after first login in production!

## 📦 Build for Production

### Build all packages

```bash
pnpm build
```

### Build individually

```bash
# Build shared package
pnpm --filter @wasilni/shared build

# Build backend
pnpm build:api

# Build frontend
pnpm build:web
```

### Start production server

```bash
pnpm start:api
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov
```

## 📚 API Documentation

Once the backend is running, access the interactive Swagger documentation at:

**http://localhost:3001/api/docs**

### Example API Endpoints

#### Authentication

**POST** `/api/auth/login`
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

**POST** `/api/auth/refresh`
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**POST** `/api/auth/logout` (requires Bearer token)

#### User Profile

**GET** `/api/users/me` (requires Bearer token)

## 🗂️ Project Phases

This project is implemented in 6 phases:

### ✅ Phase 1: Skeleton + Auth + i18n (CURRENT)
- ✅ Monorepo structure
- ✅ MongoDB connection
- ✅ JWT Authentication + Refresh Token
- ✅ Login UI
- ✅ Arabic/English switch + RTL/LTR
- ✅ Admin seed user

### 🔄 Phase 2: Setup Wizard
- Company creation
- Buildings and units setup
- Default services configuration
- Admin user creation

### 🔄 Phase 3: Units & Contracts Management
- CRUD Units
- CRUD Customers
- Create Contracts
- Auto-suggest rent based on furnishing status

### 🔄 Phase 4: Invoice Service
- Generate invoices automatically
- Prevent duplicate invoices
- Merge fixed services
- PDF generation and printing

### 🔄 Phase 5: Meters
- Meter readings input
- Building meter consumption distribution
- Generate invoice lines

### 🔄 Phase 6: Payments & Notifications
- Payment processing
- SMS/WhatsApp integration
- Message templates

## 🌍 Internationalization

The system supports both Arabic and English with automatic RTL/LTR switching.

### Adding New Translations

Edit the translation files:

- **English**: `apps/web/src/i18n/locales/en.json`
- **Arabic**: `apps/web/src/i18n/locales/ar.json`

Example:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <button>{t('common.save')}</button>;
};
```

## 🔐 Security

- JWT tokens with short expiration (15 minutes)
- Refresh tokens for extended sessions (7 days)
- Password hashing with bcrypt
- Input validation on all endpoints
- CORS protection
- Multi-tenant data isolation

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

## 📝 License

ISC

## 👥 Authors

Wasilni Development Team

## 🐛 Issues

Report issues at: https://github.com/r-ismail/wasilni-accounting/issues
