# 🚀 ZapStock Node.js API

API สำหรับระบบจัดการสินค้าคงคลัง ZapStock ที่เชื่อมต่อกับ PostgreSQL บน Render.com

## 📋 คุณสมบัติ

- ✅ เชื่อมต่อ PostgreSQL บน Render.com
- ✅ RESTful API Endpoints
- ✅ Security Middleware (Helmet, CORS, Rate Limiting)
- ✅ JWT Authentication (พร้อมใช้งาน)
- ✅ File Upload Support
- ✅ Error Handling

## 🛠️ การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Server
```bash
# Development Mode
npm run dev

# Production Mode
npm start
```

## 📊 API Endpoints

### 🔍 ทดสอบการเชื่อมต่อ
```
GET /api/test
```

### 👥 ผู้ใช้
```
GET /api/users
```

### 📦 สินค้า
```
GET /api/products
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

## 🔧 การตั้งค่า

ไฟล์ `config.js` ประกอบด้วย:
- Database Configuration (PostgreSQL on Render.com)
- JWT Configuration
- Security Settings
- CORS Configuration
- File Upload Settings

## 🌐 การใช้งาน

### ทดสอบ API
```bash
# ทดสอบการเชื่อมต่อ
curl http://localhost:3000/api/test

# ดูข้อมูลผู้ใช้
curl http://localhost:3000/api/users

# ดูข้อมูลสินค้า
curl http://localhost:3000/api/products
```

### ใช้กับ React Native App
อัปเดต `Eazy1/src/config/Api.ts`:
```typescript
export const BASE_URL = 'http://localhost:3000';
```

### ใช้กับ PHP Website
อัปเดต `zap_shop/config.php`:
```php
$api_url = 'http://localhost:3000/api';
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: ป้องกัน DDoS
- **SSL**: การเชื่อมต่อฐานข้อมูลที่ปลอดภัย

## 📁 โครงสร้างไฟล์

```
backend/
├── server.js          # Main server file
├── config.js          # Configuration
├── package.json       # Dependencies
└── README.md         # Documentation
```

## 🚀 การ Deploy

### Render.com
1. สร้าง Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Heroku
1. สร้าง app
2. Connect repository
3. Set config vars
4. Deploy

## 🔗 การเชื่อมต่อ

- **Database**: PostgreSQL on Render.com
- **Frontend**: React Native App + PHP Website
- **Port**: 3000 (Development)

## 📞 Support

หากมีปัญหาหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมพัฒนา ZapStock


