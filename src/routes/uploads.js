const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// POST /api/upload
// Body: { imageBase64: 'data:image/png;base64,...' | '...base64...' }
// Returns: { url: 'http://<host>/uploads/<filename>' }
router.post('/upload', async (req, res) => {
  try {
    const { imageBase64, dataUrl } = req.body || {};

    // Accept both dataUrl and raw base64 (imageBase64)
    if ((!imageBase64 || typeof imageBase64 !== 'string') && (!dataUrl || typeof dataUrl !== 'string')) {
      return res.status(400).json({ success: false, message: 'กรุณาส่ง imageBase64 หรือ dataUrl เป็นสตริง' });
    }

    // Support both data URL and raw base64
    let base64String = imageBase64;
    let extension = 'png';

    const input = dataUrl && dataUrl.startsWith('data:') ? dataUrl : imageBase64;
    const dataUrlMatch = input && input.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
    if (dataUrlMatch) {
      extension = dataUrlMatch[2] === 'jpeg' ? 'jpg' : dataUrlMatch[2];
      base64String = dataUrlMatch[3];
    } else {
      // raw base64 without data URL, default to png
      extension = 'png';
    }

    const buffer = Buffer.from(base64String, 'base64');

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${uuidv4()}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Build public URL
    const host = req.get('host');
    const protocol = (req.headers['x-forwarded-proto'] || req.protocol || 'http');
    const url = `${protocol}://${host}/uploads/${filename}`;

    return res.status(201).json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'อัปโหลดรูปไม่สำเร็จ' });
  }
});

module.exports = router;


