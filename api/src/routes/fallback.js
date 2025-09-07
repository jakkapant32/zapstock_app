const express = require('express');
const router = express.Router();

// Fallback routes when database is not available
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ZapStock Backend API is healthy (fallback mode)',
    timestamp: new Date().toISOString(),
    database: 'disconnected'
  });
});

router.get('/products', (req, res) => {
  res.json({
    success: true,
    message: 'Database temporarily unavailable',
    data: [],
    fallback: true
  });
});

router.get('/categories', (req, res) => {
  res.json({
    success: true,
    message: 'Database temporarily unavailable',
    data: [],
    fallback: true
  });
});

router.get('/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    message: 'Database temporarily unavailable',
    data: {
      totalProducts: 0,
      totalCategories: 0,
      totalInventory: 0,
      totalSales: 0,
      expiringProducts: 0,
      totalSuppliers: 0,
      totalTransactions: 0,
      totalFreshProducts: 0,
      totalFreshInventory: 0,
      totalFreshTransactions: 0
    },
    fallback: true
  });
});

// Additional fallback routes
router.get('/transactions', (req, res) => {
  res.json({
    success: true,
    message: 'Database temporarily unavailable',
    data: [],
    fallback: true
  });
});

router.get('/suppliers', (req, res) => {
  res.json({
    success: true,
    message: 'Database temporarily unavailable',
    data: [],
    fallback: true
  });
});

router.get('/fresh-products', (req, res) => {
  res.json({
    success: true,
    message: 'Database temporarily unavailable',
    data: [],
    fallback: true
  });
});

// Auth fallback
router.post('/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Database temporarily unavailable. Please try again later.',
    fallback: true,
    data: {
      user: null,
      token: null
    }
  });
});

// Catch-all fallback for any other routes (except specific endpoints)
router.use('*', (req, res) => {
  // Skip fallback for specific endpoints that should handle their own errors
  if (req.path === '/db-health' || req.path === '/health') {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Endpoint ${req.originalUrl} ไม่พบ`,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    message: 'Database temporarily unavailable. Please try again later.',
    fallback: true,
    data: [],
    requestedPath: req.originalUrl
  });
});

module.exports = router;
