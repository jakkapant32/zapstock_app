const { Client } = require('pg');
const config = require('../config');

let client = null;
let isConnecting = false;

const connectDB = async (retries = 3) => {
  if (isConnecting) {
    return client;
  }
  
  isConnecting = true;
  
  for (let i = 0; i < retries; i++) {
    try {
      if (client) {
        await client.end();
      }
      
      client = new Client({
        connectionString: config.database.url,
        ssl: {
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        query_timeout: 10000,
        statement_timeout: 10000
      });
      
      await client.connect();
      console.log('Database connected successfully');
      isConnecting = false;
      return client;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        isConnecting = false;
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

const query = async (text, params) => {
  try {
    if (!client) {
      await connectDB();
    }
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    // ลองเชื่อมต่อใหม่
    try {
      await connectDB();
      const result = await client.query(text, params);
      return result;
    } catch (retryError) {
      console.error('Database retry error:', retryError);
      throw retryError;
    }
  }
};

module.exports = {
  query,
  connectDB
};
