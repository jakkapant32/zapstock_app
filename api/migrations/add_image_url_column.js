// backend/migrations/add_image_url_column.js
const db = require('../src/db');

const addImageUrlColumnSQL = `
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT;
`;

async function addImageUrlColumn() {
  try {
    console.log('Adding image_url column to products table...');
    await db.query(addImageUrlColumnSQL);
    console.log('image_url column added successfully!');
  } catch (error) {
    console.error('Error adding image_url column:', error.message);
    process.exit(1);
  } finally {
    console.log('Finished adding image_url column.');
    process.exit(0);
  }
}

addImageUrlColumn();



