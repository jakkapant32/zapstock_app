-- Fresh Food Management Database Schema
-- สร้างตารางสำหรับระบบจัดการสินค้าของสด

-- ตารางหมวดหมู่สินค้า
CREATE TABLE IF NOT EXISTS fresh_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    shelf_life_days INTEGER,
    storage_condition VARCHAR(200),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางสินค้า
CREATE TABLE IF NOT EXISTS fresh_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    category_id UUID REFERENCES fresh_categories(id),
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    current_stock DECIMAL(10,3) DEFAULT 0,
    min_stock_quantity DECIMAL(10,3) DEFAULT 0,
    storage_location VARCHAR(100),
    temperature_zone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางล็อตสินค้า (ติดตามวันหมดอายุ)
CREATE TABLE IF NOT EXISTS product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id) ON DELETE CASCADE,
    lot_number VARCHAR(100),
    quantity DECIMAL(10,3) NOT NULL,
    production_date DATE,
    expiry_date DATE NOT NULL,
    supplier VARCHAR(200),
    quality_grade VARCHAR(20) DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการเคลื่อนไหวสต็อก
CREATE TABLE IF NOT EXISTS fresh_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id),
    transaction_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    lot_id UUID REFERENCES product_lots(id),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการตรวจสอบคุณภาพ
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id),
    lot_id UUID REFERENCES product_lots(id),
    check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    notes TEXT,
    inspector VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการแจ้งเตือนวันหมดอายุ
CREATE TABLE IF NOT EXISTS expiry_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id),
    lot_id UUID REFERENCES product_lots(id),
    alert_type VARCHAR(20) NOT NULL, -- 'warning', 'critical', 'expired'
    alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    days_until_expiry INTEGER,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการจัดการของเสีย
CREATE TABLE IF NOT EXISTS waste_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES fresh_products(id),
    lot_id UUID REFERENCES product_lots(id),
    waste_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity DECIMAL(10,3) NOT NULL,
    reason VARCHAR(200),
    disposal_method VARCHAR(100),
    cost DECIMAL(10,2),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการตรวจสอบอุณหภูมิ
CREATE TABLE IF NOT EXISTS temperature_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_location VARCHAR(100),
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2),
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sensor_id VARCHAR(50),
    notes TEXT
);

-- สร้าง Indexes สำหรับประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_fresh_products_category ON fresh_products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_product ON product_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_expiry ON product_lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_product ON fresh_stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON fresh_stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_quality_checks_product ON quality_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_product ON expiry_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_location ON temperature_logs(storage_location);

-- เพิ่มข้อมูลตัวอย่างสำหรับหมวดหมู่
INSERT INTO fresh_categories (name, description, shelf_life_days, storage_condition) VALUES
('ผักสด', 'ผักสดต่างๆ เช่น ผักกาด ผักบุ้ง ผักคะน้า', 7, 'เก็บในตู้เย็นที่อุณหภูมิ 2-4°C'),
('ผลไม้', 'ผลไม้สดต่างๆ เช่น แอปเปิ้ล กล้วย ส้ม', 14, 'เก็บในตู้เย็นที่อุณหภูมิ 4-8°C'),
('เนื้อสัตว์', 'เนื้อสัตว์สด เช่น เนื้อหมู เนื้อไก่ เนื้อวัว', 3, 'เก็บในตู้เย็นที่อุณหภูมิ 0-2°C'),
('ปลาและอาหารทะเล', 'ปลาสด กุ้ง หอย ปลาหมึก', 2, 'เก็บในตู้เย็นที่อุณหภูมิ 0-2°C'),
('นมและผลิตภัณฑ์นม', 'นมสด โยเกิร์ต ชีส', 7, 'เก็บในตู้เย็นที่อุณหภูมิ 2-4°C'),
('ไข่', 'ไข่ไก่ ไข่เป็ด', 21, 'เก็บในตู้เย็นที่อุณหภูมิ 4-8°C'),
('ขนมปังและเบเกอรี่', 'ขนมปัง เค้ก พาย', 7, 'เก็บในที่แห้งและเย็น'),
('เครื่องดื่ม', 'น้ำผลไม้ น้ำอัดลม ชา กาแฟ', 30, 'เก็บในที่แห้งและเย็น'),
('อาหารแช่แข็ง', 'อาหารแช่แข็งต่างๆ', 180, 'เก็บในช่องแช่แข็งที่อุณหภูมิ -18°C'),
('เครื่องปรุงและเครื่องเทศ', 'เครื่องปรุง เครื่องเทศ เกลือ น้ำตาล', 365, 'เก็บในที่แห้งและเย็น'),
('อาหารแห้ง', 'ข้าว ถั่ว อาหารแห้งต่างๆ', 365, 'เก็บในที่แห้งและเย็น'),
('อาหารกระป๋อง', 'อาหารกระป๋องต่างๆ', 730, 'เก็บในที่แห้งและเย็น')
ON CONFLICT (name) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่างสำหรับสินค้า
INSERT INTO fresh_products (name, description, sku, category_id, price_per_unit, unit, current_stock, min_stock_quantity, storage_location, temperature_zone) VALUES
('แอปเปิ้ลแดง', 'แอปเปิ้ลแดงสด นำเข้าจากนิวซีแลนด์', 'APP001', (SELECT id FROM fresh_categories WHERE name = 'ผลไม้'), 45.00, 'kg', 25.5, 10.0, 'ตู้เย็น A1', '4-8°C'),
('กล้วยหอม', 'กล้วยหอมไทย หวานหอม', 'BAN001', (SELECT id FROM fresh_categories WHERE name = 'ผลไม้'), 35.00, 'kg', 18.2, 8.0, 'ตู้เย็น A2', '4-8°C'),
('ผักกาดหอม', 'ผักกาดหอมสด ปลูกในประเทศ', 'LET001', (SELECT id FROM fresh_categories WHERE name = 'ผักสด'), 25.00, 'kg', 12.8, 5.0, 'ตู้เย็น B1', '2-4°C'),
('เนื้อหมูสันนอก', 'เนื้อหมูสันนอกสด คุณภาพดี', 'PORK001', (SELECT id FROM fresh_categories WHERE name = 'เนื้อสัตว์'), 180.00, 'kg', 8.5, 3.0, 'ตู้เย็น C1', '0-2°C'),
('ปลาทูน่า', 'ปลาทูน่าสด นำเข้าจากญี่ปุ่น', 'TUNA001', (SELECT id FROM fresh_categories WHERE name = 'ปลาและอาหารทะเล'), 320.00, 'kg', 5.2, 2.0, 'ตู้เย็น C2', '0-2°C'),
('นมสด', 'นมสดคุณภาพดี ไขมัน 3.25%', 'MILK001', (SELECT id FROM fresh_categories WHERE name = 'นมและผลิตภัณฑ์นม'), 45.00, 'ลิตร', 15.5, 8.0, 'ตู้เย็น D1', '2-4°C'),
('ไข่ไก่', 'ไข่ไก่สด ขนาด L', 'EGG001', (SELECT id FROM fresh_categories WHERE name = 'ไข่'), 120.00, 'แผง', 25.0, 10.0, 'ตู้เย็น D2', '4-8°C'),
('ขนมปังขาว', 'ขนมปังขาวสด อบใหม่ทุกวัน', 'BREAD001', (SELECT id FROM fresh_categories WHERE name = 'ขนมปังและเบเกอรี่'), 35.00, 'ชิ้น', 45.0, 20.0, 'ชั้นวาง E1', 'อุณหภูมิห้อง')
ON CONFLICT (sku) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่างสำหรับล็อตสินค้า
INSERT INTO product_lots (product_id, lot_number, quantity, production_date, expiry_date, supplier, quality_grade) VALUES
((SELECT id FROM fresh_products WHERE sku = 'APP001'), 'LOT-APP-2024-001', 25.5, '2024-01-15', '2024-01-29', 'นิวซีแลนด์ฟรุทส์', 'A'),
((SELECT id FROM fresh_products WHERE sku = 'BAN001'), 'LOT-BAN-2024-001', 18.2, '2024-01-16', '2024-01-30', 'ฟาร์มกล้วยไทย', 'A'),
((SELECT id FROM fresh_products WHERE sku = 'LET001'), 'LOT-LET-2024-001', 12.8, '2024-01-17', '2024-01-24', 'ฟาร์มผักไทย', 'A'),
((SELECT id FROM fresh_products WHERE sku = 'PORK001'), 'LOT-PORK-2024-001', 8.5, '2024-01-18', '2024-01-21', 'ฟาร์มหมูไทย', 'A'),
((SELECT id FROM fresh_products WHERE sku = 'TUNA001'), 'LOT-TUNA-2024-001', 5.2, '2024-01-19', '2024-01-21', 'ฟิชเชอร์แมนญี่ปุ่น', 'A'),
((SELECT id FROM fresh_products WHERE sku = 'MILK001'), 'LOT-MILK-2024-001', 15.5, '2024-01-20', '2024-01-27', 'ฟาร์มนมไทย', 'A'),
((SELECT id FROM fresh_products WHERE sku = 'EGG001'), 'LOT-EGG-2024-001', 25.0, '2024-01-20', '2024-02-10', 'ฟาร์มไข่ไทย', 'A'),
((SELECT id FROM fresh_products WHERE sku = 'BREAD001'), 'LOT-BREAD-2024-001', 45.0, '2024-01-21', '2024-01-28', 'เบเกอรี่ไทย', 'A');

-- เพิ่มข้อมูลตัวอย่างสำหรับการเคลื่อนไหวสต็อก
INSERT INTO fresh_stock_transactions (product_id, transaction_type, quantity, unit_price, total_amount, lot_id, notes) VALUES
((SELECT id FROM fresh_products WHERE sku = 'APP001'), 'in', 25.5, 45.00, 1147.50, (SELECT id FROM product_lots WHERE lot_number = 'LOT-APP-2024-001'), 'รับเข้าสต็อก'),
((SELECT id FROM fresh_products WHERE sku = 'BAN001'), 'in', 18.2, 35.00, 637.00, (SELECT id FROM product_lots WHERE lot_number = 'LOT-BAN-2024-001'), 'รับเข้าสต็อก'),
((SELECT id FROM fresh_products WHERE sku = 'LET001'), 'in', 12.8, 25.00, 320.00, (SELECT id FROM product_lots WHERE lot_number = 'LOT-LET-2024-001'), 'รับเข้าสต็อก'),
((SELECT id FROM fresh_products WHERE sku = 'PORK001'), 'in', 8.5, 180.00, 1530.00, (SELECT id FROM product_lots WHERE lot_number = 'LOT-PORK-2024-001'), 'รับเข้าสต็อก'),
((SELECT id FROM fresh_products WHERE sku = 'TUNA001'), 'in', 5.2, 320.00, 1664.00, (SELECT id FROM product_lots WHERE lot_number = 'LOT-TUNA-2024-001'), 'รับเข้าสต็อก'),
((SELECT id FROM fresh_products WHERE sku = 'MILK001'), 'in', 15.5, 45.00, 697.50, (SELECT id FROM product_lots WHERE lot_number = 'LOT-MILK-2024-001'), 'รับเข้าสต็อก'),
((SELECT id FROM fresh_products WHERE sku = 'EGG001'), 'in', 25.0, 120.00, 3000.00, (SELECT id FROM product_lots WHERE lot_number = 'LOT-EGG-2024-001'), 'รับเข้าสต็อก'),
((SELECT id FROM fresh_products WHERE sku = 'BREAD001'), 'in', 45.0, 35.00, 1575.00, (SELECT id FROM product_lots WHERE lot_number = 'LOT-BREAD-2024-001'), 'รับเข้าสต็อก');

-- สร้างฟังก์ชันสำหรับอัพเดท updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง triggers สำหรับอัพเดท updated_at
CREATE TRIGGER update_fresh_categories_updated_at BEFORE UPDATE ON fresh_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fresh_products_updated_at BEFORE UPDATE ON fresh_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
