// backend/src/routes/products.js
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
        p.sku,
        p.barcode,
        p.current_stock as "currentStock",
        p.min_stock_quantity as "minStockQuantity",
        p.max_stock_quantity as "maxStockQuantity",
        p.price,
        p.cost_price as "costPrice",
        p.weight,
        p.dimensions,
        p.image_url as "image",
        p.status,
        p.category_id as "categoryId",
        p.supplier_id as "supplierId",
        p.created_by as "createdBy",
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
        p.sku,
        p.barcode,
        p.current_stock as "currentStock",
        p.min_stock_quantity as "minStockQuantity",
        p.max_stock_quantity as "maxStockQuantity",
        p.price,
        p.cost_price as "costPrice",
        p.weight,
        p.dimensions,
        p.image_url as "image",
        p.status,
        p.category_id as "categoryId",
        p.supplier_id as "supplierId",
        p.created_by as "createdBy",
        c.name as "categoryName",
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
  const { 
    name, description, sku, barcode, currentStock, minStockQuantity, maxStockQuantity, 
    price, costPrice, weight, dimensions, image, status, categoryId, supplierId 
  } = req.body;

  // เพิ่ม logging เพื่อ debug
  console.log('📝 Creating product with data:', {
    name, description, sku, barcode, currentStock, minStockQuantity, maxStockQuantity,
    price, costPrice, weight, dimensions, image, status, categoryId, supplierId
  });

  // ตรวจสอบและแปลง base64 เป็น URL ถ้าจำเป็น
  let imageUrl = image;
  if (image && image.startsWith('data:image/')) {
    console.log('🖼️  ตรวจพบ base64 image, ต้องแปลงเป็น URL ก่อนบันทึก');
    // ในอนาคตอาจจะเพิ่มการอัปโหลดไปยัง cloud storage
    // ตอนนี้ให้บันทึก base64 ไปก่อน
    imageUrl = image;
  }

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || currentStock === undefined || minStockQuantity === undefined || price === undefined) {
    return res.status(400).json({ message: 'Name, currentStock, minStockQuantity, and price are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO products (
        name, description, sku, barcode, current_stock, min_stock_quantity, max_stock_quantity,
        price, cost_price, weight, dimensions, image_url, status, category_id, supplier_id,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
       RETURNING id, name, description, sku, barcode, current_stock as "currentStock", 
       min_stock_quantity as "minStockQuantity", max_stock_quantity as "maxStockQuantity",
       price, cost_price as "costPrice", weight, dimensions, image_url as "image", status,
       category_id as "categoryId", supplier_id as "supplierId", created_at as "createdAt", updated_at as "updatedAt"`,
      [name, description, sku || null, barcode || null, currentStock, minStockQuantity, 
       maxStockQuantity || null, price, costPrice || null, weight || null, dimensions || null,
       imageUrl || null, status || 'active', categoryId || null, supplierId || null]
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
  const { 
    name, description, sku, barcode, currentStock, minStockQuantity, maxStockQuantity,
    price, costPrice, weight, dimensions, image, status, categoryId, supplierId 
  } = req.body;
  
  console.log('🔄 Updating product:', { 
    id, name, description, sku, barcode, currentStock, minStockQuantity, maxStockQuantity,
    price, costPrice, weight, dimensions, image, status, categoryId, supplierId 
  });

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
  if (barcode !== undefined) {
    updates.push(`barcode = $${paramIndex++}`);
    values.push(barcode);
  }
  if (maxStockQuantity !== undefined) {
    updates.push(`max_stock_quantity = $${paramIndex++}`);
    values.push(maxStockQuantity);
  }
  if (costPrice !== undefined) {
    updates.push(`cost_price = $${paramIndex++}`);
    values.push(costPrice);
  }
  if (weight !== undefined) {
    updates.push(`weight = $${paramIndex++}`);
    values.push(weight);
  }
  if (dimensions !== undefined) {
    updates.push(`dimensions = $${paramIndex++}`);
    values.push(dimensions);
  }
  if (image !== undefined) {
    updates.push(`image_url = $${paramIndex++}`);
    values.push(image);
    console.log('  ✅ เพิ่ม image ในอัปเดต:', image);
  }
  if (status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (categoryId !== undefined) { // categoryId สามารถเป็น null ได้ถ้าต้องการลบหมวดหมู่
    updates.push(`category_id = $${paramIndex++}`);
    values.push(categoryId);
  }
  if (supplierId !== undefined) {
    updates.push(`supplier_id = $${paramIndex++}`);
    values.push(supplierId);
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
       RETURNING id, name, description, sku, barcode, current_stock as "currentStock", 
       min_stock_quantity as "minStockQuantity", max_stock_quantity as "maxStockQuantity",
       price, cost_price as "costPrice", weight, dimensions, image_url as "image", status,
       category_id as "categoryId", supplier_id as "supplierId", created_at as "createdAt", updated_at as "updatedAt"`,
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
