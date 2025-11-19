// server.js

// 1. Import Dependencies
require("dotenv").config(); // Loads variables from .env into process.env
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg"); // PostgreSQL database driver
// Import Cardano Service
const cardanoService = require("./cardanoService");

// 2. Set Up Application
const app = express();
const PORT = 5000; // The port our backend will run on

// 3. Configure Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 4. Middleware
app.use(cors()); // Enable cross-origin requests
app.use(express.json()); // Allow the server to understand JSON data

// 5. Define API Routes (CRUD Endpoints)

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// User Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create new user (password should be hashed in production!)
    const newUser = await pool.query(
      "INSERT INTO users (username, password, ada_balance) VALUES($1, $2, $3) RETURNING id, username, ada_balance, created_at",
      [username, password, 10] // Start with 10 tADA signup bonus
    );

    // Send signup reward
    const rewardResult = await cardanoService.sendReward(
      newUser.rows[0].id,
      10,
      "Signup bonus"
    );

    console.log(`✅ New user registered: ${username}`);
    console.log(`🎁 Signup bonus: 10 tADA\n`);

    res.status(201).json({
      message: "Account created successfully!",
      user: newUser.rows[0],
      signupBonus: 10,
      txHash: rewardResult.txHash,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Find user
    const user = await pool.query(
      "SELECT id, username, ada_balance, total_notes, created_at FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log(`✅ User logged in: ${username}\n`);

    res.json({
      message: "Login successful",
      user: user.rows[0],
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Get User Info (including balance and stats)
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query(
      "SELECT id, username, ada_balance, total_notes, created_at FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's blockchain transactions
    const transactions = cardanoService.getUserTransactions(parseInt(id));

    res.json({
      user: user.rows[0],
      transactions: transactions,
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================
// NOTES ROUTES (Enhanced with Blockchain)
// ============================================

// READ All Notes (no blockchain needed - just fetch from DB)
app.get("/api/notes", async (req, res) => {
  try {
    const { userId } = req.query;

    let query;
    let params;

    if (userId) {
      // Get notes for specific user
      query = "SELECT * FROM notes WHERE user_id = $1 ORDER BY id DESC";
      params = [userId];
    } else {
      // Get all notes
      query = "SELECT * FROM notes ORDER BY id DESC";
      params = [];
    }

    const allNotes = await pool.query(query, params);

    res.json(allNotes.rows);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// CREATE Note (with blockchain recording + rewards)
app.post("/api/notes", async (req, res) => {
  try {
    const { title, content, color, userId } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("📝 Creating note for user:", userId); // DEBUG

    // 1. Save note to database
    const newNote = await pool.query(
      "INSERT INTO notes (title, content, color, user_id) VALUES($1, $2, $3, $4) RETURNING *",
      [title.trim(), content?.trim() || "", color || "#ffffff", userId]
    );

    const note = newNote.rows[0];
    console.log("✅ Note saved to database, ID:", note.id); // DEBUG

    // 2. Record operation on blockchain
    const blockchainResult = await cardanoService.recordNoteOperation(
      "CREATE",
      {
        id: note.id,
        title: note.title,
        content: note.content,
      },
      userId
    );
    console.log("✅ Blockchain result:", blockchainResult.txHash); // DEBUG

    // 3. Update note with blockchain info
    await pool.query(
      "UPDATE notes SET tx_hash = $1, content_hash = $2, blockchain_timestamp = $3 WHERE id = $4",
      [
        blockchainResult.txHash,
        blockchainResult.contentHash,
        blockchainResult.timestamp,
        note.id,
      ]
    );

    // 4. Record transaction in blockchain_transactions table
    await pool.query(
      "INSERT INTO blockchain_transactions (tx_hash, operation_type, note_id, user_id, metadata) VALUES($1, $2, $3, $4, $5)",
      [
        blockchainResult.txHash,
        "CREATE",
        note.id,
        userId,
        JSON.stringify(blockchainResult.metadata),
      ]
    );

    // 5. Send reward (2 tADA)
    const noteReward = 2;
    const rewardResult = await cardanoService.sendReward(
      userId,
      noteReward,
      "Note creation reward"
    );
    console.log("✅ Reward sent:", rewardResult.success); // DEBUG

    // 6. Update user balance and note count
    if (rewardResult.success) {
      await pool.query(
        "UPDATE users SET ada_balance = ada_balance + $1, total_notes = total_notes + 1 WHERE id = $2",
        [noteReward, userId]
      );
    }

    // 7. Return complete response
    const response = {
      success: true,
      message: `Note created! You earned ${noteReward} tADA!`,
      note: {
        ...note,
        tx_hash: blockchainResult.txHash,
        content_hash: blockchainResult.contentHash,
      },
      blockchain: {
        txHash: blockchainResult.txHash,
        contentHash: blockchainResult.contentHash,
        timestamp: blockchainResult.timestamp,
      },
      reward: {
        amount: noteReward,
        txHash: rewardResult.txHash,
      },
    };

    console.log("📤 Sending response..."); // DEBUG
    res.status(201).json(response);
  } catch (err) {
    console.error("❌ Create note error:", err);
    console.error("Stack:", err.stack); // FULL ERROR
    res.status(500).json({
      error: "Failed to create note",
      details: err.message,
    });
  }
});

// UPDATE Note (with blockchain recording)
app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, color, userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // 1. Update note in database
    const updatedNote = await pool.query(
      "UPDATE notes SET title = $1, content = $2, color = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *",
      [title, content, color, id, userId]
    );

    if (updatedNote.rows.length === 0) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    const note = updatedNote.rows[0];

    // 2. Record update on blockchain
    const blockchainResult = await cardanoService.recordNoteOperation(
      "UPDATE",
      {
        id: note.id,
        title: note.title,
        content: note.content,
      },
      userId
    );

    // 3. Update blockchain info
    await pool.query(
      "UPDATE notes SET tx_hash = $1, content_hash = $2, blockchain_timestamp = $3 WHERE id = $4",
      [
        blockchainResult.txHash,
        blockchainResult.contentHash,
        blockchainResult.timestamp,
        note.id,
      ]
    );

    // 4. Record transaction
    await pool.query(
      "INSERT INTO blockchain_transactions (tx_hash, operation_type, note_id, user_id, metadata) VALUES($1, $2, $3, $4, $5)",
      [
        blockchainResult.txHash,
        "UPDATE",
        note.id,
        userId,
        JSON.stringify(blockchainResult.metadata),
      ]
    );

    res.json({
      success: true,
      message: "Note updated successfully!",
      note: {
        ...note,
        tx_hash: blockchainResult.txHash,
        content_hash: blockchainResult.contentHash,
      },
      blockchain: {
        txHash: blockchainResult.txHash,
        contentHash: blockchainResult.contentHash,
      },
    });
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// DELETE Note (with blockchain recording)
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // 1. Get note info before deleting
    const noteToDelete = await pool.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (noteToDelete.rows.length === 0) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    const note = noteToDelete.rows[0];

    // 2. Record deletion on blockchain (before deleting from DB)
    const blockchainResult = await cardanoService.recordNoteOperation(
      "DELETE",
      {
        id: note.id,
        title: note.title,
        content: note.content,
      },
      userId
    );

    // 3. Record transaction (keep this even after note is deleted)
    await pool.query(
      "INSERT INTO blockchain_transactions (tx_hash, operation_type, note_id, user_id, metadata) VALUES($1, $2, $3, $4, $5)",
      [
        blockchainResult.txHash,
        "DELETE",
        note.id,
        userId,
        JSON.stringify(blockchainResult.metadata),
      ]
    );

    // 4. Delete from database
    await pool.query("DELETE FROM notes WHERE id = $1", [id]);

    // 5. Update user's note count
    await pool.query(
      "UPDATE users SET total_notes = total_notes - 1 WHERE id = $1",
      [userId]
    );

    res.json({
      success: true,
      message: "Note deleted successfully",
      blockchain: {
        txHash: blockchainResult.txHash,
        proof: "Deletion recorded on blockchain (immutable proof)",
      },
    });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ============================================
// BLOCKCHAIN INFO ROUTES
// ============================================

// Get Blockchain Statistics
app.get("/api/blockchain/stats", async (req, res) => {
  try {
    const stats = cardanoService.getStats();

    // Get total users
    const usersCount = await pool.query("SELECT COUNT(*) as count FROM users");

    // Get total notes
    const notesCount = await pool.query("SELECT COUNT(*) as count FROM notes");

    res.json({
      blockchain: stats,
      database: {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalNotes: parseInt(notesCount.rows[0].count),
      },
      network: "Cardano Preprod Testnet",
      status: "Connected",
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// 6. Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});