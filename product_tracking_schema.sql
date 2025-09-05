-- Product Tracking System Schema
-- สร้างระบบติดตามสินค้าที่สามารถดูย้อนหลังการเข้าออกได้

-- ตารางติดตามสินค้า
CREATE TABLE IF NOT EXISTS product_tracking (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjust', 'track_start', 'track_stop'
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    tracked_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ตารางสถานะการติดตามสินค้า
CREATE TABLE IF NOT EXISTS product_tracking_status (
    id SERIAL PRIMARY KEY,
    product_id INTEGER UNIQUE NOT NULL,
    is_tracked BOOLEAN DEFAULT false,
    tracking_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tracking_notes TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- สร้าง Indexes เพื่อประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_product_tracking_product_id ON product_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tracking_created_at ON product_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_product_tracking_action_type ON product_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_product_tracking_status_product_id ON product_tracking_status(product_id);

-- ฟังก์ชันสำหรับบันทึกการติดตามสินค้า
CREATE OR REPLACE FUNCTION log_product_tracking(
    p_product_id INTEGER,
    p_action_type VARCHAR(20),
    p_quantity INTEGER,
    p_reason VARCHAR(255) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_tracked_by VARCHAR(100) DEFAULT 'system'
) RETURNS VOID AS $$
DECLARE
    v_previous_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- ดึงสต็อกปัจจุบัน
    SELECT current_stock INTO v_previous_stock FROM products WHERE id = p_product_id;
    
    -- คำนวณสต็อกใหม่
    CASE p_action_type
        WHEN 'in' THEN
            v_new_stock := v_previous_stock + p_quantity;
        WHEN 'out' THEN
            v_new_stock := v_previous_stock - p_quantity;
        WHEN 'adjust' THEN
            v_new_stock := p_quantity;
        ELSE
            v_new_stock := v_previous_stock;
    END CASE;
    
    -- บันทึกการติดตาม
    INSERT INTO product_tracking (
        product_id, action_type, quantity, previous_stock, new_stock, 
        reason, notes, tracked_by
    ) VALUES (
        p_product_id, p_action_type, p_quantity, v_previous_stock, v_new_stock,
        p_reason, p_notes, p_tracked_by
    );
    
    -- อัปเดตสต็อกในตาราง products
    UPDATE products SET current_stock = v_new_stock WHERE id = p_product_id;
    
    -- อัปเดตเวลาสุดท้ายที่ติดตาม
    UPDATE product_tracking_status 
    SET last_updated_at = CURRENT_TIMESTAMP 
    WHERE product_id = p_product_id;
    
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชันสำหรับเปิด/ปิดการติดตามสินค้า
CREATE OR REPLACE FUNCTION toggle_product_tracking(
    p_product_id INTEGER,
    p_is_tracked BOOLEAN,
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- อัปเดตหรือสร้างสถานะการติดตาม
    INSERT INTO product_tracking_status (product_id, is_tracked, tracking_notes)
    VALUES (p_product_id, p_is_tracked, p_notes)
    ON CONFLICT (product_id) 
    DO UPDATE SET 
        is_tracked = p_is_tracked,
        tracking_notes = p_notes,
        last_updated_at = CURRENT_TIMESTAMP;
    
    -- บันทึกการเปลี่ยนแปลงสถานะการติดตาม
    INSERT INTO product_tracking (
        product_id, action_type, quantity, previous_stock, new_stock,
        reason, notes, tracked_by
    ) VALUES (
        p_product_id, 
        CASE WHEN p_is_tracked THEN 'track_start' ELSE 'track_stop' END,
        0, 0, 0,
        'Tracking status changed',
        p_notes,
        'system'
    );
    
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชันสำหรับดึงประวัติการติดตามสินค้า
CREATE OR REPLACE FUNCTION get_product_tracking_history(
    p_product_id INTEGER,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    action_type VARCHAR(20),
    quantity INTEGER,
    previous_stock INTEGER,
    new_stock INTEGER,
    reason VARCHAR(255),
    notes TEXT,
    tracked_by VARCHAR(100),
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.action_type,
        pt.quantity,
        pt.previous_stock,
        pt.new_stock,
        pt.reason,
        pt.notes,
        pt.tracked_by,
        pt.created_at
    FROM product_tracking pt
    WHERE pt.product_id = p_product_id
    ORDER BY pt.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชันสำหรับดึงสถิติการติดตามสินค้า
CREATE OR REPLACE FUNCTION get_product_tracking_stats(
    p_product_id INTEGER,
    p_days_back INTEGER DEFAULT 30
) RETURNS TABLE (
    total_in INTEGER,
    total_out INTEGER,
    net_change INTEGER,
    tracking_days INTEGER,
    avg_daily_change DECIMAL(10,2)
) AS $$
DECLARE
    v_start_date TIMESTAMP;
BEGIN
    v_start_date := CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days_back;
    
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN action_type = 'in' THEN quantity ELSE 0 END), 0)::INTEGER as total_in,
        COALESCE(SUM(CASE WHEN action_type = 'out' THEN quantity ELSE 0 END), 0)::INTEGER as total_out,
        COALESCE(SUM(CASE WHEN action_type = 'in' THEN quantity ELSE -quantity END), 0)::INTEGER as net_change,
        EXTRACT(DAY FROM CURRENT_TIMESTAMP - v_start_date)::INTEGER as tracking_days,
        CASE 
            WHEN EXTRACT(DAY FROM CURRENT_TIMESTAMP - v_start_date) > 0 
            THEN COALESCE(SUM(CASE WHEN action_type = 'in' THEN quantity ELSE -quantity END), 0)::DECIMAL / EXTRACT(DAY FROM CURRENT_TIMESTAMP - v_start_date)
            ELSE 0 
        END as avg_daily_change
    FROM product_tracking pt
    WHERE pt.product_id = p_product_id 
    AND pt.created_at >= v_start_date
    AND pt.action_type IN ('in', 'out');
END;
$$ LANGUAGE plpgsql;

-- ตัวอย่างข้อมูลเริ่มต้น (ถ้ามีสินค้าอยู่แล้ว)
-- INSERT INTO product_tracking_status (product_id, is_tracked)
-- SELECT id, false FROM products;

-- สร้าง Trigger สำหรับบันทึกการเปลี่ยนแปลงสต็อกอัตโนมัติ
CREATE OR REPLACE FUNCTION trigger_product_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    -- บันทึกการเปลี่ยนแปลงสต็อก
    IF OLD.current_stock != NEW.current_stock THEN
        INSERT INTO product_tracking (
            product_id, action_type, quantity, previous_stock, new_stock,
            reason, notes, tracked_by
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.current_stock > OLD.current_stock THEN 'in'
                ELSE 'out'
            END,
            ABS(NEW.current_stock - OLD.current_stock),
            OLD.current_stock,
            NEW.current_stock,
            'Stock updated',
            'Automatic tracking from product update',
            'system'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง Trigger
DROP TRIGGER IF EXISTS product_stock_change_trigger ON products;
CREATE TRIGGER product_stock_change_trigger
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_product_stock_change();

-- ตัวอย่างการใช้งาน:
-- 1. เปิดการติดตามสินค้า
-- SELECT toggle_product_tracking(1, true, 'เริ่มติดตามสินค้านี้');

-- 2. บันทึกการเข้าสินค้า
-- SELECT log_product_tracking(1, 'in', 50, 'ซื้อจากซัพพลายเออร์', 'สินค้าใหม่');

-- 3. บันทึกการออกสินค้า
-- SELECT log_product_tracking(1, 'out', 10, 'ขายให้ลูกค้า', 'ขายปกติ');

-- 4. ดูประวัติการติดตาม
-- SELECT * FROM get_product_tracking_history(1, 20);

-- 5. ดูสถิติการติดตาม
-- SELECT * FROM get_product_tracking_stats(1, 30);

