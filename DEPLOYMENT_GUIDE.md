# 🚀 Aqarat Property Management - Deployment Guide

This guide will help you deploy the Aqarat Property Management system to production.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - Your code is already on GitHub
2. **Vercel Account** - For frontend hosting (free tier available)
3. **Railway/Render Account** - For backend hosting (free tier available)
4. **MongoDB Atlas Account** - For database hosting (free tier available)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Sandbox - FREE)

### 1.2 Configure Database

1. Click "Connect" on your cluster
2. Add your IP address (or allow access from anywhere: `0.0.0.0/0`)
3. Create a database user with username and password
4. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/aqarat-accounting
   ```

### 1.3 Create Database

1. Click "Browse Collections"
2. Create database: `aqarat-accounting`

---

## 🔧 Step 2: Deploy Backend API (Railway OR Vercel)

### Option A: Deploy to Railway (Recommended for beginners)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub and click "New Project"
3. Select "Deploy from GitHub repo" and choose your repository.
4. Set the **Root Directory** to: `apps/api`
5. Railway will detect the `Dockerfile` automatically.
6. Add Environment Variables (see list below).

### Option B: Deploy to Vercel (Advanced - Serverless)

1. Go to [Vercel.com](https://vercel.com)
2. Click "Add New Project" and import your repository.
3. **Project Settings**:
   - **Root Directory**: `apps/api`
   - **Framework Preset**: Other (Vercel will detect `vercel.json`)
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
4. Add Environment Variables (see list below).
5. **Note**: Vercel Serverless Functions have a 10s timeout on Free tier.

### 2.2 Configure Backend Environment Variables

Add these to your chosen platform:

```env
# Required Environment Variables
NODE_ENV=production
PORT=3001

# MongoDB (from Step 1)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aqarat-accounting

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis (Optional - Required for background jobs if used)
# On Vercel, use Upstash Redis. On Railway, use the Redis service.
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# CORS (will update after deploying frontend)
CORS_ORIGIN=https://your-app.vercel.app
```

### 2.3 Generate Strong Secrets

Use this command to generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Add Redis Service

1. In Railway, click "New Service"
2. Select "Redis"
3. Railway will automatically connect it to your backend

### 2.5 Deploy

1. Railway will automatically build and deploy
2. Copy your backend URL (looks like): `https://your-app.railway.app`

---

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository: `r-ismail/Wasilni`

### 3.2 Configure Frontend Project

1. **Framework Preset**: Vite
2. **Root Directory**: `apps/web`
3. **Build Command**: `pnpm build`
4. **Output Directory**: `dist`
5. **Install Command**: `pnpm install`

### 3.3 Add Environment Variable

```env
VITE_API_URL=https://your-backend.railway.app
```

_(Use the Railway URL from Step 2.5)_

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Copy your frontend URL: `https://your-app.vercel.app`

---

## 🔄 Step 4: Update CORS Configuration

### 4.1 Update Backend CORS

1. Go back to Railway
2. Update the `CORS_ORIGIN` environment variable:
   ```env
   CORS_ORIGIN=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend

Visit: `https://your-backend.railway.app/setup/status`

Expected response:

```json
{
  "isSetupComplete": false
}
```

### 5.2 Test Frontend

1. Visit: `https://your-app.vercel.app`
2. You should see the login page
3. Complete the setup wizard

---

## 🔐 Step 6: Initial Setup

### 6.1 Run Setup Wizard

1. Open your deployed frontend URL
2. Complete the 4-step setup wizard:
   - **Step 1**: Company Information
   - **Step 2**: Buildings & Units
   - **Step 3**: Default Services
   - **Step 4**: Admin User

### 6.2 Login

Use the admin credentials you created in the setup wizard.

---

## 📱 Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain to Vercel

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `aqarat.yourdomain.com`)
4. Follow Vercel's DNS configuration instructions

### 7.2 Add Custom Domain to Railway

1. Go to your Railway project settings
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed

### 7.3 Update Environment Variables

Update `CORS_ORIGIN` and `VITE_API_URL` with your custom domains.

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Backend not connecting to MongoDB

- **Solution**: Check MongoDB Atlas IP whitelist (allow `0.0.0.0/0`)
- **Solution**: Verify connection string is correct

**Problem**: CORS errors in frontend

- **Solution**: Ensure `CORS_ORIGIN` matches your frontend URL exactly
- **Solution**: Include protocol (`https://`) in CORS_ORIGIN

### Frontend Issues

**Problem**: "Network Error" or "Cannot connect to API"

- **Solution**: Verify `VITE_API_URL` is set correctly
- **Solution**: Check backend is running (visit backend URL)

**Problem**: Build fails on Vercel

- **Solution**: Ensure `pnpm-lock.yaml` is committed to Git
- **Solution**: Check build logs for specific errors

---

## 📊 Monitoring & Maintenance

### Railway Dashboard

- View logs: Railway Project → Deployments → View Logs
- Monitor resources: Railway Project → Metrics

### Vercel Dashboard

- View deployment logs: Vercel Project → Deployments
- Monitor analytics: Vercel Project → Analytics

### MongoDB Atlas

- Monitor database: Atlas Dashboard → Metrics
- View collections: Atlas Dashboard → Browse Collections

---

## 💰 Cost Estimate

### Free Tier Limits

- **Vercel**: 100 GB bandwidth/month, unlimited deployments
- **Railway**: $5 free credit/month (≈500 hours)
- **MongoDB Atlas**: 512 MB storage, shared cluster

### Paid Plans (if needed)

- **Vercel Pro**: $20/month
- **Railway**: Pay-as-you-go ($0.000231/GB-second)
- **MongoDB Atlas M10**: $57/month

---

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Pull Request** → Preview deployment
3. **Merge to main** → Production deployment

---

## 📞 Support

For deployment issues:

- **Railway**: [Railway Discord](https://discord.gg/railway)
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **MongoDB**: [MongoDB Forums](https://www.mongodb.com/community/forums/)

---

## ⚠️ Special Considerations for Vercel (API)

If you chose **Option B** (Backend on Vercel), keep in mind:

### 1. PDF Generation (Puppeteer)

The current PDF generation uses `puppeteer`, which requires a full Chromium browser. Vercel's serverless environment does not include this by default.

- **Fix**: You may need to use `@sparticuz/chromium` and `puppeteer-core` in `pdf.helper.ts` or use an external PDF generation service.
- **Current Status**: PDF generation might fail on Vercel until these changes are made.

### 2. Logging

Vercel has a read-only filesystem. File-based logging (to `logs/`) has been disabled in production to avoid errors. Use the **Vercel Dashboard** to view logs.

### 3. Database Backups

The automated backup system uses `mongodump` and `mongorestore` commands and the local filesystem. These are **not supported on Vercel**.

- **Fix**: If you use Vercel for the API, rely on **MongoDB Atlas** built-in backup features (the "Backup" tab in your Atlas cluster).

---

## 🎉 You're Done!

Your Aqarat Property Management system is now live and accessible worldwide!

**Frontend**: https://your-app.vercel.app  
**Backend**: https://your-backend.railway.app

Enjoy your deployed application! 🚀
