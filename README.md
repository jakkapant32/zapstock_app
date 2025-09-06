# 🚀 ZapStock - Inventory Management System

## 📱 **Complete Inventory Management Solution**

ZapStock is a comprehensive inventory management system consisting of:
- **React Native Mobile App** (Android/iOS)
- **Node.js Backend API** with PostgreSQL
- **Real-time Dashboard** and Analytics

## 🎯 **Features**

### 📱 **Mobile App (React Native/Expo)**
- ✅ User Authentication (Login/Register/Change Password)
- ✅ Product Management (Add/Edit/Delete/View)
- ✅ Category Management
- ✅ Dashboard with Statistics
- ✅ Transaction Tracking
- ✅ Profile Management
- ✅ Fresh Product Monitoring
- ✅ Supplier Management

### 🔧 **Backend API (Node.js)**
- ✅ RESTful API with Express.js
- ✅ PostgreSQL Database
- ✅ JWT Authentication
- ✅ File Upload Support
- ✅ Rate Limiting & Security
- ✅ CORS Configuration

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+
- PostgreSQL (or use Railway's free database)
- Android Studio (for APK building)

### **1. Clone Repository**
```bash
git clone https://github.com/YOUR_USERNAME/zapstock.git
cd zapstock
```

### **2. Backend Setup**
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm run dev
```

### **3. Frontend Setup**
```bash
cd zap_stock
npm install
npm start
```

### **4. Build APK**
```bash
cd zap_stock
eas build --platform android --profile preview
```

## 🌐 **Deployment**

### **Backend Deployment (Railway)**
```bash
cd backend
./deploy.sh
```

### **Frontend Configuration**
After backend deployment, update API URL in `zap_stock/constants/Api.ts`:
```typescript
const BASE_URL = 'https://your-backend-url.railway.app';
```

## 📁 **Project Structure**

```
zapstock/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── routes/         # API Routes
│   │   └── server.js       # Main server file
│   ├── config.js           # Configuration
│   └── package.json
├── zap_stock/              # React Native App
│   ├── app/               # App screens
│   ├── components/        # Reusable components
│   ├── constants/         # API configuration
│   └── package.json
└── README.md
```

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Change password

### **Products**
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Categories**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### **Dashboard**
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🎨 **Screenshots**

*Add screenshots of your app here*

## 📱 **APK Download**

Download the latest APK from the releases section.

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team**

- **Backend Development**: Node.js, Express.js, PostgreSQL
- **Frontend Development**: React Native, Expo, TypeScript
- **UI/UX Design**: Modern, responsive design

## 🆘 **Support**

If you encounter any issues:
1. Check the [Issues](https://github.com/YOUR_USERNAME/zapstock/issues) page
2. Create a new issue with detailed description
3. Contact the development team

---

**Made with ❤️ by ZapStock Team**
