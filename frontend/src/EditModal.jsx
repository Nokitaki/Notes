// src/EditModal.jsx
import { useState, useEffect } from 'react';
import styles from './styles/EditModal.module.css';

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
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Note</h2>
          <button 
            onClick={onClose}
            className={styles.modalCloseButton}
            title="Close modal (ESC)"
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formContainer}>
            <input 
              type="text" 
              value={updatedTitle} 
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className={styles.input}
              placeholder="Note title..."
              autoFocus
            />
            <textarea 
              value={updatedContent} 
              onChange={(e) => setUpdatedContent(e.target.value)}
              className={styles.textarea}
              placeholder="Note content..."
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <small className={styles.footerHint}>
            Tip: Esc to cancel
          </small>
          <div className={styles.buttonGroup}>
            <button 
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate}
              className={styles.saveButton}
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