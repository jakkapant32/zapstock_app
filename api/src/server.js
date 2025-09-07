const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('../config');


const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const freshProductRoutes = require('./routes/fresh-products');
const supplierRoutes = require('./routes/suppliers');
const fallbackRoutes = require('./routes/fallback');

const app = express();
const PORT = config.port;

// CORS configuration (allow local dev, Android emulator, and LAN IPs)
const allowedOrigins = config.cors?.allowedOrigins || [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:8081',
  'http://localhost:19006',
  'http://10.0.2.2:3000',
  'http://192.168.137.1:3000',
  'http://192.168.137.1:3001',
  'http://10.214.162.160:3000',
  'http://10.214.162.160:3001',
  'http://169.254.41.48:3000',
  'http://169.254.13.29:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^http:\/\/192\.168\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{2,5}$/.test(origin) ||
      /^http:\/\/10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{2,5}$/.test(origin) ||
      /^http:\/\/10\.0\.2\.2:[0-9]{2,5}$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:[0-9]{2,5}$/.test(origin) ||
      /^http:\/\/0\.0\.0\.0:[0-9]{2,5}$/.test(origin) ||
      /^http:\/\/169\.254\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{2,5}$/.test(origin);
    if (isAllowed) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Handle CORS preflight requests
app.options('*', cors());

app.use(express.json({ limit: config.upload?.maxSize || '25mb' }));
app.use(express.urlencoded({ extended: true, limit: config.upload?.maxSize || '25mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});


// Request validation middleware
app.use((req, res, next) => {
  // ตรวจสอบ Content-Type สำหรับ POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && 
      req.headers['content-type'] && 
      !req.headers['content-type'].includes('application/json')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Content-Type',
      message: 'Content-Type ต้องเป็น application/json',
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes (real routes first)
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fresh-products', freshProductRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/upload', require('./routes/uploads'));

// Fallback routes for when database is unavailable (placed last, but with specific exclusions)
app.use('/api', (req, res, next) => {
  // Skip fallback for specific endpoints that should handle their own errors
  if (req.path === '/db-health' || req.path === '/health') {
    return next();
  }
  fallbackRoutes(req, res, next);
});


// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.get('/', (req, res) => {
  res.send('ZapStock Backend API is running!');
});


// Database health check endpoint
app.get('/api/db-health', async (req, res) => {
  try {
    const db = require('./db');
    const result = await db.query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({
      success: true,
      database: 'connected',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].postgres_version
    });
  } catch (error) {
    res.json({
      success: false,
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});


// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./db');
    await db.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'ZapStock Backend API is healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      message: 'ZapStock Backend API is healthy (fallback mode)',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler - ส่ง JSON แทน HTML
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Endpoint ${req.originalUrl} ไม่พบ`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/api/health',
      '/api/products',
      '/api/categories', 
      '/api/transactions',
      '/api/auth',
      '/api/upload',
      '/api/auth/profile/stats',
      '/api/auth/profile/:userId',
      '/api/profile/stats',
      '/api/profile/:userId',
      '/api/dashboard/stats',
      '/api/dashboard/overview',
      '/api/dashboard/recent-transactions',
      '/api/dashboard/low-stock',
      '/api/dashboard/top-products'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack); // Log the error stack for debugging
  
  // ตรวจสอบว่าเป็น validation error หรือไม่
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // ตรวจสอบว่าเป็น database error หรือไม่
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'ข้อมูลซ้ำกับที่มีอยู่ในระบบ',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    timestamp: new Date().toISOString()
  });
});

// Initialize database connection
const db = require('./db');

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`ZapStock Backend API listening at http://localhost:${PORT}`);
  console.log('Network IPs available:');
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Wi-Fi: http://10.214.162.160:${PORT}`);
  console.log(`  - Hotspot: http://192.168.137.1:${PORT}`);
  console.log(`  - Bluetooth: http://169.254.41.48:${PORT}`);
  
  // Test database connection
  try {
    const dbConnected = await db.connectDB();
    if (dbConnected) {
      console.log('Connected to PostgreSQL database via Render.com');
    } else {
      console.log('Database connection failed, but server will continue running');
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Server will continue running without database connection');
  }
});
