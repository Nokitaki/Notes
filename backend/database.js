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
      const findQuery = 'SELECT * FROM users WHERE wallet_address = $1';
      const findResult = await client.query(findQuery, [walletAddress]);

      if (findResult.rows.length > 0) {
        return findResult.rows[0];
      }

      const insertQuery = `
        INSERT INTO users (username, wallet_address) 
        VALUES ($1, $1) 
        RETURNING *
      `;
      const insertResult = await client.query(insertQuery, [walletAddress]);
      return insertResult.rows[0];
    } finally {
      client.release();
    }
  },

  // Note operations
  createNote: async (userId, title, content, txHash, contentHash, status = 'Pending') => {
    // CORRECTED: Only insert into 'notes', no extra table
    const query = `
      INSERT INTO notes (user_id, title, content, tx_hash, content_hash, status, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId, title, content, txHash, contentHash, status
    ]);
    return result.rows[0];
  },

  getNotesByUserId: async (userId) => {
    // CORRECTED: Select 'status' directly from notes table. No JOIN needed.
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