# 🚀 ZapStock Backend Deployment Guide

## 📋 Prerequisites
- GitHub account
- Railway account (free)
- Node.js 16+ installed locally

## 🎯 Deployment Steps

### 1. **Push to GitHub**
```bash
cd backend
git init
git add .
git commit -m "Initial backend deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zapstock-backend.git
git push -u origin main
```

### 2. **Deploy on Railway**
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `zapstock-backend` repository
6. Railway will automatically detect Node.js and deploy

### 3. **Add PostgreSQL Database**
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically connect it to your app

### 4. **Set Environment Variables**
In Railway dashboard, go to Variables tab and add:
```
NODE_ENV=production
CORS_ORIGINS=*
JWT_SECRET=your-super-secret-jwt-key-2024-production
```

### 5. **Get Your API URL**
After deployment, Railway will provide a URL like:
```
https://zapstock-backend-production.up.railway.app
```

## 🔧 Local Testing
```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

## 📱 Update Frontend
After getting the Railway URL, update `zap_stock/constants/Api.ts`:
```typescript
const BASE_URL = 'https://zapstock-backend-production.up.railway.app';
```

## 🎉 Success!
Your backend will be live and accessible from anywhere!
