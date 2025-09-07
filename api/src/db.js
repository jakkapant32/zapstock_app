const { Pool } = require('pg');
const config = require('../config');
// require('dotenv').config(); // Temporarily disabled

const pool = new Pool({
  connectionString: config.database.url,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 10, // ลดจำนวน connections
  min: 0,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200
});

pool.on('connect', () => {
  console.log('New client connected to database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('Database connected successfully');
      client.release();
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error('All database connection attempts failed');
        // Don't throw error, just log it
        return false;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error; // Re-throw error to let routes handle it
  }
};

module.exports = {
  query,
  getClient: () => pool.connect(),
  connectDB,
  pool
};
