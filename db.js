const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'eazy1_db',
  password: '123456',
  port: 5432,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Export the pool for use in routes
module.exports = pool;
