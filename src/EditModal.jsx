// EditModal.jsx
import { useState, useEffect } from 'react';
import { styles } from './styles.js';

const EditModal = ({ note, isOpen, onClose, onUpdate }) => {
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');

  useEffect(() => {
    if (note) {
      setUpdatedTitle(note.title);
      setUpdatedContent(note.content);
    }
  }, [note]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        handleUpdate();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUpdate = () => {
    if (updatedTitle.trim()) {
      onUpdate(note.id, updatedTitle.trim(), updatedContent.trim());
      onClose();
    }
  };

  return (
    <div style={{ ...styles.modalBackdrop, color: 'black' }} onClick={handleBackdropClick}>
      <div style={{ ...styles.modalContent, color: 'black' }}>
        <div style={styles.modalHeader}>
          <h2 style={{ ...styles.modalTitle, color: 'black' }}>Edit Note</h2>
          <button 
            onClick={onClose}
            style={styles.modalCloseButton}
            title="Close modal (ESC)"
          >
            ✕
          </button>
        </div>
        <div style={styles.modalBody}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'black' }}>
            <input 
              type="text" 
              value={updatedTitle} 
              onChange={(e) => setUpdatedTitle(e.target.value)}
              style={{ ...styles.input, color: 'black' }}
              placeholder="Note title..."
              autoFocus
            />
            <textarea 
              value={updatedContent} 
              onChange={(e) => setUpdatedContent(e.target.value)}
              rows={8}
              style={{ ...styles.textarea, color: 'black' }}
              placeholder="Note content..."
            />
          </div>
        </div>
        <div style={styles.modalFooter}>
          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            Tip: Esc to cancel
          </small>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onClose}
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
            <button 
              onClick={handleUpdate}
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;