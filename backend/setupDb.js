// backend/setupDb.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTablesQuery = `
  -- 1. Create Users Table
  CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255),
      wallet_address VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. Create Notes Table
  CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      wallet_address VARCHAR(255),
      title TEXT NOT NULL,
      content TEXT,
      tx_hash VARCHAR(255),
      content_hash VARCHAR(255),
      blockchain_timestamp BIGINT,
      color VARCHAR(50) DEFAULT '#ffffff',
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function setup() {
  try {
    await client.connect();
    console.log(`🔌 Connected to database: ${process.env.DB_DATABASE}`);
    
    await client.query(createTablesQuery);
    console.log("✅ Tables 'users' and 'notes' created successfully!");
    
  } catch (err) {
    console.error("❌ Error setting up database:", err.message);
  } finally {
    await client.end();
  }
}

setup();