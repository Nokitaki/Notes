// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { styles } from './styles.js';
import appStyles from './styles/App.module.css';
import Auth from './Auth.jsx';
import NoteForm from './NoteForm.jsx';
import NotesList from './NotesList.jsx';
import Modal from './Modal.jsx';
import EditModal from './EditModal.jsx';
import './App.css';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Add token state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState(null);

  // Existing states
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View modal state
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit modal state
  const [editNote, setEditNote] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load user AND token from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token'); // Load token

    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setToken(savedToken);
      setIsAuthenticated(true);
      // Pass the token to fetchNotes
      fetchNotes(userData.id, savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Auth functions
  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken); // Save token
    fetchNotes(userData.id, authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setNotes([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Clear token
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

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

  // API functions
  const fetchNotes = async (userId, currentToken) => {
    // Use the passed token or the state token
    const activeToken = currentToken || token;
    
    if (!activeToken) return; // Don't fetch if no token

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}` // <--- CRITICAL FIX
        }
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Handle format { notes: [...] } vs [...]
      const notesData = data.notes || data;
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (err) {
      setError('Failed to fetch notes. Make sure your server is running.');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData) => {
    if (!noteData.title.trim()) {
      showNotification('Please enter a title for your note.');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- CRITICAL FIX
        },
        body: JSON.stringify({
          ...noteData,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotes(prev => [data.note, ...prev]);
      
      if (data.reward) {
        setUser(prev => ({
          ...prev,
          ada_balance: parseFloat(prev.ada_balance) + data.reward.amount
        }));
        // Update local storage user data with new balance
        const updatedUser = { 
          ...user, 
          ada_balance: parseFloat(user.ada_balance) + data.reward.amount 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        showNotification(`🎉 ${data.message}`);
      }

      setTitle('');
      setContent('');
      setColor('#ffffff');
    } catch (err) {
      showNotification('Failed to create note. Please try again.');
      console.error('Error creating note:', err);
    }
  };

  const handleUpdateNote = async (id, newTitle, newContent, newColor) => {
    try {
      const updatedNote = {
        title: newTitle,
        content: newContent,
        color: newColor,
        userId: user.id
      };

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedNote),
      });

      // 👇 UPDATED ERROR HANDLING START
      if (!response.ok) {
        // Try to read the error message from the server (e.g. "Blockchain is busy!")
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      // 👆 UPDATED ERROR HANDLING END

      const data = await response.json();
      setNotes(prev => prev.map(note => 
        note.id === id ? data.note : note
      ));
      
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(data.note);
      }

      showNotification('Note updated successfully!');
    } catch (err) {
      // Now this notification will show the specific "Wait 60 seconds" message
      showNotification(err.message); 
      console.error('Error updating note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // <--- CRITICAL FIX
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setNotes(prev => prev.filter(note => note.id !== id));
        if (editingId === id) {
          setEditingId(null);
        }
        
        if (selectedNote && selectedNote.id === id) {
          setIsModalOpen(false);
          setSelectedNote(null);
        }
        if (editNote && editNote.id === id) {
          setIsEditModalOpen(false);
          setEditNote(null);
        }

        showNotification('Note deleted successfully');
      } catch (err) {
        showNotification('Failed to delete note. Please try again.');
        console.error('Error deleting note:', err);
      }
    }
  };

  // Show auth screen - with absolute positioning to ignore root padding
  if (!isAuthenticated) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        zIndex: 9999
      }}>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={appStyles.loadingContainer}>
        <div className={appStyles.loadingIcon}>⏳</div>
        <p className={appStyles.loadingText}>Loading your notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={appStyles.errorContainer}>
        <div className={appStyles.errorIcon}>⚠️</div>
        <p className={appStyles.errorText}>{error}</p>
        <button 
          onClick={() => fetchNotes(user.id)}
          className={appStyles.retryButton}
        >
          🔄 Retry
        </button>
        <button 
          onClick={handleLogout}
          style={{ 
            marginTop: '1rem', 
            background: 'transparent', 
            border: '1px solid white', 
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* Notification */}
      {notification && (
        <div className={appStyles.notification}>
          {notification}
        </div>
      )}

      {/* Header */}
      <div className={appStyles.header}>
        <div className={appStyles.userInfo}>
          <span className={appStyles.username}>👤 {user.username}</span>
          <span className={appStyles.balance}>💰 {parseFloat(user.ada_balance).toFixed(2)} tADA</span>
        </div>
        <button 
          onClick={handleLogout}
          className={appStyles.logoutButton}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
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
    </div>
  );
}

export default App;