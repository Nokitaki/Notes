// backend/database.js
// PostgreSQL database connection and query helpers

require('dotenv').config();
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database: notesdb');
    release();
  }
});

// Database query helpers
const dbHelpers = {
  // User operations
  createUser: async (username, hashedPassword) => {
    const query = `
      INSERT INTO users (username, password) 
      VALUES ($1, $2) 
      RETURNING id, username, created_at
    `;
    const result = await pool.query(query, [username, hashedPassword]);
    return result.rows[0];
  },

  findUserByUsername: async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  },

  findUserById: async (id) => {
    const query = 'SELECT id, username, wallet_address, ada_balance, total_notes, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  updateUserNoteCount: async (userId) => {
    const query = 'UPDATE users SET total_notes = (SELECT COUNT(*) FROM notes WHERE user_id = $1) WHERE id = $1';
    await pool.query(query, [userId]);
  },

  // Note operations
  createNote: async (userId, title, content, txHash, contentHash, blockchainTimestamp, color = '#ffffff') => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert note
      const noteQuery = `
        INSERT INTO notes (user_id, title, content, tx_hash, content_hash, blockchain_timestamp, color, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
        RETURNING *
      `;
      const noteResult = await client.query(noteQuery, [
        userId, title, content, txHash, contentHash, blockchainTimestamp, color
      ]);
      const note = noteResult.rows[0];

      // Insert blockchain transaction record
      const txQuery = `
        INSERT INTO blockchain_transactions (tx_hash, operation_type, note_id, user_id, status, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      await client.query(txQuery, [
        txHash,
        'CREATE',
        note.id,
        userId,
        'confirmed',
        JSON.stringify({ title, contentHash })
      ]);

      // Update user note count
      await client.query(
        'UPDATE users SET total_notes = total_notes + 1 WHERE id = $1',
        [userId]
      );

      await client.query('COMMIT');
      return note;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  getNotesByUserId: async (userId) => {
    const query = `
      SELECT n.*, bt.status as blockchain_status 
      FROM notes n
      LEFT JOIN blockchain_transactions bt ON n.tx_hash = bt.tx_hash
      WHERE n.user_id = $1 
      ORDER BY n.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  getNoteById: async (id, userId) => {
    const query = `
      SELECT n.*, bt.status as blockchain_status 
      FROM notes n
      LEFT JOIN blockchain_transactions bt ON n.tx_hash = bt.tx_hash
      WHERE n.id = $1 AND n.user_id = $2
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  },

  updateNote: async (id, userId, title, content, txHash, contentHash, blockchainTimestamp) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update note
      const noteQuery = `
        UPDATE notes 
        SET title = $1, content = $2, tx_hash = $3, content_hash = $4, 
            blockchain_timestamp = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND user_id = $7
        RETURNING *
      `;
      const noteResult = await client.query(noteQuery, [
        title, content, txHash, contentHash, blockchainTimestamp, id, userId
      ]);

      if (noteResult.rows.length === 0) {
        throw new Error('Note not found or unauthorized');
      }

      // Insert blockchain transaction record
      const txQuery = `
        INSERT INTO blockchain_transactions (tx_hash, operation_type, note_id, user_id, status, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      await client.query(txQuery, [
        txHash,
        'UPDATE',
        id,
        userId,
        'confirmed',
        JSON.stringify({ title, contentHash })
      ]);

      await client.query('COMMIT');
      return noteResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  deleteNote: async (id, userId, txHash) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get note info before deletion
      const noteQuery = 'SELECT * FROM notes WHERE id = $1 AND user_id = $2';
      const noteResult = await client.query(noteQuery, [id, userId]);
      
      if (noteResult.rows.length === 0) {
        throw new Error('Note not found or unauthorized');
      }

      // Insert blockchain transaction record for deletion
      const txQuery = `
        INSERT INTO blockchain_transactions (tx_hash, operation_type, note_id, user_id, status, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      await client.query(txQuery, [
        txHash,
        'DELETE',
        id,
        userId,
        'confirmed',
        JSON.stringify({ title: noteResult.rows[0].title })
      ]);

      // Delete note
      await client.query('DELETE FROM notes WHERE id = $1', [id]);

      // Update user note count
      await client.query(
        'UPDATE users SET total_notes = total_notes - 1 WHERE id = $1',
        [userId]
      );

      await client.query('COMMIT');
      return noteResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Blockchain transaction operations
  getTransactionByHash: async (txHash) => {
    const query = 'SELECT * FROM blockchain_transactions WHERE tx_hash = $1';
    const result = await pool.query(query, [txHash]);
    return result.rows[0];
  },

  getTransactionsByUserId: async (userId) => {
    const query = `
      SELECT bt.*, n.title as note_title 
      FROM blockchain_transactions bt
      LEFT JOIN notes n ON bt.note_id = n.id
      WHERE bt.user_id = $1
      ORDER BY bt.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },
};

module.exports = { pool, dbHelpers };