const express = require('express');
const db = require('../db'); // นำเข้าโมดูล db ที่คุณสร้างไว้
const router = express.Router();

// Middleware สำหรับตรวจสอบว่าผู้ใช้เป็น Admin (ตัวอย่างง่ายๆ)
// ในแอปจริงควรใช้ JWT token verification
const isAdmin = (req, res, next) => {
  // สำหรับตอนนี้ เราจะอนุญาตให้ทุกคนเข้าถึงได้
  // ในอนาคตคุณอาจจะเพิ่ม logic เช่น:
  // if (req.user && req.user.role === 'admin') {
  //   next();
  // } else {
  //   res.status(403).json({ message: 'Forbidden: Admin access required' });
  // }
  next(); // อนุญาตไปก่อน
};

/**
 * @route GET /api/products
 * @description ดึงข้อมูลสินค้าทั้งหมด พร้อมข้อมูลหมวดหมู่
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.current_stock as "currentStock",
        p.min_stock_quantity as "minStockQuantity",
        p.price,
        p.image_url as "image",
        c.name as "categoryName",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt"
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route GET /api/products/:id
 * @description ดึงข้อมูลสินค้าตาม ID พร้อมข้อมูลหมวดหมู่
 * @access Public
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.current_stock as "currentStock",
        p.min_stock_quantity as "minStockQuantity",
        p.price,
        p.image_url as "image",
        c.name as "categoryName",
        p.category_id as "categoryId", -- เพิ่ม categoryId เพื่อใช้ในการแก้ไข
        p.created_at as "createdAt",
        p.updated_at as "updatedAt"
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product by ID:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route POST /api/products
 * @description เพิ่มสินค้าใหม่
 * @access Admin (ในอนาคต)
 */
router.post('/', isAdmin, async (req, res) => {
  const { name, description, currentStock, minStockQuantity, price, categoryId, imageUrl } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || currentStock === undefined || minStockQuantity === undefined || price === undefined) {
    return res.status(400).json({ message: 'Name, currentStock, minStockQuantity, and price are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO products (name, description, current_stock, min_stock_quantity, price, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, current_stock as "currentStock", min_stock_quantity as "minStockQuantity", price, image_url as "image", created_at as "createdAt", updated_at as "updatedAt"`,
      [name, description, currentStock, minStockQuantity, price, categoryId, imageUrl || null]
    );

    // ถ้ามีการระบุ categoryId ให้ดึง categoryName มาด้วย
    let newProduct = result.rows[0];
    if (categoryId) {
      const categoryResult = await db.query('SELECT name FROM categories WHERE id = $1', [categoryId]);
      if (categoryResult.rows.length > 0) {
        newProduct.categoryName = categoryResult.rows[0].name;
      }
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route PUT /api/products/:id
 * @description อัพเดทสินค้า
 * @access Admin (ในอนาคต)
 */
router.put('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, sku, currentStock, minStockQuantity, price, categoryId, imageUrl } = req.body;
  
  console.log('🔄 Updating product:', { id, name, description, sku, currentStock, minStockQuantity, price, categoryId, imageUrl });

  // สร้าง array สำหรับ fields ที่จะอัพเดทและ values
  const updates = [];
  const values = [id]; // ค่าแรกคือ id สำหรับ WHERE clause
  let paramIndex = 2; // เริ่มต้นที่ $2 สำหรับค่าที่จะอัพเดท

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (sku !== undefined) {
    updates.push(`sku = $${paramIndex++}`);
    values.push(sku);
  }
  if (currentStock !== undefined) {
    updates.push(`current_stock = $${paramIndex++}`);
    values.push(currentStock);
  }
  if (minStockQuantity !== undefined) {
    updates.push(`min_stock_quantity = $${paramIndex++}`);
    values.push(minStockQuantity);
  }
  if (price !== undefined) {
    updates.push(`price = $${paramIndex++}`);
    values.push(price);
  }
  if (imageUrl !== undefined) {
    updates.push(`image_url = $${paramIndex++}`);
    values.push(imageUrl);
  }
  if (categoryId !== undefined) { // categoryId สามารถเป็น null ได้ถ้าต้องการลบหมวดหมู่
    updates.push(`category_id = $${paramIndex++}`);
    values.push(categoryId);
  }

  // เพิ่ม updated_at
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  try {
    console.log('📝 SQL Query:', `UPDATE products SET ${updates.join(', ')} WHERE id = $1`);
    console.log('🔢 Values:', values);
    
    const result = await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $1
       RETURNING id, name, description, sku, current_stock as "currentStock", min_stock_quantity as "minStockQuantity", price, image_url as "image", created_at as "createdAt", updated_at as "updatedAt", category_id as "categoryId"`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ถ้ามีการระบุ categoryId ให้ดึง categoryName มาด้วย
    let updatedProduct = result.rows[0];
    if (updatedProduct.categoryId) {
      const categoryResult = await db.query('SELECT name FROM categories WHERE id = $1', [updatedProduct.categoryId]);
      if (categoryResult.rows.length > 0) {
        updatedProduct.categoryName = categoryResult.rows[0].name;
      }
    } else {
      updatedProduct.categoryName = null; // ถ้า categoryId เป็น null ก็ไม่มี categoryName
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route DELETE /api/products/:id
 * @description ลบสินค้า
 * @access Admin (ในอนาคต)
 */
router.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
