// backend/database.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const dbHelpers = {
  // FIND OR CREATE USER BY WALLET ADDRESS
  findOrCreateUser: async (walletAddress) => {
    const client = await pool.connect();
    try {
      // 1. Try to find user
      const findQuery = 'SELECT * FROM users WHERE wallet_address = $1';
      const findResult = await client.query(findQuery, [walletAddress]);

      if (findResult.rows.length > 0) {
        return findResult.rows[0];
      }

      // 2. If not found, create user (Including created_at to be safe)
      console.log(`Creating new user for wallet: ${walletAddress}`);
      const insertQuery = `
        INSERT INTO users (username, wallet_address, created_at) 
        VALUES ($1, $1, CURRENT_TIMESTAMP) 
        RETURNING *
      `;
      const insertResult = await client.query(insertQuery, [walletAddress]);
      
      if (insertResult.rows.length === 0) {
        throw new Error("Failed to create user: No rows returned");
      }

      return insertResult.rows[0];
    } catch (err) {
      console.error("Database Error (findOrCreateUser):", err);
      throw err;
    } finally {
      client.release();
    }
  },

  // Note operations
  createNote: async (userId, walletAddress, title, content, txHash, contentHash, timestamp, color, status) => {
    const query = `
      INSERT INTO notes (
        user_id, 
        wallet_address, 
        title, 
        content, 
        tx_hash, 
        content_hash, 
        blockchain_timestamp, 
        color, 
        status, 
        created_at, 
        updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId, 
      walletAddress, 
      title, 
      content, 
      txHash, 
      contentHash, 
      timestamp, 
      color, 
      status
    ]);
    return result.rows[0];
  },

  getNotesByUserId: async (userId) => {
    const query = `
      SELECT * FROM notes 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  getNoteById: async (id, userId) => {
    const query = `SELECT * FROM notes WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  },

  deleteNote: async (id, userId) => {
    const query = 'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }
};

module.exports = { pool, dbHelpers };