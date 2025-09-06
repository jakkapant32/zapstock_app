-- Authentication System Database Schema
-- สร้างตารางสำหรับระบบยืนยันตัวตน

-- ตารางผู้ใช้
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางโปรไฟล์ผู้ใช้
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    table_name VARCHAR(50),
    record_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางหมวดหมู่สินค้าทั่วไป
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางสินค้าทั่วไป
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    category_id UUID REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL,
    current_stock DECIMAL(10,3) DEFAULT 0,
    min_stock_quantity DECIMAL(10,3) DEFAULT 0,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางธุรกรรม
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Indexes สำหรับประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);

-- สร้างฟังก์ชันสำหรับอัพเดท updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง triggers สำหรับอัพเดท updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่มข้อมูลตัวอย่างสำหรับหมวดหมู่สินค้าทั่วไป
INSERT INTO categories (name, description) VALUES
('อิเล็กทรอนิกส์', 'อุปกรณ์อิเล็กทรอนิกส์ต่างๆ'),
('เสื้อผ้า', 'เสื้อผ้าและเครื่องแต่งกาย'),
('อาหารแห้ง', 'อาหารแห้งและของแห้ง'),
('เครื่องใช้ในบ้าน', 'เครื่องใช้ไฟฟ้าและเครื่องใช้ในบ้าน'),
('หนังสือ', 'หนังสือและสื่อการเรียนรู้'),
('กีฬา', 'อุปกรณ์กีฬาและออกกำลังกาย'),
('ความงาม', 'เครื่องสำอางและผลิตภัณฑ์ความงาม'),
('ของเล่น', 'ของเล่นและเกมส์'),
('เครื่องเขียน', 'เครื่องเขียนและอุปกรณ์สำนักงาน'),
('อื่นๆ', 'หมวดหมู่อื่นๆ')
ON CONFLICT (name) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่างสำหรับผู้ใช้ทดสอบ
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2a$10$rQZ9K8mN2pL1vX3yU7iJ6hG4fD5sA8qW2eR9tY6uI1oP3lK7jH4gF8dS5aQ', 'admin'),
('user1', '$2a$10$rQZ9K8mN2pL1vX3yU7iJ6hG4fD5sA8qW2eR9tY6uI1oP3lK7jH4gF8dS5aQ', 'user'),
('user2', '$2a$10$rQZ9K8mN2pL1vX3yU7iJ6hG4fD5sA8qW2eR9tY6uI1oP3lK7jH4gF8dS5aQ', 'user')
ON CONFLICT (username) DO NOTHING;

-- เพิ่มข้อมูลโปรไฟล์ผู้ใช้ทดสอบ
INSERT INTO user_profiles (user_id, full_name, email) VALUES
((SELECT id FROM users WHERE username = 'admin'), 'ผู้ดูแลระบบ', 'admin@example.com'),
((SELECT id FROM users WHERE username = 'user1'), 'ผู้ใช้ทดสอบ 1', 'user1@example.com'),
((SELECT id FROM users WHERE username = 'user2'), 'ผู้ใช้ทดสอบ 2', 'user2@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- เพิ่มข้อมูลสินค้าตัวอย่าง
INSERT INTO products (name, description, sku, category_id, price, current_stock, min_stock_quantity, created_by) VALUES
('โทรศัพท์มือถือ', 'โทรศัพท์มือถือสมาร์ทโฟน', 'PHONE001', (SELECT id FROM categories WHERE name = 'อิเล็กทรอนิกส์'), 15000.00, 10, 5, (SELECT id FROM users WHERE username = 'admin')),
('เสื้อเชิ้ต', 'เสื้อเชิ้ตผ้าฝ้าย', 'SHIRT001', (SELECT id FROM categories WHERE name = 'เสื้อผ้า'), 500.00, 50, 20, (SELECT id FROM users WHERE username = 'admin')),
('ข้าวสาร', 'ข้าวสารหอมมะลิ', 'RICE001', (SELECT id FROM categories WHERE name = 'อาหารแห้ง'), 45.00, 100, 30, (SELECT id FROM users WHERE username = 'admin')),
('พัดลม', 'พัดลมตั้งพื้น', 'FAN001', (SELECT id FROM categories WHERE name = 'เครื่องใช้ในบ้าน'), 1200.00, 15, 8, (SELECT id FROM users WHERE username = 'admin'))
ON CONFLICT (sku) DO NOTHING;

-- เพิ่มข้อมูล suppliers ตัวอย่าง
INSERT INTO suppliers (name, contact_person, email, phone) VALUES
('บริษัทอิเล็กทรอนิกส์ จำกัด', 'คุณสมชาย', 'contact@electronics.co.th', '02-123-4567'),
('โรงงานเสื้อผ้าไทย', 'คุณสมหญิง', 'info@thai-clothing.com', '02-234-5678'),
('ฟาร์มข้าวไทย', 'คุณสมศักดิ์', 'rice@thai-farm.com', '02-345-6789'),
('โรงงานเครื่องใช้ไฟฟ้า', 'คุณสมศรี', 'appliance@factory.com', '02-456-7890')
ON CONFLICT DO NOTHING;
