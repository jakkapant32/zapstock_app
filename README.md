<<<<<<< HEAD
# ZapStock Backend API

## 📋 Overview
ZapStock Backend API เป็นระบบจัดการสินค้าครบวงจรที่รองรับการจัดการสินค้าทั่วไปและสินค้าของสด พร้อมระบบ Authentication และ User Management

## 🚀 Features

### 🔐 Authentication & User Management
- User Registration & Login
- Password Change & Reset
- Profile Management
- Session Management
- Activity Logging

### 📦 Product Management
- General Products Management
- Fresh Food Products Management
- Category Management
- Supplier Management
- Stock Tracking

### 📊 Dashboard & Analytics
- Real-time Statistics
- Low Stock Alerts
- Expiry Date Tracking
- Transaction History

### 🖼️ File Management
- Image Upload
- Base64 Support
- File Storage

## 🛠️ Installation

### Prerequisites
- Node.js >= 16.0.0
- PostgreSQL Database
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
=======
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

>>>>>>> 0a8267ed5efd4141b2ad31c293018435a851eb1e
   ```bash
   npm install
   ```

<<<<<<< HEAD
3. Create `.env` file:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   PORT=3000
   HOST=0.0.0.0
   ```

4. Run database migrations:
   ```bash
   node migrations/create_complete_schema.js
   ```

5. Start the server:
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User Registration
- `POST /api/auth/login` - User Login
- `POST /api/auth/logout` - User Logout
- `GET /api/auth/verify` - Token Verification
- `PUT /api/auth/change-password` - Change Password
- `POST /api/auth/forgot-password` - Forgot Password
- `POST /api/auth/reset-password` - Reset Password

### Products
- `GET /api/products` - Get All Products
- `POST /api/products` - Create Product
- `PUT /api/products/:id` - Update Product
- `DELETE /api/products/:id` - Delete Product

### Categories
- `GET /api/categories` - Get All Categories
- `POST /api/categories` - Create Category
- `PUT /api/categories/:id` - Update Category
- `DELETE /api/categories/:id` - Delete Category

### Fresh Products
- `GET /api/fresh-products` - Get All Fresh Products
- `POST /api/fresh-products` - Create Fresh Product
- `PUT /api/fresh-products/:id` - Update Fresh Product
- `DELETE /api/fresh-products/:id` - Delete Fresh Product

### Dashboard
- `GET /api/dashboard/stats` - Get Dashboard Statistics
- `GET /api/dashboard/overview` - Get Dashboard Overview
- `GET /api/dashboard/low-stock` - Get Low Stock Products
- `GET /api/dashboard/top-products` - Get Top Products

### File Upload
- `POST /api/upload` - Upload Image

### Profile
- `GET /api/profile/:userId` - Get User Profile
- `PUT /api/profile/:userId` - Update User Profile
- `POST /api/profile/:userId` - Create User Profile

## 🔧 Configuration

### Database
The API uses PostgreSQL with the following main tables:
- `users` - User accounts
- `user_profiles` - User profile information
- `products` - General products
- `fresh_products` - Fresh food products
- `categories` - Product categories
- `suppliers` - Product suppliers
- `transactions` - Stock transactions
- `sessions` - User sessions
- `activity_logs` - User activity logs

### Security
- Password hashing with bcrypt
- Session-based authentication
- CORS enabled
- Rate limiting
- Security headers with Helmet

## 📱 Frontend Integration

### React Native
```javascript
const API_BASE_URL = 'http://your-server-ip:3000';

// Example API call
const response = await fetch(`${API_BASE_URL}/api/products`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Web Applications
```javascript
const API_BASE_URL = 'http://your-server-ip:3000';

// Example API call
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'your-username',
    password: 'your-password'
  })
});
```

## 🚀 Deployment

### Production Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations
4. Start the server with PM2 or similar process manager

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 License
MIT License

## 👥 Support
For support and questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-05  
**Node.js**: >= 16.0.0  
**Database**: PostgreSQL
=======
2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
>>>>>>> 0a8267ed5efd4141b2ad31c293018435a851eb1e
