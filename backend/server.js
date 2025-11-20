// backend/server.js
// Express API server with authentication and blockchain integration

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers, pool } = require('./database'); // 👈 Added pool
const { authMiddleware, JWT_SECRET } = require('./authMiddleware');
const transactionBuilder = require('./transactionBuilder');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Blockchain Notes API Server' });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await dbHelpers.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await dbHelpers.createUser(username, hashedPassword);

    // 🎁 NEW: Give Signup Bonus (Database Update)
    const BONUS_AMOUNT = 10.00;
    await pool.query('UPDATE users SET ada_balance = $1 WHERE id = $2', [BONUS_AMOUNT, user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      signupBonus: BONUS_AMOUNT, // 👈 Tell frontend to show the alert
      user: {
        id: user.id,
        username: user.username,
        ada_balance: BONUS_AMOUNT // 👈 Send the new balance
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const user = await dbHelpers.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        totalNotes: user.total_notes
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ==================== NOTES ROUTES (Protected) ====================

// Get all notes for logged-in user
app.get('/api/notes', authMiddleware, async (req, res) => {
  try {
    const notes = await dbHelpers.getNotesByUserId(req.userId);
    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note by ID
app.get('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const note = await dbHelpers.getNoteById(req.params.id, req.userId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create new note (with blockchain transaction)
app.post('/api/notes', authMiddleware, async (req, res) => {
  try {
    const { title, content, color } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    console.log(`Creating note for user ${req.userId}: "${title}"`);

    // 1. Submit to blockchain
    const blockchainResult = await transactionBuilder.createNoteTransaction(
      'CREATE',
      { id: 0, title, content }, // id will be set after DB insert
      req.userId
    );

    if (!blockchainResult.success) {
      return res.status(500).json({ 
        error: 'Blockchain transaction failed',
        details: blockchainResult.error 
      });
    }

    // 2. Save to database
    const note = await dbHelpers.createNote(
      req.userId,
      title,
      content,
      blockchainResult.txHash,
      blockchainResult.contentHash,
      blockchainResult.timestamp,
      color || '#ffffff'
    );

    // 3. 🎁 NEW: Give Note Creation Reward (+2 ADA)
    const REWARD_AMOUNT = 2.00;
    await pool.query('UPDATE users SET ada_balance = ada_balance + $1 WHERE id = $2', [REWARD_AMOUNT, req.userId]);

    res.status(201).json({
      message: 'Note created successfully',
      note,
      reward: { amount: REWARD_AMOUNT }, // Tell frontend about the reward
      blockchain: {
        txHash: blockchainResult.txHash,
        explorer: blockchainResult.explorer
      }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note (with blockchain transaction)
app.put('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    // Check if note exists
    const existingNote = await dbHelpers.getNoteById(noteId, req.userId);
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log(`Updating note ${noteId} for user ${req.userId}`);

    // Submit to blockchain
    const blockchainResult = await transactionBuilder.createNoteTransaction(
      'UPDATE',
      { id: noteId, title, content },
      req.userId
    );

    if (!blockchainResult.success) {
      return res.status(500).json({ 
        error: 'Blockchain transaction failed',
        details: blockchainResult.error 
      });
    }

    console.log(`Blockchain TX submitted: ${blockchainResult.txHash}`);

    // Update database
    const updatedNote = await dbHelpers.updateNote(
      noteId,
      req.userId,
      title,
      content,
      blockchainResult.txHash,
      blockchainResult.contentHash,
      blockchainResult.timestamp
    );

    res.json({
      message: 'Note updated successfully',
      note: updatedNote,
      blockchain: {
        txHash: blockchainResult.txHash,
        explorer: blockchainResult.explorer
      }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note (with blockchain transaction)
app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;

    // Check if note exists
    const existingNote = await dbHelpers.getNoteById(noteId, req.userId);
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log(`Deleting note ${noteId} for user ${req.userId}`);

    // Submit to blockchain
    const blockchainResult = await transactionBuilder.createNoteTransaction(
      'DELETE',
      { id: noteId, title: existingNote.title, content: '' },
      req.userId
    );

    if (!blockchainResult.success) {
      return res.status(500).json({ 
        error: 'Blockchain transaction failed',
        details: blockchainResult.error 
      });
    }

    console.log(`Blockchain TX submitted: ${blockchainResult.txHash}`);

    // Delete from database
    await dbHelpers.deleteNote(noteId, req.userId, blockchainResult.txHash);

    res.json({
      message: 'Note deleted successfully',
      blockchain: {
        txHash: blockchainResult.txHash,
        explorer: blockchainResult.explorer
      }
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ==================== BLOCKCHAIN ROUTES ====================

// Verify note on blockchain
app.get('/api/notes/:id/verify', authMiddleware, async (req, res) => {
  try {
    const note = await dbHelpers.getNoteById(req.params.id, req.userId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (!note.tx_hash) {
      return res.status(404).json({ error: 'No blockchain transaction found' });
    }

    // Check transaction status
    const txStatus = await transactionBuilder.checkTransaction(note.tx_hash);

    res.json({
      note: {
        id: note.id,
        title: note.title,
        contentHash: note.content_hash
      },
      blockchain: {
        txHash: note.tx_hash,
        status: txStatus.found ? 'confirmed' : 'pending',
        confirmations: txStatus.confirmations,
        blockHeight: txStatus.blockHeight,
        explorer: `https://preprod.cardanoscan.io/transaction/${note.tx_hash}`
      }
    });
  } catch (error) {
    console.error('Verify note error:', error);
    res.status(500).json({ error: 'Failed to verify note' });
  }
});

// Get all blockchain transactions for user
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await dbHelpers.getTransactionsByUserId(req.userId);
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log('Blockchain integration: ACTIVE');
});

module.exports = app;