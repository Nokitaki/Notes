import { useState, useEffect } from 'react';
import './App.css';

// All styles in one place
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8fafc',
  },
  leftColumn: {
    width: '400px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    padding: '2rem',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)',
  },
  rightColumn: {
    flex: 1,
    padding: '2rem',
    overflow: 'auto',
  },
  logo: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  noteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '0.5rem',
  },
  input: {
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  textarea: {
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    resize: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
  },
  addButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  notesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  notesTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  notesCount: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  notesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  noteCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease',
    border: '1px solid #f1f5f9',
  },
  noteTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.75rem 0',
    lineHeight: '1.4',
  },
  noteContent: {
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 1.5rem 0',
    fontSize: '0.95rem',
  },
  noteFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    color: '#94a3b8',
    fontSize: '0.8rem',
  },
  noteActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    background: '#f0f9ff',
    border: '1px solid #e0f2fe',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  deleteButton: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
  },
};

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');

  // Load mock data
  useEffect(() => {
    // Start with empty notes array - clean slate for first-time users
    setNotes([]);
  }, []);

  const handleCreateNote = () => {
    if (!title.trim()) {
      alert('Please enter a title for your note.');
      return;
    }

    const newNote = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString()
    };
    
    setNotes(prev => [newNote, ...prev]);
    setTitle('');
    setContent('');
  };

  const handleEditClick = (note) => {
    setEditingId(note.id);
    setUpdatedTitle(note.title);
    setUpdatedContent(note.content);
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateNote = (id) => {
    if (!updatedTitle.trim()) return;
    
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, title: updatedTitle.trim(), content: updatedContent.trim() }
        : note
    ));
    setEditingId(null);
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Column - Add Note */}
      <div style={styles.leftColumn}>
        <h1 style={styles.logo}> Notes</h1>
        <div style={styles.noteForm}>
          <h2 style={styles.formTitle}>Create New Note</h2>
          <input
            type="text"
            placeholder="Enter note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleCreateNote()}
          />
          <textarea
            placeholder="Write your note content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            style={styles.textarea}
            onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleCreateNote()}
          />
          <button onClick={handleCreateNote} style={styles.addButton}>
            <span></span> Add Note
          </button>
          <small style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>
            Tip: Press Ctrl + Enter to quickly add a note
          </small>
        </div>
      </div>

      {/* Right Column - Notes List */}
      <div style={styles.rightColumn}>
        <div style={styles.notesHeader}>
          <h2 style={styles.notesTitle}>Your Notes</h2>
          <span style={styles.notesCount}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
        
        <div style={styles.notesGrid}>
          {notes.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No notes yet. Create your first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} style={styles.noteCard}>
                {editingId === note.id ? (
                  // Edit mode
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                      type="text" 
                      value={updatedTitle} 
                      onChange={(e) => setUpdatedTitle(e.target.value)}
                      style={styles.input}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) handleUpdateNote(note.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <textarea 
                      value={updatedContent} 
                      onChange={(e) => setUpdatedContent(e.target.value)}
                      rows={4}
                      style={styles.textarea}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) handleUpdateNote(note.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => handleUpdateNote(note.id)}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                        }}
                      >
                         Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                        }}
                      >
                         Cancel
                      </button>
                    </div>
                    <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      Tip: Ctrl + Enter to save, Esc to cancel
                    </small>
                  </div>
                ) : (
                  // View mode
                  <>
                    <h3 style={styles.noteTitle}>{note.title}</h3>
                    <p style={styles.noteContent}>
                      {note.content || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No content</span>}
                    </p>
                    <div style={styles.noteFooter}>
                      <small style={styles.noteDate}>
                        {new Date(note.created_at).toLocaleString()}
                      </small>
                      <div style={styles.noteActions}>
                        <button 
                          onClick={() => handleEditClick(note)}
                          style={styles.editButton}
                          title="Edit note"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          style={styles.deleteButton}
                          title="Delete note"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;