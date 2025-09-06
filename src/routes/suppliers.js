// backend/src/routes/suppliers.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// ========================================
// Suppliers Management
// ========================================

// GET /api/suppliers - ดึงข้อมูล suppliers ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, name, contact_person, email, phone, address, tax_id,
        payment_terms, is_active, notes, created_at, updated_at
      FROM suppliers 
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching suppliers:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/suppliers/:id - ดึงข้อมูล supplier ตาม ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        id, name, contact_person, email, phone, address, tax_id,
        payment_terms, is_active, notes, created_at, updated_at
      FROM suppliers 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching supplier by ID:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/suppliers - เพิ่ม supplier ใหม่
router.post('/', async (req, res) => {
  const { 
    name, 
    contactPerson, 
    email, 
    phone, 
    address, 
    taxId, 
    paymentTerms, 
    notes 
  } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name) {
    return res.status(400).json({ 
      message: 'Supplier name is required' 
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO suppliers (
        name, contact_person, email, phone, address, tax_id,
        payment_terms, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [name, contactPerson, email, phone, address, taxId, paymentTerms, notes]
    );

    res.status(201).json({
      message: 'Supplier added successfully',
      supplier: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding supplier:', err.message);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ message: 'Supplier name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// PUT /api/suppliers/:id - อัปเดต supplier
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
    const queryText = `UPDATE suppliers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      message: 'Supplier updated successfully',
      supplier: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating supplier:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/suppliers/:id - ลบ supplier
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // ตรวจสอบว่ามีสินค้าที่ใช้ supplier นี้อยู่หรือไม่
    const productsCheck = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE supplier_id = $1',
      [id]
    );

    const freshProductsCheck = await db.query(
      'SELECT COUNT(*) as count FROM fresh_products WHERE supplier_id = $1',
      [id]
    );

    const totalProducts = parseInt(productsCheck.rows[0].count) + parseInt(freshProductsCheck.rows[0].count);

    if (totalProducts > 0) {
      return res.status(400).json({ 
        message: `Cannot delete supplier. There are ${totalProducts} products associated with this supplier.` 
      });
    }

    const result = await db.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Error deleting supplier:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/suppliers/:id/products - ดึงข้อมูลสินค้าทั้งหมดของ supplier
router.get('/:id/products', async (req, res) => {
  const { id } = req.params;
  try {
    // ดึงสินค้าทั่วไป
    const regularProducts = await db.query(`
      SELECT 
        p.id, p.name, p.sku, p.current_stock, p.price, p.status,
        c.name as category_name, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.supplier_id = $1
      ORDER BY p.name ASC
    `, [id]);

    // ดึงสินค้าของสด
    const freshProducts = await db.query(`
      SELECT 
        fp.id, fp.name, fp.sku, fp.current_stock, fp.unit, fp.price_per_unit, fp.status,
        fc.name as category_name, fp.created_at
      FROM fresh_products fp
      LEFT JOIN fresh_categories fc ON fp.category_id = fc.id
      WHERE fp.supplier_id = $1
      ORDER BY fp.name ASC
    `, [id]);

    res.json({
      regularProducts: regularProducts.rows,
      freshProducts: freshProducts.rows,
      totalProducts: regularProducts.rows.length + freshProducts.rows.length
    });
  } catch (err) {
    console.error('Error fetching supplier products:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/suppliers/:id/transactions - ดึงข้อมูลธุรกรรมของ supplier
router.get('/:id/transactions', async (req, res) => {
  const { id } = req.params;
  try {
    // ดึงธุรกรรมสินค้าทั่วไป
    const regularTransactions = await db.query(`
      SELECT 
        t.id, t.type, t.quantity, t.transaction_date, t.unit_price, t.total_amount,
        p.name as product_name, p.sku as product_sku
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      WHERE p.supplier_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 50
    `, [id]);

    // ดึงธุรกรรมสินค้าของสด
    const freshTransactions = await db.query(`
      SELECT 
        fst.id, fst.type, fst.quantity, fst.transaction_date, fst.unit_price, fst.total_amount,
        fp.name as product_name, fp.sku as product_sku
      FROM fresh_stock_transactions fst
      JOIN fresh_products fp ON fst.product_id = fp.id
      WHERE fp.supplier_id = $1
      ORDER BY fst.transaction_date DESC
      LIMIT 50
    `, [id]);

    res.json({
      regularTransactions: regularTransactions.rows,
      freshTransactions: freshTransactions.rows,
      totalTransactions: regularTransactions.rows.length + freshTransactions.rows.length
    });
  } catch (err) {
    console.error('Error fetching supplier transactions:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/suppliers/active - ดึงข้อมูล suppliers ที่ใช้งานอยู่
router.get('/status/active', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, name, contact_person, email, phone, address
      FROM suppliers 
      WHERE is_active = true
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active suppliers:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/suppliers/:id/status - อัปเดตสถานะของ supplier
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive must be a boolean value' });
  }

  try {
    const result = await db.query(
      'UPDATE suppliers SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      message: `Supplier ${isActive ? 'activated' : 'deactivated'} successfully`,
      supplier: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating supplier status:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/suppliers/search/:query - ค้นหา suppliers
router.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        id, name, contact_person, email, phone, address, tax_id,
        payment_terms, is_active, notes
      FROM suppliers 
      WHERE 
        name ILIKE $1 OR 
        contact_person ILIKE $1 OR 
        email ILIKE $1 OR 
        phone ILIKE $1 OR
        address ILIKE $1
      ORDER BY name ASC
    `, [`%${query}%`]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching suppliers:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;





