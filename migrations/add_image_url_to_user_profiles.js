// backend/migrations/add_image_url_to_user_profiles.js
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl
});

async function addImageUrlToUserProfiles() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 ตรวจสอบโครงสร้างตาราง user_profiles...');
    
    // ตรวจสอบว่าคอลัมน์ image_url มีอยู่แล้วหรือไม่
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' AND column_name = 'image_url'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ คอลัมน์ image_url มีอยู่แล้วในตาราง user_profiles');
      return;
    }
    
    console.log('➕ เพิ่มคอลัมน์ image_url ในตาราง user_profiles...');
    
    // เพิ่มคอลัมน์ image_url
    await client.query(`
      ALTER TABLE user_profiles 
      ADD COLUMN image_url TEXT
    `);
    
    console.log('✅ เพิ่มคอลัมน์ image_url สำเร็จ');
    
    // ตรวจสอบโครงสร้างตารางใหม่
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 โครงสร้างตาราง user_profiles ใหม่:');
    tableStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
    // อัปเดตข้อมูลที่มีอยู่ให้มี image_url เป็น null
    const updateResult = await client.query(`
      UPDATE user_profiles 
      SET image_url = NULL 
      WHERE image_url IS NULL
    `);
    
    console.log(`✅ อัปเดตข้อมูล ${updateResult.rowCount} รายการ`);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigration() {
  try {
    console.log('🚀 เริ่มต้น Migration: เพิ่มคอลัมน์ image_url ใน user_profiles...');
    await addImageUrlToUserProfiles();
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

module.exports = { addImageUrlToUserProfiles };


