// backend/server.js
console.log("SERVER: 1. Starting initialization...");

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { dbHelpers, pool } = require('./database');
const { fork } = require('child_process'); // Import fork to run separate processes
const path = require('path');              // Import path to resolve file locations

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== AUTH MIDDLEWARE ====================
const walletAuthMiddleware = async (req, res, next) => {
  const walletAddress = req.headers['x-wallet-address'];
  
  if (!walletAddress) {
    return res.status(401).json({ error: 'Wallet address required' });
  }

  try {
    // Find or create the user
    const user = await dbHelpers.findOrCreateUser(walletAddress);
    
    if (!user) {
      console.log("   ❌ Database returned no user object");
      throw new Error("User retrieval failed");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("   ❌ Auth Middleware Error:", error.message);
    res.status(500).json({ error: 'Database authentication failed' });
  }
};

// ==================== ROUTES ====================

app.get('/', (req, res) => res.send('Blockchain Notes API Running'));

// 1. GET Notes
app.get('/api/notes', walletAuthMiddleware, async (req, res) => {
  try {
    const notes = await dbHelpers.getNotesByUserId(req.user.id);
    res.json({ notes });
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// 2. CREATE Note
app.post('/api/notes', walletAuthMiddleware, async (req, res) => {
  try {
    const { title, content, color, txHash, contentHash } = req.body;
    
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

// 3. UPDATE Note
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

// 4. DELETE Note
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

// Start Server
app.listen(PORT, () => {
  console.log(`SERVER: ✅ Running on http://localhost:${PORT}`);

  // --- WORKER STARTUP LOGIC ---
  // Fork the worker.js file located in the same directory
  const workerProcess = fork(path.join(__dirname, 'worker.js'));

  console.log(`SERVER: 🤖 Background Worker started with PID: ${workerProcess.pid}`);

  // Optional: Listen for messages from the worker
  workerProcess.on('message', (msg) => {
    console.log('SERVER: Message from worker:', msg);
  });

  // Optional: Handle worker exit (e.g., unexpected crash)
  workerProcess.on('exit', (code) => {
    console.log(`SERVER: ⚠️ Worker process exited with code ${code}`);
    // You could add logic here to restart the worker if it crashes
  });
});