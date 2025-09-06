    // backend/migrations/create_tables.js
    const db = require('../src/db'); // นำเข้าโมดูล db ของคุณ

    const createTablesSQL = `
    -- Create Categories table first due to foreign key dependency
    CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Products table
    CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
        min_stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (min_stock_quantity >= 0),
        category_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_category
            FOREIGN KEY (category_id)
            REFERENCES categories(id)
            ON DELETE SET NULL
    );

    -- Create Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')), -- 'in' or 'out'
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product
            FOREIGN KEY (product_id)
            REFERENCES products(id)
            ON DELETE CASCADE
    );

    -- Create Users table (for authentication)
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user', -- e.g., 'admin', 'user'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
    `;

    async function createTables() {
      try {
        console.log('Attempting to create tables...');
        await db.query(createTablesSQL);
        console.log('Tables created successfully!');
      } catch (error) {
        console.error('Error creating tables:', error.message);
        process.exit(1); // Exit with an error code
      } finally {
        console.log('Finished table creation script.');
        process.exit(0); // Exit successfully
      }
    }

    createTables();
    