// server.js

// 1. Import Dependencies
require('dotenv').config(); // Loads variables from .env into process.env
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL database driver

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

// GET /api/notes - Read all notes
app.get('/api/notes', async (req, res) => {
  try {
    const allNotes = await pool.query('SELECT * FROM notes ORDER BY id DESC');
    res.json(allNotes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/notes - Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = await pool.query(
      'INSERT INTO notes (title, content) VALUES($1, $2) RETURNING *',
      [title, content]
    );
    res.status(201).json(newNote.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// We will add Update and Delete functionality later to keep this step simple.
// PUT /api/notes/:id - Update a note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the note's ID from the URL
    const { title, content } = req.body; // Get the new title and content from the request body

    const updatedNote = await pool.query(
      'UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );

    if (updatedNote.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    res.json(updatedNote.rows[0]); // Send back the updated note
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    
    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    
    res.json({ message: 'Note deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 6. Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});