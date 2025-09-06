// backend/src/routes/transactions.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// FR1: บันทึกการรับเข้า/เบิกออกสินค้า
router.post('/', async (req, res) => {
  const { productId, type, quantity } = req.body; // type: 'in' หรือ 'out'
  if (!productId || !type || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Product ID, type (in/out), and a positive quantity are required.' });
  }

  const client = await db.getClient(); // ขอ client จาก pool เพื่อทำ Transaction
  try {
    await client.query('BEGIN'); // เริ่ม Transaction

    // ตรวจสอบและอัปเดตสต็อกสินค้า (FR2: Real-time update)
    let updateQuery = '';
    let productUpdateResult;

    if (type === 'in') {
      updateQuery = 'UPDATE products SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING current_stock, min_stock_quantity';
      productUpdateResult = await client.query(updateQuery, [quantity, productId]);
    } else if (type === 'out') {
      // ตรวจสอบสต็อกก่อนเบิกออก (Prevent negative stock)
      const currentProduct = await client.query('SELECT current_stock, min_stock_quantity FROM products WHERE id = $1 FOR UPDATE', [productId]);
      if (currentProduct.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found' });
      }
      if (currentProduct.rows[0].current_stock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'สินค้าในสต็อกไม่เพียงพอต่อการเบิกออก' });
      }
      updateQuery = 'UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING current_stock, min_stock_quantity';
      productUpdateResult = await client.query(updateQuery, [quantity, productId]);
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid transaction type. Must be "in" or "out".' });
    }

    if (productUpdateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found after update attempt.' });
    }

    const { current_stock: newCurrentStock, min_stock_quantity: minStockQuantity } = productUpdateResult.rows[0];

    // บันทึกธุรกรรม
    const transactionResult = await client.query(
      'INSERT INTO transactions (product_id, type, quantity, transaction_date) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [productId, type, quantity]
    );

    await client.query('COMMIT'); // Commit Transaction หากทุกอย่างสำเร็จ

    // FR3: แจ้งเตือนเมื่อสินค้าต่ำกว่าขั้นต่ำ - Logic สามารถอยู่ที่นี่หรือเป็น Cron Job
    let lowStockWarning = false;
    if (newCurrentStock < minStockQuantity) {
      lowStockWarning = true;
      console.warn(`Product ${productId} stock (${newCurrentStock}) is below minimum (${minStockQuantity})!`);
      // ในแอปจริง: ส่ง Push Notification, Email, หรือบันทึกในระบบแจ้งเตือน
    }

    res.status(201).json({
      message: 'Transaction recorded and stock updated.',
      newCurrentStock: newCurrentStock,
      transaction: transactionResult.rows[0],
      lowStockWarning: lowStockWarning
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback Transaction หากมีข้อผิดพลาด
    console.error('Error processing transaction:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  } finally {
    client.release(); // คืน client กลับสู่ pool
  }
});

// FR5: ดึงรายงานสรุปธุรกรรม (ตัวอย่าง: ดึงทุกธุรกรรม)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        t.id,
        t.type,
        t.quantity,
        t.transaction_date as "transactionDate",
        p.name as "productName",
        p.description as "productDescription"
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      ORDER BY t.transaction_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

module.exports = router;