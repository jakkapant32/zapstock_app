const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Import database connection
const pool = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const freshProductsRoutes = require('./routes/fresh-products');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const suppliersRoutes = require('./routes/suppliers');
const transactionsRoutes = require('./routes/transactions');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Create tables if they don't exist
const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Read and execute the fresh food schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'fresh_food_schema.sql');
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
        } catch (error) {
          console.log('Statement failed (might already exist):', error.message);
        }
      }
    }

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

createTables();

// Insert default categories if they don't exist
const insertDefaultCategories = async () => {
  try {
    // Categories are already inserted in the schema file
    console.log('Default categories already inserted from schema');
  } catch (error) {
    console.error('Error inserting default categories:', error);
  }
};

insertDefaultCategories();

// Static file serving for uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Simple image upload endpoint (accepts data URL)
app.post('/api/upload', async (req, res) => {
  try {
    console.log('📤 รับคำขออัปโหลดรูปภาพ');
    const { dataUrl } = req.body;
    
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      console.log('❌ รูปภาพไม่ถูกต้อง:', typeof dataUrl, dataUrl ? dataUrl.substring(0, 50) + '...' : 'null');
      return res.status(400).json({ error: 'รูปภาพไม่ถูกต้อง' });
    }
    
    console.log('✅ รูปภาพถูกต้อง ความยาว:', dataUrl.length);

    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'รูปภาพไม่ถูกต้อง' });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const extMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif'
    };
    const fileExt = extMap[mimeType] || 'jpg';
    const filename = `${uuidv4()}.${fileExt}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filepath, buffer);

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    console.log('✅ อัปโหลดรูปภาพสำเร็จ:', filename);
    console.log('🌐 URL สาธารณะ:', publicUrl);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'อัปโหลดรูปภาพไม่สำเร็จ' });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );

    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ',
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    // Find user
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const userData = user.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Create session token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userData.id, token, expiresAt]
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (token) {
      await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    }
    
    res.json({ message: 'ออกจากระบบสำเร็จ' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการออกจากระบบ' });
  }
});

app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Token ไม่ถูกต้อง' });
    }

    const session = await pool.query(
      'SELECT s.*, u.username, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()',
      [token]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }

    res.json({
      valid: true,
      user: {
        id: session.rows[0].user_id,
        username: session.rows[0].username,
        email: session.rows[0].email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบ token' });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;

    if (!token || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // Verify token and get user
    const session = await pool.query(
      'SELECT s.*, u.password_hash FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()',
      [token]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }

    const userData = session.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userData.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userData.user_id]
    );

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
  }
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fresh_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, shelf_life_days, storage_condition, imageUrl, image_url } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อหมวดหมู่' });
    }

    const result = await pool.query(
      'INSERT INTO fresh_categories (name, description, shelf_life_days, storage_condition, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, shelf_life_days, storage_condition, image_url || imageUrl || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่' });
  }
});

// Update category (name/description/image_url)
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, shelf_life_days, storage_condition, imageUrl, image_url } = req.body;

    const result = await pool.query(
      `UPDATE fresh_categories 
       SET 
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         shelf_life_days = COALESCE($3, shelf_life_days),
         storage_condition = COALESCE($4, storage_condition),
         image_url = COALESCE($5, image_url),
         updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, description, shelf_life_days, storage_condition, image_url || imageUrl || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบหมวดหมู่' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่' });
  }
});

// Products Routes
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM fresh_products p 
      LEFT JOIN fresh_categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `);
    
    // Transform data to match frontend expectations
    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      sku: row.sku,
      price: parseFloat(row.price_per_unit) || 0,
      category: row.category_name || 'ไม่ระบุ',
      stock: parseFloat(row.current_stock) || 0,
      unit: row.unit || 'kg',
      image: row.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      status: row.status || 'active',
      categoryId: row.category_id,
      minStockQuantity: parseFloat(row.min_stock_quantity) || 0,
      storageLocation: row.storage_location,
      temperatureZone: row.temperature_zone,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM fresh_products p LEFT JOIN fresh_categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
    
    const row = result.rows[0];
    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      sku: row.sku,
      price: parseFloat(row.price_per_unit) || 0,
      category: row.category_name || 'ไม่ระบุ',
      stock: parseFloat(row.current_stock) || 0,
      unit: row.unit || 'kg',
      image: row.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      status: row.status || 'active',
      categoryId: row.category_id,
      minStockQuantity: parseFloat(row.min_stock_quantity) || 0,
      storageLocation: row.storage_location,
      temperatureZone: row.temperature_zone,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, sku, currentStock, minStockQuantity, price, categoryId, image, unit, storageLocation, temperatureZone } = req.body;
    
    if (!name || currentStock === undefined || minStockQuantity === undefined) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลสินค้าให้ครบถ้วน' });
    }

    // จัดการรูปภาพ
    let finalImageUrl = null;
    if (image) {
      if (image.startsWith('data:')) {
        // ถ้าเป็น base64 ให้อัปโหลด
        try {
          const uploadResponse = await fetch(`${req.protocol}://${req.get('host')}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: image })
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            finalImageUrl = uploadResult.url;
            console.log('✅ รูปภาพถูกอัปโหลดสำเร็จ:', finalImageUrl);
          } else {
            console.log('⚠️ ไม่สามารถอัปโหลดรูปภาพได้ ใช้รูปภาพเดิม');
            finalImageUrl = image;
          }
        } catch (uploadError) {
          console.log('⚠️ เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ ใช้รูปภาพเดิม:', uploadError.message);
          finalImageUrl = image;
        }
      } else {
        // ถ้าเป็น URL ใช้เลย
        finalImageUrl = image;
      }
    }

    // Generate SKU if not provided
    let finalSku = sku;
    if (!finalSku) {
      const timestamp = Date.now().toString().slice(-6);
      finalSku = `SKU${timestamp}`;
    }

    // Check if SKU already exists
    if (sku) {
      const existingSku = await pool.query('SELECT id FROM fresh_products WHERE sku = $1', [sku]);
      if (existingSku.rows.length > 0) {
        return res.status(400).json({ error: 'SKU นี้มีอยู่ในระบบแล้ว' });
      }
    }

    // Determine status based on stock
    let status = 'active';
    if (currentStock === 0) {
      status = 'out_of_stock';
    } else if (currentStock <= minStockQuantity) {
      status = 'active'; // Keep as active but will show as low stock in frontend
    }

    console.log('📦 สร้างสินค้าใหม่:');
    console.log('  - ชื่อ:', name);
    console.log('  - รูปภาพ:', finalImageUrl ? 'มี' : 'ไม่มี');
    console.log('  - รูปภาพ URL:', finalImageUrl);
    
    const result = await pool.query(
      'INSERT INTO fresh_products (name, description, sku, current_stock, min_stock_quantity, price_per_unit, category_id, image_url, status, unit, storage_location, temperature_zone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [name, description, finalSku, currentStock, minStockQuantity, price, categoryId, finalImageUrl, status, unit || 'kg', storageLocation, temperatureZone]
    );
    
    const newProduct = result.rows[0];
    console.log('✅ สินค้าถูกสร้างสำเร็จ ID:', newProduct.id);
    res.status(201).json({
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      sku: newProduct.sku,
      price: parseFloat(newProduct.price_per_unit) || 0,
      category: 'ไม่ระบุ', // Will be updated when fetched with category join
      stock: parseFloat(newProduct.current_stock) || 0,
      unit: newProduct.unit || 'kg',
      image: newProduct.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      status: newProduct.status,
      categoryId: newProduct.category_id,
      minStockQuantity: parseFloat(newProduct.min_stock_quantity) || 0,
      storageLocation: newProduct.storage_location,
      temperatureZone: newProduct.temperature_zone,
      createdAt: newProduct.created_at,
      updatedAt: newProduct.updated_at
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างสินค้า' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sku, currentStock, minStockQuantity, price, categoryId, image, unit, storageLocation, temperatureZone } = req.body;
    
    // Check if SKU already exists (excluding current product)
    if (sku) {
      const existingSku = await pool.query('SELECT id FROM fresh_products WHERE sku = $1 AND id != $2', [sku, id]);
      if (existingSku.rows.length > 0) {
        return res.status(400).json({ error: 'SKU นี้มีอยู่ในระบบแล้ว' });
      }
    }

    // จัดการรูปภาพ
    let finalImageUrl = null;
    if (image) {
      if (image.startsWith('data:')) {
        // ถ้าเป็น base64 ให้อัปโหลด
        try {
          const uploadResponse = await fetch(`${req.protocol}://${req.get('host')}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: image })
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            finalImageUrl = uploadResult.url;
            console.log('✅ รูปภาพถูกอัปโหลดสำเร็จ:', finalImageUrl);
          } else {
            console.log('⚠️ ไม่สามารถอัปโหลดรูปภาพได้ ใช้รูปภาพเดิม');
            finalImageUrl = image;
          }
        } catch (uploadError) {
          console.log('⚠️ เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ ใช้รูปภาพเดิม:', uploadError.message);
          finalImageUrl = image;
        }
      } else {
        // ถ้าเป็น URL ใช้เลย
        finalImageUrl = image;
      }
    }

    // Determine status based on stock
    let status = 'active';
    if (currentStock === 0) {
      status = 'out_of_stock';
    } else if (currentStock <= minStockQuantity) {
      status = 'active';
    }

    console.log('📦 อัปเดตสินค้า:');
    console.log('  - ชื่อ:', name);
    console.log('  - รูปภาพ:', finalImageUrl ? 'มี' : 'ไม่มี');
    console.log('  - รูปภาพ URL:', finalImageUrl);

    const result = await pool.query(
      'UPDATE fresh_products SET name = $1, description = $2, sku = $3, current_stock = $4, min_stock_quantity = $5, price_per_unit = $6, category_id = $7, image_url = $8, status = $9, unit = $10, storage_location = $11, temperature_zone = $12, updated_at = NOW() WHERE id = $13 RETURNING *',
      [name, description, sku, currentStock, minStockQuantity, price, categoryId, finalImageUrl, status, unit || 'kg', storageLocation, temperatureZone, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
    
    const updatedProduct = result.rows[0];
    res.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      sku: updatedProduct.sku,
      price: parseFloat(updatedProduct.price_per_unit) || 0,
      category: 'ไม่ระบุ',
      stock: parseFloat(updatedProduct.current_stock) || 0,
      unit: updatedProduct.unit || 'kg',
      image: updatedProduct.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      status: updatedProduct.status,
      categoryId: updatedProduct.category_id,
      minStockQuantity: parseFloat(updatedProduct.min_stock_quantity) || 0,
      storageLocation: updatedProduct.storage_location,
      temperatureZone: updatedProduct.temperature_zone,
      createdAt: updatedProduct.created_at,
      updatedAt: updatedProduct.updated_at
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัพเดทสินค้า' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM fresh_products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
    
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบสินค้า' });
  }
});

// Transactions Routes
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as product_name 
      FROM fresh_stock_transactions t 
      JOIN fresh_products p ON t.product_id = p.id 
      ORDER BY t.transaction_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการ' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { productId, type, quantity, notes, unitPrice } = req.body;
    
    if (!productId || !type || !quantity) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลรายการให้ครบถ้วน' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create transaction record
      const transactionResult = await client.query(
        'INSERT INTO fresh_stock_transactions (product_id, type, quantity, unit_price, total_amount, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [productId, type, quantity, unitPrice, (unitPrice || 0) * quantity, notes]
      );

      // Update product stock
      const stockChange = type === 'in' ? quantity : -quantity;
      await client.query(
        'UPDATE fresh_products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2',
        [stockChange, productId]
      );

      await client.query('COMMIT');
      res.status(201).json(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างรายการ' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get total products
    const totalProductsResult = await pool.query('SELECT COUNT(*) as count FROM fresh_products');
    const totalProducts = parseInt(totalProductsResult.rows[0].count);

    // Get low stock products (current_stock < min_stock_quantity but > 0)
    const lowStockResult = await pool.query(
      'SELECT COUNT(*) as count FROM fresh_products WHERE current_stock < min_stock_quantity AND current_stock > 0'
    );
    const lowStockProducts = parseInt(lowStockResult.rows[0].count);

    // Get out of stock products
    const outOfStockResult = await pool.query(
      'SELECT COUNT(*) as count FROM fresh_products WHERE current_stock = 0'
    );
    const outOfStockProducts = parseInt(outOfStockResult.rows[0].count);

    // Get total categories
    const totalCategoriesResult = await pool.query('SELECT COUNT(*) as count FROM fresh_categories');
    const totalCategories = parseInt(totalCategoriesResult.rows[0].count);

    // Get total transactions
    const totalTransactionsResult = await pool.query('SELECT COUNT(*) as count FROM fresh_stock_transactions');
    const totalTransactions = parseInt(totalTransactionsResult.rows[0].count);

    // Get today's transactions
    const todayTransactionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM fresh_stock_transactions WHERE DATE(transaction_date) = CURRENT_DATE'
    );
    const todayTransactions = parseInt(todayTransactionsResult.rows[0].count);

    // Get this month's transactions
    const monthlyTransactionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM fresh_stock_transactions WHERE DATE_TRUNC(\'month\', transaction_date) = DATE_TRUNC(\'month\', CURRENT_DATE)'
    );
    const monthlyTransactions = parseInt(monthlyTransactionsResult.rows[0].count);

    // Calculate total value (sum of all product values)
    const totalValueResult = await pool.query(
      'SELECT COALESCE(SUM(current_stock * price_per_unit), 0) as total_value FROM fresh_products WHERE price_per_unit IS NOT NULL'
    );
    const totalValue = parseFloat(totalValueResult.rows[0].total_value);

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalTransactions,
      todayTransactions,
      monthlyTransactions,
      totalValue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
});

app.get('/api/dashboard/top-products', async (req, res) => {
  try {
    // Get top 5 products by total sold (out transactions)
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.current_stock,
        COALESCE(SUM(CASE WHEN t.type = 'out' THEN t.quantity ELSE 0 END), 0) as total_sold
      FROM fresh_products p
      LEFT JOIN fresh_stock_transactions t ON p.id = t.product_id
      GROUP BY p.id, p.name, p.current_stock
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    const topProducts = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      totalSold: parseFloat(row.total_sold),
      currentStock: parseFloat(row.current_stock)
    }));

    res.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าขายดี' });
  }
});

// Profile Routes
app.get('/api/profile/stats', async (req, res) => {
  try {
    // Get total products
    const totalProductsResult = await pool.query('SELECT COUNT(*) as count FROM fresh_products');
    const totalProducts = parseInt(totalProductsResult.rows[0].count);

    // Get low stock items (current_stock < min_stock_quantity but > 0)
    const lowStockResult = await pool.query(
      'SELECT COUNT(*) as count FROM fresh_products WHERE current_stock < min_stock_quantity AND current_stock > 0'
    );
    const lowStockItems = parseInt(lowStockResult.rows[0].count);

    // Get expiring items (products with expiry dates within 7 days)
    const expiringResult = await pool.query(`
      SELECT COUNT(DISTINCT pl.product_id) as count 
      FROM product_lots pl 
      WHERE pl.expiry_date <= CURRENT_DATE + INTERVAL '7 days' 
      AND pl.expiry_date > CURRENT_DATE
    `);
    const expiringItems = parseInt(expiringResult.rows[0].count);

    // Get today's sales (sum of out transactions)
    const todaySalesResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales 
      FROM fresh_stock_transactions 
      WHERE type = 'out' AND DATE(transaction_date) = CURRENT_DATE
    `);
    const todaySales = parseFloat(todaySalesResult.rows[0].total_sales);

    // Get monthly sales
    const monthlySalesResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales 
      FROM fresh_stock_transactions 
      WHERE type = 'out' AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const monthlySales = parseFloat(monthlySalesResult.rows[0].total_sales);

    res.json({
      totalProducts,
      lowStockItems,
      expiringItems,
      todaySales,
      monthlySales
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติโปรไฟล์' });
  }
});

app.put('/api/profile/update', async (req, res) => {
  try {
    const { fullName, email, phone, address } = req.body;
    
    // ในที่นี้จะเป็นการจำลองการอัปเดตโปรไฟล์
    // ในระบบจริงควรมีการตรวจสอบ authentication และอัปเดตในตาราง users
    
    res.json({
      message: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว',
      user: {
        fullName,
        email,
        phone,
        address
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 