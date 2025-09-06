const { Client } = require('pg');
const config = require('../config');

let client = null;

const connectDB = async () => {
  try {
    client = new Client({
      connectionString: config.database.url,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await client.connect();
    console.log('Database connected successfully');
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
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
