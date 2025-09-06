const express = require('express');
const cors = require('cors');
const db = require('./db');
const config = require('../config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ZapStock Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/healthz',
      products: '/api/products',
      categories: '/api/categories',
      auth: '/api/auth',
      dashboard: '/api/dashboard'
    }
  });
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`ZapStock Backend API listening at http://localhost:${PORT}`);
  console.log('Connected to PostgreSQL database via Render.com');
});

module.exports = app;
