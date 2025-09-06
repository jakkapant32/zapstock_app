# 🚀 Deploy ZapStock Backend on Render.com

## 📋 Prerequisites
- GitHub repository: `jakkapant32/zapstock`
- Render.com account
- PostgreSQL database on Render

## 🎯 Deployment Steps

### 1. **Create Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"+ New"** → **"Web Service"**
3. Select **"Build and deploy from a Git repository"**
4. Connect GitHub repository: `jakkapant32/zapstock`

### 2. **Configure Build Settings**
```
Name: zapstock-backend
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

### 3. **Set Environment Variables**
In Render Dashboard → Environment tab:
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
CORS_ORIGINS=*
JWT_SECRET=your-super-secret-jwt-key-2024-production
```

### 4. **Connect Database**
1. Go to your existing PostgreSQL database
2. Copy **"External Database URL"**
3. Paste into `DATABASE_URL` environment variable

### 5. **Deploy**
1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete

## 🔗 Get Your API URL
After deployment, you'll get a URL like:
```
https://zapstock-backend.onrender.com
```

## 📱 Update Frontend
Update `zap_stock/constants/Api.ts`:
```typescript
const BASE_URL = 'https://zapstock-backend.onrender.com';
```

## 🎉 Success!
Your backend will be live and accessible from anywhere!

## 🔧 Troubleshooting
- **Build fails**: Check Node.js version (requires 16+)
- **Database connection fails**: Verify DATABASE_URL
- **CORS errors**: Check CORS_ORIGINS setting
