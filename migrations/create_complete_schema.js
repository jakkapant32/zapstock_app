// backend/migrations/create_complete_schema.js
const db = require('../src/db');

const createCompleteSchemaSQL = `
-- ========================================
-- PostgreSQL Database Setup สำหรับ Render.com
-- ระบบจัดการสินค้า ZapStock - Complete Schema
-- ========================================

-- เริ่มต้นด้วยการล้างข้อมูลเก่า (ระวัง: จะลบข้อมูลทั้งหมด)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- ========================================
-- 1. ตารางระบบ Authentication และ User Management
-- ========================================

-- ตารางผู้ใช้หลัก
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'employee'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางข้อมูลโปรไฟล์ผู้ใช้
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_profile
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ตารางจัดการ Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ตารางบันทึกกิจกรรม
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    table_name VARCHAR(100),
    record_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- ========================================
-- 2. ตารางระบบจัดการสินค้าทั่วไป
-- ========================================

-- ตารางหมวดหมู่สินค้า
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID, -- สำหรับหมวดหมู่ย่อย
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);

-- ตารางผู้จำหน่าย/ซัพพลายเออร์
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30, -- วันเครดิต
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางสินค้าทั่วไป
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (min_stock_quantity >= 0),
    max_stock_quantity INTEGER,
    price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    weight DECIMAL(10,3), -- น้ำหนัก (กิโลกรัม)
    dimensions VARCHAR(100), -- ขนาด (กว้าง x ยาว x สูง)
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    category_id UUID,
    supplier_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_product_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_product_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- ตารางธุรกรรมการเคลื่อนไหวสต็อก
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'transfer', 'return')),
    quantity INTEGER NOT NULL CHECK (quantity != 0),
    unit_price DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    reference_number VARCHAR(100), -- เลขที่อ้างอิง (ใบกำกับ, ใบเสร็จ)
    notes TEXT,
    location_from VARCHAR(100), -- จากที่ไหน
    location_to VARCHAR(100), -- ไปที่ไหน
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transaction_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_transaction_approver
        FOREIGN KEY (approved_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- ========================================
-- 3. ตารางระบบจัดการสินค้าของสด (Fresh Food)
-- ========================================

-- ตารางหมวดหมู่สินค้าของสด
CREATE TABLE IF NOT EXISTS fresh_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    shelf_life_days INTEGER DEFAULT 7, -- วันหมดอายุเฉลี่ย
    storage_condition VARCHAR(50), -- เงื่อนไขการเก็บรักษา
    temperature_range VARCHAR(50), -- ช่วงอุณหภูมิที่เหมาะสม
    humidity_range VARCHAR(50), -- ช่วงความชื้นที่เหมาะสม
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางสินค้าของสด
CREATE TABLE IF NOT EXISTS fresh_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(50),
    current_stock DECIMAL(10,3) DEFAULT 0, -- รองรับน้ำหนัก
    unit VARCHAR(20) DEFAULT 'kg', -- หน่วย (kg, g, pcs, pack)
    min_stock_quantity DECIMAL(10,3) DEFAULT 0,
    price_per_unit DECIMAL(10,2),
    cost_price_per_unit DECIMAL(10,2),
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'expired')),
    category_id UUID REFERENCES fresh_categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    storage_location VARCHAR(100), -- ตำแหน่งเก็บ
    temperature_zone VARCHAR(50), -- โซนอุณหภูมิ
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางล็อตสินค้า (สำหรับติดตามวันหมดอายุ)
CREATE TABLE IF NOT EXISTS product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) UNIQUE NOT NULL,
    production_date DATE,
    expiry_date DATE NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    remaining_quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2),
    supplier_name VARCHAR(200),
    batch_number VARCHAR(100),
    quality_status VARCHAR(20) DEFAULT 'good' CHECK (quality_status IN ('good', 'damaged', 'expired', 'recalled')),
    storage_condition VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการเคลื่อนไหวสต็อกของสด
CREATE TABLE IF NOT EXISTS fresh_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES product_lots(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'waste', 'damage', 'return')),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    reference_number VARCHAR(50),
    reason VARCHAR(200),
    temperature_at_transaction DECIMAL(5,2), -- อุณหภูมิตอนทำรายการ
    notes TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการตรวจสอบคุณภาพ
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES product_lots(id) ON DELETE CASCADE,
    check_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_type VARCHAR(50), -- ประเภทการตรวจสอบ
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    status VARCHAR(20) DEFAULT 'passed' CHECK (status IN ('passed', 'failed', 'warning')),
    issues TEXT,
    corrective_action TEXT,
    checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการแจ้งเตือนวันหมดอายุ
CREATE TABLE IF NOT EXISTS expiry_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES product_lots(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('expiring_soon', 'expired', 'low_stock')),
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    days_until_expiry INTEGER,
    current_quantity DECIMAL(10,3),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    action_taken TEXT,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการจัดการของเสีย/เสียหาย
CREATE TABLE IF NOT EXISTS waste_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES product_lots(id) ON DELETE CASCADE,
    waste_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    waste_type VARCHAR(50) NOT NULL CHECK (waste_type IN ('expired', 'damaged', 'spoiled', 'recalled')),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2),
    total_loss DECIMAL(10,2),
    reason TEXT,
    disposal_method VARCHAR(100),
    disposal_cost DECIMAL(10,2),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการตรวจสอบอุณหภูมิ
CREATE TABLE IF NOT EXISTS temperature_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2),
    log_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. ตารางเพิ่มเติมสำหรับระบบที่สมบูรณ์
-- ========================================

-- ตารางการตั้งค่าระบบ
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการแจ้งเตือน
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการพิมพ์รายงาน
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'inventory', 'sales', 'expiry', 'waste'
    parameters JSONB,
    file_path TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 5. สร้าง Indexes เพื่อเพิ่มประสิทธิภาพ
-- ========================================

-- User และ Authentication Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Products และ Categories Indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);

-- Fresh Food Indexes
CREATE INDEX IF NOT EXISTS idx_fresh_products_category ON fresh_products(category_id);
CREATE INDEX IF NOT EXISTS idx_fresh_products_sku ON fresh_products(sku);
CREATE INDEX IF NOT EXISTS idx_fresh_products_status ON fresh_products(status);
CREATE INDEX IF NOT EXISTS idx_product_lots_product ON product_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_expiry ON product_lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_product_lots_lot_number ON product_lots(lot_number);
CREATE INDEX IF NOT EXISTS idx_fresh_stock_transactions_product ON fresh_stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_fresh_stock_transactions_date ON fresh_stock_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_quality_checks_product ON quality_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_date ON quality_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_product ON expiry_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_status ON expiry_alerts(status);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_location ON temperature_logs(location);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_date ON temperature_logs(log_date);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ========================================
-- 6. สร้าง Functions และ Triggers
-- ========================================

-- Function สำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- เพิ่ม Triggers สำหรับ updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fresh_categories_updated_at BEFORE UPDATE ON fresh_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fresh_products_updated_at BEFORE UPDATE ON fresh_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_lots_updated_at BEFORE UPDATE ON product_lots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function สำหรับสร้างเลขล็อต
CREATE OR REPLACE FUNCTION generate_lot_number(product_sku TEXT, production_date DATE)
RETURNS TEXT AS $$
DECLARE
    lot_num TEXT;
    sequence_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(lot_number FROM LENGTH(product_sku) + 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM product_lots pl
    JOIN fresh_products fp ON pl.product_id = fp.id
    WHERE fp.sku = product_sku 
    AND pl.production_date = production_date;
    
    lot_num := product_sku || TO_CHAR(production_date, 'YYYYMMDD') || LPAD(sequence_num::TEXT, 3, '0');
    RETURN lot_num;
END;
$$ LANGUAGE plpgsql;

-- Function สำหรับตรวจสอบวันหมดอายุ
CREATE OR REPLACE FUNCTION check_expiry_dates()
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    lot_number TEXT,
    expiry_date DATE,
    days_until_expiry INTEGER,
    remaining_quantity DECIMAL(10,3)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pl.product_id,
        fp.name,
        pl.lot_number,
        pl.expiry_date,
        pl.expiry_date - CURRENT_DATE as days_until_expiry,
        pl.remaining_quantity
    FROM product_lots pl
    JOIN fresh_products fp ON pl.product_id = fp.id
    WHERE pl.expiry_date >= CURRENT_DATE 
    AND pl.remaining_quantity > 0
    AND pl.quality_status = 'good'
    ORDER BY pl.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. สร้าง Views สำหรับการดูข้อมูล
-- ========================================

-- View สำหรับดูสถิติสินค้าทั่วไป
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.current_stock,
    p.min_stock_quantity,
    p.max_stock_quantity,
    p.price,
    c.name as category_name,
    s.name as supplier_name,
    CASE 
        WHEN p.current_stock = 0 THEN 'out_of_stock'
        WHEN p.current_stock <= p.min_stock_quantity THEN 'low_stock'
        WHEN p.max_stock_quantity IS NOT NULL AND p.current_stock >= p.max_stock_quantity THEN 'overstock'
        ELSE 'in_stock'
    END as stock_status,
    COALESCE(SUM(CASE WHEN t.type = 'out' THEN t.quantity ELSE 0 END), 0) as total_sold,
    COALESCE(SUM(CASE WHEN t.type = 'in' THEN t.quantity ELSE 0 END), 0) as total_received,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN transactions t ON p.id = t.product_id
GROUP BY p.id, p.name, p.sku, p.current_stock, p.min_stock_quantity, p.max_stock_quantity, p.price, c.name, s.name, p.created_at;

-- View สำหรับดูสถิติสินค้าของสด
CREATE OR REPLACE VIEW fresh_product_stats AS
SELECT 
    fp.id,
    fp.name,
    fp.sku,
    fp.current_stock,
    fp.unit,
    fp.min_stock_quantity,
    fp.price_per_unit,
    fc.name as category_name,
    fc.storage_condition,
    CASE 
        WHEN fp.current_stock = 0 THEN 'out_of_stock'
        WHEN fp.current_stock <= fp.min_stock_quantity THEN 'low_stock'
        ELSE 'in_stock'
    END as stock_status,
    COUNT(pl.id) as total_lots,
    MIN(pl.expiry_date) as earliest_expiry,
    MAX(pl.expiry_date) as latest_expiry,
    COALESCE(SUM(CASE WHEN fst.type = 'out' THEN fst.quantity ELSE 0 END), 0) as total_sold,
    COALESCE(SUM(CASE WHEN fst.type = 'in' THEN fst.quantity ELSE 0 END), 0) as total_received,
    COALESCE(SUM(CASE WHEN fst.type = 'waste' THEN fst.quantity ELSE 0 END), 0) as total_waste,
    fp.created_at
FROM fresh_products fp
LEFT JOIN fresh_categories fc ON fp.category_id = fc.id
LEFT JOIN product_lots pl ON fp.id = pl.product_id
LEFT JOIN fresh_stock_transactions fst ON fp.id = fst.product_id
GROUP BY fp.id, fp.name, fp.sku, fp.current_stock, fp.unit, fp.min_stock_quantity, fp.price_per_unit, fc.name, fc.storage_condition, fp.created_at;

-- View สำหรับดูสินค้าที่ใกล้หมดอายุ
CREATE OR REPLACE VIEW expiring_products AS
SELECT 
    fp.id,
    fp.name,
    fp.sku,
    pl.lot_number,
    pl.expiry_date,
    pl.remaining_quantity,
    fp.unit,
    pl.expiry_date - CURRENT_DATE as days_until_expiry,
    CASE 
        WHEN pl.expiry_date - CURRENT_DATE <= 0 THEN 'expired'
        WHEN pl.expiry_date - CURRENT_DATE <= 1 THEN 'expiring_today'
        WHEN pl.expiry_date - CURRENT_DATE <= 3 THEN 'expiring_soon'
        ELSE 'normal'
    END as expiry_status
FROM fresh_products fp
JOIN product_lots pl ON fp.id = pl.product_id
WHERE pl.remaining_quantity > 0 
AND pl.quality_status = 'good'
AND pl.expiry_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY pl.expiry_date ASC;
`;

async function createCompleteSchema() {
  try {
    console.log('Creating complete database schema...');
    await db.query(createCompleteSchemaSQL);
    console.log('Complete database schema created successfully!');
    
    // เพิ่มข้อมูลเริ่มต้น
    console.log('Adding initial data...');
    
    // เพิ่มผู้ใช้ Admin เริ่มต้น (รหัสผ่าน: admin123)
    await db.query(`
      INSERT INTO users (username, password_hash, role) VALUES 
      ('admin', '$2b$10$Z5G8F1KJ4R8WnX2HA8JFV.N8ZY3QD6LP7YQG8M1HXER4A6ZS5QJJW', 'admin')
      ON CONFLICT (username) DO NOTHING
    `);

    // เพิ่มโปรไฟล์สำหรับ Admin
    await db.query(`
      INSERT INTO user_profiles (user_id, full_name, email) 
      SELECT u.id, 'ผู้ดูแลระบบ', 'admin@company.com'
      FROM users u WHERE u.username = 'admin'
      ON CONFLICT (email) DO NOTHING
    `);

    // เพิ่มหมวดหมู่เริ่มต้น
    await db.query(`
      INSERT INTO categories (name, description) VALUES 
      ('อุปกรณ์อิเล็กทรอนิกส์', 'สินค้าอิเล็กทรอนิกส์ต่างๆ'),
      ('เครื่องเขียน', 'อุปกรณ์เครื่องเขียนและอุปกรณ์สำนักงาน'),
      ('เสื้อผ้า', 'เสื้อผ้าแฟชั่นสำหรับทุกเพศทุกวัย'),
      ('อาหาร', 'อาหารและเครื่องดื่ม'),
      ('เครื่องใช้ไฟฟ้า', 'เครื่องใช้ไฟฟ้าในบ้าน'),
      ('ของเล่น', 'ของเล่นสำหรับเด็ก'),
      ('เครื่องดื่ม', 'เครื่องดื่มทุกประเภท'),
      ('ยาและเวชภัณฑ์', 'ยาและเวชภัณฑ์'),
      ('เครื่องสำอาง', 'เครื่องสำอางและของใช้ความงาม'),
      ('กีฬา', 'อุปกรณ์กีฬา'),
      ('หนังสือ', 'หนังสือและสื่อการเรียนรู้')
      ON CONFLICT (name) DO NOTHING
    `);

    // เพิ่มหมวดหมู่สินค้าของสด
    await db.query(`
      INSERT INTO fresh_categories (name, description, shelf_life_days, storage_condition) VALUES 
      ('ผักสด', 'ผักสดและผักใบเขียว', 7, 'แช่เย็น'),
      ('ผลไม้', 'ผลไม้สดและผลไม้แช่เย็น', 14, 'แช่เย็น'),
      ('เนื้อสัตว์', 'เนื้อสัตว์สดและแช่เย็น', 5, 'แช่เย็น'),
      ('ปลาและอาหารทะเล', 'ปลาสดและอาหารทะเล', 3, 'แช่เย็น'),
      ('นมและผลิตภัณฑ์นม', 'นม โยเกิร์ต ชีส', 7, 'แช่เย็น'),
      ('ไข่', 'ไข่ไก่และไข่เป็ด', 21, 'อุณหภูมิห้อง'),
      ('ขนมปังและเบเกอรี่', 'ขนมปัง เค้ก พาย', 7, 'อุณหภูมิห้อง'),
      ('อาหารแช่แข็ง', 'อาหารแช่แข็งสำเร็จรูป', 90, 'แช่แข็ง'),
      ('เครื่องปรุงและเครื่องเทศ', 'เครื่องปรุงรส เครื่องเทศ', 365, 'อุณหภูมิห้อง'),
      ('อาหารแห้ง', 'ข้าว ถั่ว อาหารแห้ง', 180, 'อุณหภูมิห้อง'),
      ('อาหารกระป๋อง', 'อาหารกระป๋องและบรรจุภัณฑ์', 730, 'อุณหภูมิห้อง')
      ON CONFLICT (name) DO NOTHING
    `);

    // เพิ่มการตั้งค่าระบบเริ่มต้น
    await db.query(`
      INSERT INTO system_settings (key, value, description, category) VALUES 
      ('low_stock_alert_days', '3', 'จำนวนวันที่แจ้งเตือนสินค้าต่ำ', 'alerts'),
      ('expiry_alert_days', '7', 'จำนวนวันก่อนหมดอายุที่แจ้งเตือน', 'alerts'),
      ('company_name', 'บริษัท จัดการสต็อกสินค้า จำกัด', 'ชื่อบริษัท', 'general'),
      ('company_address', '123 ถนนสุขุมวิท กรุงเทพฯ 10110', 'ที่อยู่บริษัท', 'general'),
      ('currency', 'THB', 'สกุลเงินที่ใช้', 'general'),
      ('timezone', 'Asia/Bangkok', 'เขตเวลา', 'general')
      ON CONFLICT (key) DO NOTHING
    `);

    console.log('Initial data added successfully!');
    console.log('✅ Complete database schema created successfully!');
    console.log('📊 All tables, indexes, functions, and views created');
    console.log('👤 Admin user: admin (password: admin123)');
    console.log('🌐 Ready for React Native app and PHP website');
    
  } catch (error) {
    console.error('Error creating complete schema:', error.message);
    process.exit(1);
  } finally {
    console.log('Finished complete schema creation script.');
    process.exit(0);
  }
}

createCompleteSchema();





