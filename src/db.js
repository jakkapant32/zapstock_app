const { Pool } = require('pg');
const config = require('../config');
require('dotenv').config();

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => {
    console.log('EXECUTING QUERY:', text, params || '');
    return pool.query(text, params);
  },
  getClient: () => pool.connect(),
};