// ========================================
// ZapStock API Configuration
// ========================================

module.exports = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://zapstock_user:jb3uWpZlFoG3f2d1PI21ZFX0frHSGrDW@dpg-d2q1vder433s73dqf0lg-a.oregon-postgres.render.com/zapstock_db',
    ssl: { rejectUnauthorized: false }
  },
  
  // Server Configuration
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  
  // CORS Configuration
  cors: {
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? ['*'] // Allow all origins in production
      : [
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
        ]
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // File Upload
  upload: {
    maxSize: '25mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadDir: './uploads'
  }
};





