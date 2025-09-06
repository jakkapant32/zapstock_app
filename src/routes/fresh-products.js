// backend/src/routes/fresh-products.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// ========================================
// Fresh Products Management
// ========================================

// GET /api/fresh-products - ดึงข้อมูลสินค้าของสดทั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        fp.id,
        fp.name,
        fp.description,
        fp.sku,
        fp.barcode,
        fp.current_stock,
        fp.unit,
        fp.min_stock_quantity,
        fp.price_per_unit,
        fp.cost_price_per_unit,
        fp.image_url,
        fp.status,
        fp.storage_location,
        fp.temperature_zone,
        fc.name as category_name,
        fc.storage_condition,
        fc.shelf_life_days,
        s.name as supplier_name,
        fp.created_at,
        fp.updated_at
      FROM fresh_products fp
      LEFT JOIN fresh_categories fc ON fp.category_id = fc.id
      LEFT JOIN suppliers s ON fp.supplier_id = s.id
      ORDER BY fp.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching fresh products:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/fresh-products/:id - ดึงข้อมูลสินค้าของสดตาม ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT
        fp.id,
        fp.name,
        fp.description,
        fp.sku,
        fp.barcode,
        fp.current_stock,
        fp.unit,
        fp.min_stock_quantity,
        fp.price_per_unit,
        fp.cost_price_per_unit,
        fp.image_url,
        fp.status,
        fp.storage_location,
        fp.temperature_zone,
        fc.name as category_name,
        fc.id as category_id,
        fc.storage_condition,
        fc.shelf_life_days,
        s.name as supplier_name,
        s.id as supplier_id,
        fp.created_at,
        fp.updated_at
      FROM fresh_products fp
      LEFT JOIN fresh_categories fc ON fp.category_id = fc.id
      LEFT JOIN suppliers s ON fp.supplier_id = s.id
      WHERE fp.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Fresh product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching fresh product by ID:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/fresh-products - เพิ่มสินค้าของสดใหม่
router.post('/', async (req, res) => {
  const { 
    name, 
    description, 
    sku, 
    barcode, 
    currentStock, 
    unit, 
    minStockQuantity, 
    pricePerUnit, 
    costPricePerUnit, 
    categoryId, 
    supplierId, 
    storageLocation, 
    temperatureZone,
    imageUrl 
  } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || !sku || currentStock === undefined || !unit || minStockQuantity === undefined) {
    return res.status(400).json({ 
      message: 'Name, SKU, currentStock, unit, and minStockQuantity are required' 
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO fresh_products (
        name, description, sku, barcode, current_stock, unit, min_stock_quantity,
        price_per_unit, cost_price_per_unit, category_id, supplier_id,
        storage_location, temperature_zone, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [name, description, sku, barcode, currentStock, unit, minStockQuantity,
       pricePerUnit, costPricePerUnit, categoryId, supplierId,
       storageLocation, temperatureZone, imageUrl]
    );

    res.status(201).json({
      message: 'Fresh product added successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding fresh product:', err.message);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ message: 'SKU or barcode already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// PUT /api/fresh-products/:id - อัปเดตสินค้าของสด
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    // สร้าง dynamic query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramIndex++}`);
        values.push(updateFields[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const queryText = `UPDATE fresh_products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Fresh product not found' });
    }

    res.json({
      message: 'Fresh product updated successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating fresh product:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/fresh-products/:id - ลบสินค้าของสด
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM fresh_products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Fresh product not found' });
    }

    res.json({ message: 'Fresh product deleted successfully' });
  } catch (err) {
    console.error('Error deleting fresh product:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ========================================
// Fresh Categories Management
// ========================================

// GET /api/fresh-products/categories - ดึงข้อมูลหมวดหมู่สินค้าของสด
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, shelf_life_days, storage_condition, 
             temperature_range, humidity_range, created_at, updated_at
      FROM fresh_categories 
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching fresh categories:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/fresh-products/categories - เพิ่มหมวดหมู่สินค้าของสดใหม่
router.post('/categories', async (req, res) => {
  const { name, description, shelfLifeDays, storageCondition, temperatureRange, humidityRange } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO fresh_categories (name, description, shelf_life_days, storage_condition, temperature_range, humidity_range)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, shelfLifeDays, storageCondition, temperatureRange, humidityRange]
    );

    res.status(201).json({
      message: 'Fresh category added successfully',
      category: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding fresh category:', err.message);
    if (err.code === '23505') {
      res.status(400).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// ========================================
// Product Lots Management
// ========================================

// GET /api/fresh-products/:id/lots - ดึงข้อมูลล็อตสินค้าของสินค้าที่ระบุ
router.get('/:id/lots', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        pl.id,
        pl.lot_number,
        pl.production_date,
        pl.expiry_date,
        pl.quantity,
        pl.remaining_quantity,
        pl.unit_price,
        pl.supplier_name,
        pl.batch_number,
        pl.quality_status,
        pl.storage_condition,
        pl.notes,
        pl.created_at,
        pl.updated_at
      FROM product_lots pl
      WHERE pl.product_id = $1
      ORDER BY pl.expiry_date ASC
    `, [id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching product lots:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/fresh-products/:id/lots - เพิ่มล็อตสินค้าใหม่
router.post('/:id/lots', async (req, res) => {
  const { id } = req.params;
  const { 
    lotNumber, 
    productionDate, 
    expiryDate, 
    quantity, 
    unitPrice, 
    supplierName, 
    batchNumber, 
    storageCondition, 
    notes 
  } = req.body;

  if (!lotNumber || !expiryDate || quantity === undefined) {
    return res.status(400).json({ 
      message: 'Lot number, expiry date, and quantity are required' 
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO product_lots (
        product_id, lot_number, production_date, expiry_date, quantity, 
        remaining_quantity, unit_price, supplier_name, batch_number, 
        storage_condition, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [id, lotNumber, productionDate, expiryDate, quantity, quantity, 
       unitPrice, supplierName, batchNumber, storageCondition, notes]
    );

    // อัปเดตสต็อกสินค้า
    await db.query(
      `UPDATE fresh_products 
       SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [quantity, id]
    );

    res.status(201).json({
      message: 'Product lot added successfully',
      lot: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding product lot:', err.message);
    if (err.code === '23505') {
      res.status(400).json({ message: 'Lot number already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// ========================================
// Stock Transactions
// ========================================

// POST /api/fresh-products/:id/transactions - บันทึกการเคลื่อนไหวสต็อก
router.post('/:id/transactions', async (req, res) => {
  const { id } = req.params;
  const { 
    lotId, 
    type, 
    quantity, 
    unitPrice, 
    referenceNumber, 
    reason, 
    temperatureAtTransaction, 
    notes 
  } = req.body;

  if (!type || quantity === undefined || quantity <= 0) {
    return res.status(400).json({ 
      message: 'Transaction type and positive quantity are required' 
    });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    if (unitPrice) {
      totalAmount = unitPrice * quantity;
    }

    // บันทึกธุรกรรม
    const transactionResult = await client.query(
      `INSERT INTO fresh_stock_transactions (
        product_id, lot_id, type, quantity, unit_price, total_amount,
        reference_number, reason, temperature_at_transaction, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [id, lotId, type, quantity, unitPrice, totalAmount,
       referenceNumber, reason, temperatureAtTransaction, notes]
    );

    // อัปเดตสต็อกสินค้า
    let stockUpdateQuery = '';
    if (type === 'in') {
      stockUpdateQuery = 'UPDATE fresh_products SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    } else if (type === 'out') {
      stockUpdateQuery = 'UPDATE fresh_products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    } else if (type === 'waste' || type === 'damage') {
      stockUpdateQuery = 'UPDATE fresh_products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    }

    if (stockUpdateQuery) {
      await client.query(stockUpdateQuery, [quantity, id]);
    }

    // อัปเดตจำนวนคงเหลือในล็อต (ถ้ามี lotId)
    if (lotId && (type === 'out' || type === 'waste' || type === 'damage')) {
      await client.query(
        `UPDATE product_lots 
         SET remaining_quantity = remaining_quantity - $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [quantity, lotId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Stock transaction recorded successfully',
      transaction: transactionResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing stock transaction:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});

// ========================================
// Expiry Alerts
// ========================================

// GET /api/fresh-products/expiring - ดึงข้อมูลสินค้าที่ใกล้หมดอายุ
router.get('/expiring', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM expiring_products
      ORDER BY days_until_expiry ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expiring products:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/fresh-products/expiring/:days - ดึงข้อมูลสินค้าที่หมดอายุในจำนวนวันที่ระบุ
router.get('/expiring/:days', async (req, res) => {
  const { days } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        fp.id,
        fp.name,
        fp.sku,
        pl.lot_number,
        pl.expiry_date,
        pl.remaining_quantity,
        fp.unit,
        pl.expiry_date - CURRENT_DATE as days_until_expiry,
        CASE 
          WHEN pl.expiry_date - CURRENT_DATE <= 0 THEN 'expired'
          WHEN pl.expiry_date - CURRENT_DATE <= 1 THEN 'expiring_today'
          WHEN pl.expiry_date - CURRENT_DATE <= $1 THEN 'expiring_soon'
          ELSE 'normal'
        END as expiry_status
      FROM fresh_products fp
      JOIN product_lots pl ON fp.id = pl.product_id
      WHERE pl.remaining_quantity > 0 
      AND pl.quality_status = 'good'
      AND pl.expiry_date <= CURRENT_DATE + INTERVAL '1 day' * $1
      ORDER BY pl.expiry_date ASC
    `, [days]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expiring products:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ========================================
// Quality Checks
// ========================================

// POST /api/fresh-products/:id/quality-check - บันทึกการตรวจสอบคุณภาพ
router.post('/:id/quality-check', async (req, res) => {
  const { id } = req.params;
  const { 
    lotId, 
    checkType, 
    temperature, 
    humidity, 
    qualityScore, 
    status, 
    issues, 
    correctiveAction 
  } = req.body;

  if (!checkType || !status) {
    return res.status(400).json({ 
      message: 'Check type and status are required' 
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO quality_checks (
        product_id, lot_id, check_type, temperature, humidity, quality_score,
        status, issues, corrective_action
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [id, lotId, checkType, temperature, humidity, qualityScore,
       status, issues, correctiveAction]
    );

    res.status(201).json({
      message: 'Quality check recorded successfully',
      qualityCheck: result.rows[0]
    });
  } catch (err) {
    console.error('Error recording quality check:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ========================================
// Temperature Logs
// ========================================

// POST /api/fresh-products/temperature-log - บันทึกการตรวจสอบอุณหภูมิ
router.post('/temperature-log', async (req, res) => {
  const { location, temperature, humidity, notes } = req.body;

  if (!location || temperature === undefined) {
    return res.status(400).json({ 
      message: 'Location and temperature are required' 
    });
  }

  try {
    // กำหนดสถานะตามอุณหภูมิ
    let status = 'normal';
    if (temperature < -10 || temperature > 10) {
      status = 'critical';
    } else if (temperature < -5 || temperature > 5) {
      status = 'warning';
    }

    const result = await db.query(
      `INSERT INTO temperature_logs (location, temperature, humidity, status, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [location, temperature, humidity, status, notes]
    );

    res.status(201).json({
      message: 'Temperature log recorded successfully',
      temperatureLog: result.rows[0]
    });
  } catch (err) {
    console.error('Error recording temperature log:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/fresh-products/temperature-logs - ดึงข้อมูลการตรวจสอบอุณหภูมิ
router.get('/temperature-logs', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, location, temperature, humidity, log_date, status, notes, created_at
      FROM temperature_logs
      ORDER BY log_date DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching temperature logs:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;





