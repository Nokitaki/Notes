// backend/server.js
console.log("SERVER: 1. Starting initialization...");

require('dotenv').config();
const express = require('express');
const cors = require('cors');

console.log("SERVER: 2. Imports complete. Loading Database...");
const { dbHelpers, pool } = require('./database');

console.log("SERVER: 3. Loading Transaction Builder...");
// We wrap this in try-catch in case the file has an error
try {
  const transactionBuilder = require('./transactionBuilder');
  console.log("SERVER: 3b. Transaction Builder loaded.");
} catch (e) {
  console.error("SERVER: 3b. Transaction Builder FAILED:", e.message);
}

const app = express();
const PORT = 5002; // Using 5002 to avoid port 5000 conflicts

console.log("SERVER: 4. Setting up Middleware...");
const walletAuthMiddleware = async (req, res, next) => {
  const walletAddress = req.headers['x-wallet-address'];
  if (!walletAddress) return res.status(401).json({ error: 'Wallet address required' });
  try {
    const user = await dbHelpers.findOrCreateUser(walletAddress);
    if (!user) throw new Error("User retrieval failed");
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(500).json({ error: 'Auth failed' });
  }
};

app.use(cors());
app.use(express.json());

console.log("SERVER: 5. Defining Routes...");

app.get('/', (req, res) => res.send('Blockchain Notes API Running'));

app.get('/api/notes', walletAuthMiddleware, async (req, res) => {
  try {
    const notes = await dbHelpers.getNotesByUserId(req.user.id);
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create Note
app.post('/api/notes', walletAuthMiddleware, async (req, res) => {
  try {
    const { title, content, color, txHash, contentHash } = req.body;
    console.log(`Creating note: ${title}`);
    
    if (!title || !txHash) {
      return res.status(400).json({ error: 'Missing title or transaction hash' });
    }

    const note = await dbHelpers.createNote(
      req.user.id, 
      req.user.wallet_address, 
      title, 
      content, 
      txHash, 
      contentHash || "",
      Date.now(),
      color || '#ffffff',
      'Pending'
    );

    res.status(201).json({ message: 'Note cached', note });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// Update Note
app.put('/api/notes/:id', walletAuthMiddleware, async (req, res) => {
  try {
    const { title, content, txHash, contentHash } = req.body;
    const query = `
      UPDATE notes 
      SET title = $1, content = $2, tx_hash = $3, content_hash = $4, status = 'Pending Update', updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [
      title, content, txHash, contentHash, req.params.id, req.user.id
    ]);
    res.json({ message: 'Update cached', note: result.rows[0] });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete Note
app.delete('/api/notes/:id', walletAuthMiddleware, async (req, res) => {
  try {
    const { txHash } = req.body;
    const query = `UPDATE notes SET status = 'Pending Delete', tx_hash = $1 WHERE id = $2 AND user_id = $3`;
    await pool.query(query, [txHash, req.params.id, req.user.id]);
    res.json({ message: 'Delete pending confirmation' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

console.log("SERVER: 6. Attempting to LISTEN on port " + PORT + "...");

try {
  const server = app.listen(PORT, () => {
    console.log("SERVER: 7. ✅ SUCCESS! Server is running!");
    console.log(`SERVER: 8. Listening on http://localhost:${PORT}`);
  });

  server.on('error', (e) => {
    console.error("SERVER: 💥 LISTEN ERROR:", e.message);
  });
} catch (e) {
  console.error("SERVER: 💥 CRITICAL ERROR during listen:", e.message);
}