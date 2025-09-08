# 📱 ZapStock - ระบบจัดการสินค้าคงคลัง

<div align="center">
  <img src="./assets/images/logo.png" alt="ZapStock Logo" width="200"/>
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
</div>

## 📋 เกี่ยวกับโปรเจค

ZapStock เป็นระบบจัดการสินค้าคงคลังที่ออกแบบมาสำหรับร้านค้าและธุรกิจขนาดเล็ก ประกอบด้วย:

- **📱 Mobile App** (React Native + Expo) - สำหรับ iOS และ Android
- **🌐 Backend API** (Node.js + Express) - RESTful API
- **🗄️ Database** (PostgreSQL) - จัดเก็บข้อมูลบน Render.com

## ✨ คุณสมบัติหลัก

### 📱 Mobile App
- ✅ ระบบจัดการสินค้าคงคลัง
- ✅ การแจ้งเตือนสินค้าใกล้หมดอายุ
- ✅ การจัดการสินค้าของสด
- ✅ สถิติและรายงาน
- ✅ UI/UX ที่ทันสมัยและใช้งานง่าย

### 🔧 Backend API
- ✅ RESTful API Endpoints
- ✅ JWT Authentication
- ✅ Security Middleware (Helmet, CORS, Rate Limiting)
- ✅ File Upload Support
- ✅ Error Handling
- ✅ PostgreSQL Integration

## 🛠️ เทคโนโลยีที่ใช้

### Frontend (Mobile)
- **React Native** 0.79.5
- **Expo** 53.0.22
- **Expo Router** สำหรับ Navigation
- **TypeScript** สำหรับ Type Safety
- **React Navigation** สำหรับ Navigation

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** Database
- **JWT** Authentication
- **Helmet** Security
- **CORS** Configuration
- **Rate Limiting**

## 🚀 การติดตั้งและรัน

### Prerequisites
- Node.js (v18 หรือใหม่กว่า)
- npm หรือ yarn
- Expo CLI
- PostgreSQL Database

### 1. Clone Repository
```bash
git clone https://github.com/jakkapant32/zapstock_appios.git
cd zapstock_appios
```

### 2. ติดตั้ง Dependencies
```bash
# ติดตั้ง dependencies สำหรับ mobile app
npm install

# ติดตั้ง dependencies สำหรับ backend
cd api
npm install
cd ..
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ `api/`:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 4. รัน Development Server
```bash
# รัน backend API
cd api
npm run dev

# รัน mobile app (ใน terminal ใหม่)
npm start
```

### 5. Build สำหรับ Production
```bash
# Build สำหรับ iOS
npm run ios

# Build สำหรับ Android
npm run android

# Build สำหรับ Web
npm run web
```

## 📁 โครงสร้างโปรเจค

```
zapstock_appios/
├── 📱 app/                    # Expo Router App Pages
├── 🔧 api/                    # Backend API
│   ├── server.js             # Main server file
│   ├── config.js             # Configuration
│   └── README.md             # API Documentation
├── 🎨 assets/                 # Images, fonts, etc.
├── 🧩 components/             # Reusable components
├── 📊 contexts/               # React Contexts
├── 🎣 hooks/                  # Custom hooks
├── 🔧 services/               # API services
├── 🛠️ utils/                  # Utility functions
├── 📱 app.config.js           # Expo configuration
├── ⚙️ eas.json                # EAS Build configuration
└── 📄 package.json            # Dependencies
```

## 📊 API Endpoints

### 🔍 ทดสอบการเชื่อมต่อ
```
GET /api/test
```

### 👥 ผู้ใช้
```
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

### 📦 สินค้า
```
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

### 🥬 สินค้าของสด
```
GET /api/fresh-products
```

### ⏰ สินค้าที่ใกล้หมดอายุ
```
GET /api/expiring-products
```

### 📈 สถิติสินค้า
```
GET /api/product-stats
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: ป้องกัน DDoS attacks
- **JWT**: Secure authentication
- **Input Validation**: ป้องกัน SQL injection

## 🚀 การ Deploy

### Backend (Render.com)
1. สร้าง Web Service บน Render.com
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically

### Mobile App (EAS Build)
```bash
# ติดตั้ง EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build สำหรับ iOS
eas build --platform ios

# Build สำหรับ Android
eas build --platform android
```

## 📱 Screenshots

<div align="center">
  <img src="./assets/screenshots/dashboard.png" alt="Dashboard" width="200"/>
  <img src="./assets/screenshots/products.png" alt="Products" width="200"/>
  <img src="./assets/screenshots/expiring.png" alt="Expiring Products" width="200"/>
</div>

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

โปรเจคนี้ใช้ MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file

## 👨‍💻 ผู้พัฒนา

**Jakkapant32**
- GitHub: [@jakkapant32](https://github.com/jakkapant32)

## 📞 Support

หากมีปัญหาหรือต้องการความช่วยเหลือ:
- สร้าง [Issue](https://github.com/jakkapant32/zapstock_appios/issues) บน GitHub
- ติดต่อทีมพัฒนา ZapStock

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) สำหรับ development platform
- [React Native](https://reactnative.dev/) สำหรับ mobile development
- [Node.js](https://nodejs.org/) สำหรับ backend
- [PostgreSQL](https://postgresql.org/) สำหรับ database

---

<div align="center">
  <p>สร้างด้วย ❤️ โดยทีมพัฒนา ZapStock</p>
  <p>⭐ Star โปรเจคนี้ถ้าชอบ!</p>
</div>
