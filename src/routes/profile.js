// backend/src/routes/profile.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const { validate: isUuid } = require('uuid');

/**
 * @route GET /api/profile/stats
 * @description ดึงข้อมูลสถิติของโปรไฟล์ผู้ใช้
 * @access Authenticated
 */
router.get('/stats', async (req, res, next) => {
  try {
    const totalProductsResult = await db.query(`SELECT COUNT(*) FROM products`);
    const totalProducts = parseInt(totalProductsResult.rows[0].count, 10);

    const lowStockResult = await db.query(`
      SELECT COUNT(*)
      FROM products
      WHERE current_stock <= min_stock_quantity
    `);
    const lowStock = parseInt(lowStockResult.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        totalProducts: totalProducts,
        lowStock: lowStock
      }
    });
  } catch (err) {
    console.error('Error fetching profile stats:', err.message);
    next(err);
  }
});

/**
 * @route GET /api/profile/:userId
 * @description ดึงข้อมูลโปรไฟล์ผู้ใช้จาก 2 ตาราง: users และ user_profiles
 * @access Authenticated
 */
router.get('/:userId', async (req, res, next) => {
  const { userId } = req.params;

  if (!userId || !isUuid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid User ID' });
  }

  try {
    const result = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.role,
        u.is_active,
        u.created_at,
        up.full_name,
        up.email,
        up.phone,
        up.address,
        up.image_url,
        up.created_at as profile_created_at,
        up.updated_at as profile_updated_at
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    console.error('Error fetching profile:', err.message);
    next(err);
  }
});

/**
 * @route PUT /api/profile/:userId
 * @description อัปเดตข้อมูลโปรไฟล์ผู้ใช้ใน 2 ตาราง: users และ user_profiles
 * @access Authenticated
 */
router.put('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  const { fullname, email, username, role, phone, address, imageUrl } = req.body;

  // แก้ไขตรงนี้: จาก isUUID เป็น isUuid
  if (!userId || !isUuid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
  }

  // เพิ่ม console.log เพื่อตรวจสอบข้อมูล
  console.log(' PUT /api/profile/:userId - ข้อมูลที่ได้รับ:');
  console.log('  userId:', userId);
  console.log('  fullname:', fullname);
  console.log('  email:', email);
  console.log('  username:', username);
  console.log('  role:', role);
  console.log('  phone:', phone);
  console.log('  address:', address);
  console.log('  imageUrl:', imageUrl);
  console.log('  req.body:', req.body);

  try {
    // อัปเดตข้อมูลในตาราง users
    const userUpdates = [];
    const userValues = [];
    let userParamIndex = 1;

    if (username) {
      userUpdates.push(`username = $${userParamIndex++}`);
      userValues.push(username);
    }
    if (role) {
      userUpdates.push(`role = $${userParamIndex++}`);
      userValues.push(role);
    }

    if (userUpdates.length > 0) {
      const userQueryText = `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${userParamIndex} RETURNING *`;
      await db.query(userQueryText, [...userValues, userId]);
    }

    // อัปเดตข้อมูลในตาราง user_profiles
    const profileUpdates = [];
    const profileValues = [];
    let profileParamIndex = 1;

    console.log('  ตรวจสอบข้อมูลที่จะอัปเดต:');
    console.log('  fullname:', fullname, 'type:', typeof fullname);
    console.log('  email:', email, 'type:', typeof email);
    console.log('  phone:', phone, 'type:', typeof phone);
    console.log('  address:', address, 'type:', typeof address);
    console.log('  imageUrl:', imageUrl, 'type:', typeof imageUrl);

    if (fullname) {
      profileUpdates.push(`full_name = $${profileParamIndex++}`);
      profileValues.push(fullname);
      console.log('  ✅ เพิ่ม full_name ในอัปเดต');
    }
    if (email) {
      profileUpdates.push(`email = $${profileParamIndex++}`);
      profileValues.push(email);
      console.log('  ✅ เพิ่ม email ในอัปเดต');
    }
    if (phone !== undefined) {
      profileUpdates.push(`phone = $${profileParamIndex++}`);
      profileValues.push(phone);
      console.log('  ✅ เพิ่ม phone ในอัปเดต:', phone);
    }
    if (address !== undefined) {
      profileUpdates.push(`address = $${profileParamIndex++}`);
      profileValues.push(address);
      console.log('  ✅ เพิ่ม address ในอัปเดต:', address);
    }
    if (imageUrl !== undefined) {
      profileUpdates.push(`image_url = $${profileParamIndex++}`);
      profileValues.push(imageUrl);
      console.log('  ✅ เพิ่ม image_url ในอัปเดต:', imageUrl);
    }

    if (profileUpdates.length > 0) {
      const profileQueryText = `UPDATE user_profiles SET ${profileUpdates.join(', ')} WHERE user_id = $${profileParamIndex} RETURNING *`;
      
      console.log('  SQL Query:', profileQueryText);
      console.log('  Values:', [...profileValues, userId]);
      console.log('  จำนวน fields ที่จะอัปเดต:', profileUpdates.length);
      
      const profileResult = await db.query(profileQueryText, [...profileValues, userId]);
      
      if (profileResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: userId,
          username,
          role,
          fullname: profileResult.rows[0].full_name,
          email: profileResult.rows[0].email,
          phone: profileResult.rows[0].phone,
          address: profileResult.rows[0].address,
          imageUrl: profileResult.rows[0].image_url,
        },
      });
    } else {
        // ไม่มีข้อมูลใน user_profiles ที่ต้องอัปเดต
        res.status(200).json({ success: true, message: 'No profile data to update' });
    }

  } catch (err) {
    console.error('Error updating profile:', err.message);
    next(err);
  }
});

/**
 * @route POST /api/profile/:userId
 * @description สร้างโปรไฟล์ใหม่สำหรับผู้ใช้ที่ยังไม่มี
 * @access Authenticated
 */
router.post('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  const { fullname, email, phone, address } = req.body;

  if (!userId || !isUuid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid User ID' });
  }

  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const userExists = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ตรวจสอบว่ามีโปรไฟล์อยู่แล้วหรือไม่
    const profileExists = await db.query('SELECT id FROM user_profiles WHERE user_id = $1', [userId]);
    if (profileExists.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Profile already exists for this user' });
    }

    // สร้างโปรไฟล์ใหม่
    const result = await db.query(`
      INSERT INTO user_profiles (user_id, full_name, email, phone, address, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, fullname || null, email || null, phone || null, address || null, req.body.imageUrl || null]);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('Error creating profile:', err.message);
    next(err);
  }
});

module.exports = router;