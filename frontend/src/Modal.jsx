// Modal.jsx
import { useEffect } from 'react';
import { styles } from './styles.js';

const Modal = ({ note, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
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

  return (
    <div style={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{note.title}</h2>
          <button 
            onClick={onClose}
            style={styles.modalCloseButton}
            title="Close modal (ESC)"
          >
            ✕
          </button>
        </div>
        <div style={styles.modalBody}>
          <p style={styles.modalText}>
            {note.content || (
              <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                No content available
              </span>
            )}
          </p>
        </div>
        <div style={styles.modalFooter}>
          <small style={styles.noteDate}>
            Created: {new Date(note.created_at).toLocaleString()}
          </small>
          {note.updated_at && (
            <small style={styles.noteDate}>
              Updated: {new Date(note.updated_at).toLocaleString()}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;