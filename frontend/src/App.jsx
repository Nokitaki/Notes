import { useState, useEffect } from 'react';
import { styles } from './styles.js';
import NoteForm from './NoteForm.jsx';
import NotesList from './NotesList.jsx';
import Modal from './Modal.jsx';
import EditModal from './EditModal.jsx';
import './App.css';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff'); // Add color state
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View modal state
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit modal state
  const [editNote, setEditNote] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch notes from API
  useEffect(() => {
    fetchNotes();
  }, []);

  // Modal handlers
  const handleCardClick = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleEditClick = (note) => {
    setEditNote(note);
    setIsEditModalOpen(true);
    setEditingId(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditNote(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // API functions
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes. Make sure your server is running.');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your note.');
      return;
    }

    try {
      const newNote = {
        title: title.trim(),
        content: content.trim(),
        color: color, // Include color
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdNote = await response.json();
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
      setContent('');
      setColor('#ffffff'); // Reset color to default
    } catch (err) {
      alert('Failed to create note. Please try again.');
      console.error('Error creating note:', err);
    }
  };

  const handleUpdateNote = async (id, newTitle, newContent, newColor) => {
    try {
      const updatedNote = {
        title: newTitle,
        content: newContent,
        color: newColor, // Include color
      };

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updated = await response.json();
      setNotes(prev => prev.map(note => 
        note.id === id ? updated : note
      ));
      
      // Update the selected note if it's the one being edited
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(updated);
      }
    } catch (err) {
      alert('Failed to update note. Please try again.');
      console.error('Error updating note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setNotes(prev => prev.filter(note => note.id !== id));
        if (editingId === id) {
          setEditingId(null);
        }
        
        // Close modals if the deleted note was open
        if (selectedNote && selectedNote.id === id) {
          setIsModalOpen(false);
          setSelectedNote(null);
        }
        if (editNote && editNote.id === id) {
          setIsEditModalOpen(false);
          setEditNote(null);
        }
      } catch (err) {
        alert('Failed to delete note. Please try again.');
        console.error('Error deleting note:', err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        ...styles.container,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading your notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...styles.container,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <p style={{ color: '#ef4444', fontSize: '1.1rem', textAlign: 'center' }}>{error}</p>
        <button 
          onClick={fetchNotes}
          style={{
            ...styles.addButton,
            padding: '0.75rem 1.5rem'
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        <NoteForm
          title={title}
          content={content}
          color={color}
          setTitle={setTitle}
          setContent={setContent}
          setColor={setColor}
          onCreateNote={handleCreateNote}
        />
        <NotesList
          notes={notes}
          onEdit={handleEditClick}
          onDelete={handleDeleteNote}
          onCardClick={handleCardClick}
        />
      </div>
      
      {/* View Modal */}
      <Modal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      
      {/* Edit Modal */}
      <EditModal
        note={editNote}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateNote}
      />
    </>
  );
}

export default App;