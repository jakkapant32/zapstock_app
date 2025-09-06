const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/dashboard/stats - สถิติภาพรวม
router.get('/stats', async (req, res) => {
  try {
    // นับจำนวนสินค้าทั่วไป
    const productsCount = await db.query('SELECT COUNT(*) as count FROM products');
    // นับจำนวนสินค้าของสด
    const freshProductsCount = await db.query('SELECT COUNT(*) as count FROM fresh_products');
    // นับจำนวนหมวดหมู่
    const categoriesCount = await db.query('SELECT COUNT(*) as count FROM categories');
    // นับจำนวนหมวดหมู่สินค้าของสด
    const freshCategoriesCount = await db.query('SELECT COUNT(*) as count FROM fresh_categories');
    // นับจำนวน suppliers
    const suppliersCount = await db.query('SELECT COUNT(*) as count FROM suppliers');
    // นับจำนวนรายการธุรกรรม
    const transactionsCount = await db.query('SELECT COUNT(*) as count FROM transactions');
    // นับจำนวนรายการธุรกรรมสินค้าของสด
    const freshTransactionsCount = await db.query('SELECT COUNT(*) as count FROM fresh_stock_transactions');
    
    // คำนวณยอดขายรวม (จำนวนสินค้าที่ขายออก)
    const totalSales = await db.query(`
      SELECT COALESCE(SUM(quantity), 0) as total_sales 
      FROM transactions 
      WHERE type = 'out'
    `);
    
    // คำนวณมูลค่าสินค้าคงเหลือ (จำนวนสินค้าคงเหลือทั้งหมด)
    const totalInventory = await db.query(`
      SELECT COALESCE(SUM(current_stock), 0) as total_inventory 
      FROM products
    `);
    
    // คำนวณมูลค่าสินค้าของสดคงเหลือ
    const totalFreshInventory = await db.query(`
      SELECT COALESCE(SUM(current_stock), 0) as total_fresh_inventory 
      FROM fresh_products
    `);
    
    // นับจำนวนสินค้าที่ใกล้หมดอายุ
    const expiringProductsCount = await db.query(`
      SELECT COUNT(*) as count 
      FROM product_lots 
      WHERE expiry_date <= CURRENT_DATE + INTERVAL '7 days' 
      AND remaining_quantity > 0 
      AND quality_status = 'good'
    `);
    
    const stats = {
      totalProducts: parseInt(productsCount.rows[0].count),
      totalFreshProducts: parseInt(freshProductsCount.rows[0].count),
      totalCategories: parseInt(categoriesCount.rows[0].count),
      totalFreshCategories: parseInt(freshCategoriesCount.rows[0].count),
      totalSuppliers: parseInt(suppliersCount.rows[0].count),
      totalTransactions: parseInt(transactionsCount.rows[0].count),
      totalFreshTransactions: parseInt(freshTransactionsCount.rows[0].count),
      totalSales: parseInt(totalSales.rows[0].total_sales),
      totalInventory: parseInt(totalInventory.rows[0].total_inventory),
      totalFreshInventory: parseFloat(totalFreshInventory.rows[0].total_fresh_inventory),
      expiringProducts: parseInt(expiringProductsCount.rows[0].count)
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/overview - ภาพรวม dashboard
router.get('/overview', async (req, res) => {
  try {
    // สถิติภาพรวม
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM fresh_products) as total_fresh_products,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COUNT(*) FROM fresh_categories) as total_fresh_categories,
        (SELECT COUNT(*) FROM suppliers) as total_suppliers,
        (SELECT COUNT(*) FROM transactions) as total_transactions,
        (SELECT COUNT(*) FROM fresh_stock_transactions) as total_fresh_transactions,
        (SELECT COALESCE(SUM(quantity), 0) FROM transactions WHERE type = 'out') as total_sales,
        (SELECT COALESCE(SUM(current_stock), 0) FROM products) as total_inventory,
        (SELECT COALESCE(SUM(current_stock), 0) FROM fresh_products) as total_fresh_inventory
    `);

    // สินค้าล่าสุดที่เพิ่ม
    const recentProducts = await db.query(`
      SELECT p.id, p.name, p.current_stock, p.price, c.name as category_name, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // ธุรกรรมล่าสุด
    const recentTransactions = await db.query(`
      SELECT t.id, t.type, t.quantity, t.created_at, p.name as product_name
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

    const overview = {
      stats: {
        totalProducts: parseInt(stats.rows[0].total_products),
        totalFreshProducts: parseInt(stats.rows[0].total_fresh_products),
        totalCategories: parseInt(stats.rows[0].total_categories),
        totalFreshCategories: parseInt(stats.rows[0].total_fresh_categories),
        totalSuppliers: parseInt(stats.rows[0].total_suppliers),
        totalTransactions: parseInt(stats.rows[0].total_transactions),
        totalFreshTransactions: parseInt(stats.rows[0].total_fresh_transactions),
        totalSales: parseInt(stats.rows[0].total_sales),
        totalInventory: parseInt(stats.rows[0].total_inventory),
        totalFreshInventory: parseFloat(stats.rows[0].total_fresh_inventory)
      },
      recentProducts: recentProducts.rows.map(product => ({
        id: product.id,
        name: product.name,
        currentStock: product.current_stock,
        price: product.price,
        categoryName: product.category_name,
        createdAt: product.created_at
      })),
      recentTransactions: recentTransactions.rows.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        quantity: transaction.quantity,
        productName: transaction.product_name,
        createdAt: transaction.created_at
      }))
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// GET /api/dashboard/recent-transactions - ธุรกรรมล่าสุด
router.get('/recent-transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentTransactions = await db.query(`
      SELECT 
        t.id,
        t.type,
        t.quantity,
        t.created_at,
        p.name as product_name,
        p.current_stock,
        c.name as category_name,
        u.username as created_by
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
      LIMIT $1
    `, [limit]);

    const transactions = recentTransactions.rows.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      quantity: transaction.quantity,
      productName: transaction.product_name,
      currentStock: transaction.current_stock,
      categoryName: transaction.category_name,
      createdBy: transaction.created_by,
      createdAt: transaction.created_at
    }));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
});

// GET /api/dashboard/low-stock - สินค้าที่มีสต็อกต่ำ
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.current_stock,
        p.min_stock_quantity,
        p.price,
        c.name as category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.current_stock <= p.min_stock_quantity
      ORDER BY (p.min_stock_quantity - p.current_stock) DESC
    `);

    const products = lowStockProducts.rows.map(product => ({
      id: product.id,
      name: product.name,
      currentStock: product.current_stock,
      minStockQuantity: product.min_stock_quantity,
      price: product.price,
      categoryName: product.category_name,
      createdAt: product.created_at,
      stockStatus: product.current_stock === 0 ? 'out_of_stock' : 'low_stock'
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// GET /api/dashboard/top-products - สินค้าขายดี
router.get('/top-products', async (req, res) => {
  try {
    const topProducts = await db.query(`
      SELECT 
        p.id,
        p.name,
        c.name as category_name,
        COALESCE(SUM(t.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN transactions t ON p.id = t.product_id
      WHERE t.type = 'out' OR t.type IS NULL
      GROUP BY p.id, p.name, c.name
      ORDER BY total_sold DESC
      LIMIT 10
    `);
    res.json(topProducts.rows);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

module.exports = router; 