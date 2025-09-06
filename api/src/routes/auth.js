const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const db = require('../db');

// สมัครสมาชิก
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      });
    }

    // ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'
      });
    }

    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // เพิ่มผู้ใช้ใหม่
    const newUser = await db.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
      [username, passwordHash, 'user']
    );

    // เพิ่มข้อมูลโปรไฟล์
    await db.query(
      'INSERT INTO user_profiles (user_id, full_name, email) VALUES ($1, $2, $3)',
      [newUser.rows[0].id, fullName, email]
    );

    // บันทึก activity log
    await db.query(
      'INSERT INTO activity_logs (user_id, action, description, table_name) VALUES ($1, $2, $3, $4)',
      [newUser.rows[0].id, 'สมัครสมาชิก', `สมัครสมาชิกใหม่: ${fullName}`, 'users']
    );

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        role: newUser.rows[0].role,
        fullName: fullName,
        email: email,
        phone: null,
        address: null,
        imageUrl: null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
    });
  }
});

// เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
      });
    }

    // ค้นหาผู้ใช้
    const user = await db.query(
      'SELECT u.id, u.username, u.password_hash, u.role, up.full_name, up.email, up.phone, up.address, up.image_url FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ตรวจสอบรหัสผ่าน
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // สร้าง session token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // หมดอายุใน 24 ชั่วโมง

    // บันทึก session
    await db.query(
      'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.rows[0].id, token, expiresAt]
    );

    // บันทึก activity log
    await db.query(
      'INSERT INTO activity_logs (user_id, action, description, table_name) VALUES ($1, $2, $3, $4)',
      [user.rows[0].id, 'เข้าสู่ระบบ', 'เข้าสู่ระบบสำเร็จ', 'users']
    );

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token: token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        role: user.rows[0].role,
        fullName: user.rows[0].full_name,
        email: user.rows[0].email,
        phone: user.rows[0].phone,
        address: user.rows[0].address,
        imageUrl: user.rows[0].image_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
});

// ออกจากระบบ
router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token ไม่ถูกต้อง'
      });
    }

    // ปิดใช้งาน session
    await db.query(
      'UPDATE sessions SET is_active = false WHERE token_hash = $1',
      [token]
    );

    res.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการออกจากระบบ'
    });
  }
});

// ตรวจสอบ token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง'
      });
    }

    // ตรวจสอบ session
    const session = await db.query(
      'SELECT s.user_id, s.expires_at, u.username, u.role, up.full_name, up.email, up.phone, up.address, up.image_url FROM sessions s JOIN users u ON s.user_id = u.id LEFT JOIN user_profiles up ON u.id = up.user_id WHERE s.token_hash = $1 AND s.is_active = true AND s.expires_at > NOW()',
      [token]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token หมดอายุหรือไม่ถูกต้อง'
      });
    }

    res.json({
      success: true,
      user: {
        id: session.rows[0].user_id,
        username: session.rows[0].username,
        role: session.rows[0].role,
        fullName: session.rows[0].full_name,
        email: session.rows[0].email,
        phone: session.rows[0].phone,
        address: session.rows[0].address,
        imageUrl: session.rows[0].image_url
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบ token'
    });
  }
});

// GET /api/auth/profile/stats - สถิติโปรไฟล์ผู้ใช้
router.get('/profile/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง'
      });
    }

    // ตรวจสอบ session
    const session = await db.query(
      'SELECT user_id FROM sessions WHERE token_hash = $1 AND is_active = true AND expires_at > NOW()',
      [token]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token หมดอายุหรือไม่ถูกต้อง'
      });
    }

    const userId = session.rows[0].user_id;

    // นับจำนวนกิจกรรมของผู้ใช้
    const activityCount = await db.query(
      'SELECT COUNT(*) as count FROM activity_logs WHERE user_id = $1',
      [userId]
    );

    // นับจำนวนรายการที่ผู้ใช้สร้าง
    const createdProducts = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE created_by = $1',
      [userId]
    );

    // นับจำนวนธุรกรรมที่ผู้ใช้ทำ
    const userTransactions = await db.query(
      'SELECT COUNT(*) as count FROM transactions WHERE created_by = $1',
      [userId]
    );

    // สถิติการใช้งานล่าสุด
    const lastActivity = await db.query(
      'SELECT action, description, created_at FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    const profileStats = {
      success: true,
      stats: {
        totalActivities: parseInt(activityCount.rows[0].count),
        totalProductsCreated: parseInt(createdProducts.rows[0].count),
        totalTransactions: parseInt(userTransactions.rows[0].count),
        lastActivities: lastActivity.rows.map(activity => ({
          action: activity.action,
          description: activity.description,
          timestamp: activity.created_at
        }))
      }
    };

    res.json(profileStats);

  } catch (error) {
    console.error('Profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติโปรไฟล์'
    });
  }
});

// GET /api/auth/profile/:userId - ข้อมูลผู้ใช้
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง'
      });
    }

    // ตรวจสอบ session
    const session = await db.query(
      'SELECT user_id FROM sessions WHERE token_hash = $1 AND is_active = true AND expires_at > NOW()',
      [token]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token หมดอายุหรือไม่ถูกต้อง'
      });
    }

    // ดึงข้อมูลผู้ใช้
    const userProfile = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.role,
        u.created_at,
        up.full_name,
        up.email,
        up.phone,
        up.address
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);

    if (userProfile.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }

    // ดึงสถิติการใช้งาน
    const userStats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE created_by = $1) as products_created,
        (SELECT COUNT(*) FROM transactions WHERE created_by = $1) as transactions_made,
        (SELECT COUNT(*) FROM activity_logs WHERE user_id = $1) as total_activities
    `, [userId]);

    const profile = {
      success: true,
      user: {
        id: userProfile.rows[0].id,
        username: userProfile.rows[0].username,
        role: userProfile.rows[0].role,
        fullName: userProfile.rows[0].full_name,
        email: userProfile.rows[0].email,
        phone: userProfile.rows[0].phone,
        address: userProfile.rows[0].address,
        createdAt: userProfile.rows[0].created_at,
        stats: {
          productsCreated: parseInt(userStats.rows[0].products_created),
          transactionsMade: parseInt(userStats.rows[0].transactions_made),
          totalActivities: parseInt(userStats.rows[0].total_activities)
        }
      }
    };

    res.json(profile);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์'
    });
  }
});

module.exports = router; 