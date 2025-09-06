// backend/migrations/add_image_url_to_products.js
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl
});

async function addImageUrlColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 ตรวจสอบโครงสร้างตาราง products...');
    
    // ตรวจสอบว่าคอลัมน์ image_url มีอยู่แล้วหรือไม่
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'image_url'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ คอลัมน์ image_url มีอยู่แล้วในตาราง products');
      return;
    }
    
    console.log('➕ เพิ่มคอลัมน์ image_url ในตาราง products...');
    
    // เพิ่มคอลัมน์ image_url
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN image_url TEXT
    `);
    
    console.log('✅ เพิ่มคอลัมน์ image_url สำเร็จ');
    
    // ตรวจสอบโครงสร้างตารางใหม่
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 โครงสร้างตาราง products ใหม่:');
    tableStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigration() {
  try {
    console.log('🚀 เริ่มต้น Migration: เพิ่มคอลัมน์ image_url...');
    await addImageUrlColumn();
    console.log('🎉 Migration เสร็จสิ้น!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration ล้มเหลว:', error);
    process.exit(1);
  }
}

// รัน migration ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  runMigration();
}

module.exports = { addImageUrlColumn };

