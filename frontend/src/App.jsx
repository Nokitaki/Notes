// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // NEW state for handling edits
  const [editingId, setEditingId] = useState(null); // ID of the note being edited
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleCreateNote = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (response.ok) {
        setTitle('');
        setContent('');
        fetchNotes();
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  // NEW function to start editing a note
  const handleEditClick = (note) => {
    setEditingId(note.id);
    setUpdatedTitle(note.title);
    setUpdatedContent(note.content);
  };
  
  // NEW function to cancel an edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // NEW function to update a note
  const handleUpdateNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: updatedTitle, content: updatedContent }),
      });
      if (response.ok) {
        setEditingId(null); // Exit editing mode
        fetchNotes();     // Refresh notes
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Simple Notes</h1>
      </header>
      
      <form onSubmit={handleCreateNote} className="note-form">
        <h2>Add a New Note</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Add Note</button>
      </form>

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            {editingId === note.id ? (
              // This is the NEW editing view
              <div className="edit-form">
                <input 
                  type="text" 
                  value={updatedTitle} 
                  onChange={(e) => setUpdatedTitle(e.target.value)} 
                />
                <textarea 
                  value={updatedContent} 
                  onChange={(e) => setUpdatedContent(e.target.value)} 
                />
                <button onClick={() => handleUpdateNote(note.id)} className="save-btn">Save</button>
                <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
              </div>
            ) : (
              // This is the normal view
              <>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <div className="note-footer">
                  <small>{new Date(note.created_at).toLocaleString()}</small>
                  <div>
                    <button onClick={() => handleEditClick(note)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDeleteNote(note.id)} className="delete-btn">X</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;