// backend/src/routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ดึงข้อมูลหมวดหมู่ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        name, 
        description, 
        image_url as "imageUrl",
        is_active as "isActive",
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM categories 
      WHERE is_active = true
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// เพิ่มหมวดหมู่ใหม่
router.post('/', async (req, res) => {
  const { name, description, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  try {
    const result = await db.query(
      'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, imageUrl || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding category:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// อัปเดตหมวดหมู่ที่มีอยู่
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl } = req.body;

  // ตรวจสอบว่ามีการส่งข้อมูลมาหรือไม่
  if (!name) {
    return res.status(400).json({ error: 'Category name is required to update.' });
  }

  try {
    const result = await db.query(
      'UPDATE categories SET name = $1, description = $2, image_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description || null, imageUrl || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating category:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// ลบหมวดหมู่ที่มีอยู่ (ส่วนเสริม)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

module.exports = router;