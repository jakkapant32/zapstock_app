const express = require('express');
const router = express.Router();
const db = require('../db');

// ดึงข้อมูลหมวดหมู่ทั้งหมด
router.get('/', async (req, res) => {
  try {
    // แก้ไขให้เลือก image_url มาด้วย
    const result = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// เพิ่มหมวดหมู่ใหม่
router.post('/', async (req, res) => {
  const { name } = req.body; // รับเฉพาะ name
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  try {
    // แก้ไข query ให้เพิ่มเฉพาะ name
    const result = await db.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
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
  const { name } = req.body;

  // ตรวจสอบว่ามีการส่งข้อมูลมาหรือไม่
  if (!name) {
    return res.status(400).json({ error: 'Category name is required to update.' });
  }

  try {
    const result = await db.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
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
