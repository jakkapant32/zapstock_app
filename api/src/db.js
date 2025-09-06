const { Pool } = require('pg');
const config = require('../config');
// require('dotenv').config(); // Temporarily disabled

const pool = new Pool({
  connectionString: config.database.url,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  min: 0
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

module.exports = {
  query: (text, params) => {
    console.log('EXECUTING QUERY:', text, params || '');
    return pool.query(text, params);
  },
  getClient: () => pool.connect(),
  connectDB,
  pool
};
