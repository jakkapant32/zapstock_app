const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl,
  max: 20, // เพิ่ม connection pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
