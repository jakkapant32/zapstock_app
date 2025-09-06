const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'eazy1_db',
  password: 'your_password', // เปลี่ยนเป็นรหัสผ่าน PostgreSQL ของคุณ
  port: 5432,
});

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    // Read and execute the schema file
    console.log('Creating tables...');
    const schemaPath = path.join(__dirname, 'add_product_tables.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.log('Statement failed (might already exist):', error.message);
        }
      }
    }

    // Insert sample data
    console.log('Inserting sample data...');
    
    // Insert default categories
    const categories = [
      'อุปกรณ์อิเล็กทรอนิกส์',
      'เครื่องเขียน',
      'เสื้อผ้า',
      'อาหาร',
      'เครื่องสำอาง',
      'ของใช้ในบ้าน',
      'กีฬา',
      'หนังสือ',
      'ของเล่น',
      'อื่นๆ'
    ];

    for (const categoryName of categories) {
      await pool.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [categoryName]
      );
    }

    // Insert sample products
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro',
        description: 'สมาร์ทโฟนรุ่นใหม่จาก Apple',
        sku: 'IPH15PRO-001',
        current_stock: 10,
        min_stock_quantity: 5,
        price: 44900.00,
        category_id: null // Will be set after categories are created
      },
      {
        name: 'MacBook Air M3',
        description: 'แล็ปท็อปประสิทธิภาพสูง',
        sku: 'MBA-M3-001',
        current_stock: 5,
        min_stock_quantity: 3,
        price: 39900.00,
        category_id: null
      },
      {
        name: 'AirPods Pro',
        description: 'หูฟังไร้สายคุณภาพสูง',
        sku: 'APP-001',
        current_stock: 25,
        min_stock_quantity: 10,
        price: 8990.00,
        category_id: null
      },
      {
        name: 'iPad Air',
        description: 'แท็บเล็ตสำหรับงานและความบันเทิง',
        sku: 'IPA-AIR-001',
        current_stock: 8,
        min_stock_quantity: 4,
        price: 25900.00,
        category_id: null
      },
      {
        name: 'Apple Watch Series 9',
        description: 'นาฬิกาอัจฉริยะ',
        sku: 'AW-S9-001',
        current_stock: 15,
        min_stock_quantity: 7,
        price: 15900.00,
        category_id: null
      }
    ];

    // Get the first category (อุปกรณ์อิเล็กทรอนิกส์)
    const categoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', ['อุปกรณ์อิเล็กทรอนิกส์']);
    const categoryId = categoryResult.rows[0]?.id;

    for (const product of sampleProducts) {
      product.category_id = categoryId;
      await pool.query(
        `INSERT INTO products (name, description, sku, current_stock, min_stock_quantity, price, category_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (sku) DO NOTHING`,
        [product.name, product.description, product.sku, product.current_stock, product.min_stock_quantity, product.price, product.category_id]
      );
    }

    // Insert sample transactions
    const products = await pool.query('SELECT id FROM products LIMIT 3');
    
    for (const product of products.rows) {
      // Add some stock in transactions
      await pool.query(
        'INSERT INTO transactions (product_id, type, quantity, notes) VALUES ($1, $2, $3, $4)',
        [product.id, 'in', 20, 'Initial stock']
      );
      
      // Add some sales transactions
      await pool.query(
        'INSERT INTO transactions (product_id, type, quantity, notes) VALUES ($1, $2, $3, $4)',
        [product.id, 'out', 5, 'Sale']
      );
    }

    console.log('Database setup completed successfully!');
    console.log('Sample data has been inserted.');
    
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 