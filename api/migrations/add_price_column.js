// backend/migrations/add_price_column.js
const db = require('../src/db');

const addPriceColumnSQL = `
-- Add price column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00 CHECK (price >= 0);
`;

async function addPriceColumn() {
  try {
    console.log('Adding price column to products table...');
    await db.query(addPriceColumnSQL);
    console.log('Price column added successfully!');
  } catch (error) {
    console.error('Error adding price column:', error.message);
    process.exit(1);
  } finally {
    console.log('Finished adding price column.');
    process.exit(0);
  }
}

addPriceColumn(); 