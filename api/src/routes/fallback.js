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
      expiringProducts: 0
    },
    fallback: true
  });
});

// Auth fallback
router.post('/auth/login', (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Database temporarily unavailable. Please try again later.',
    fallback: true
  });
});

// Catch-all fallback for any other routes
router.use('*', (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Database temporarily unavailable. Please try again later.',
    fallback: true,
    requestedPath: req.originalUrl
  });
});

module.exports = router;
