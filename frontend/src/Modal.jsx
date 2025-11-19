// src/Modal.jsx
import { useEffect } from 'react';
import styles from './styles/Modal.module.css';

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
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{note.title}</h2>
          <button 
            onClick={onClose}
            className={styles.modalCloseButton}
            title="Close modal (ESC)"
          >
            ✕
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.modalText}>
            {note.content || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No content</span>}
          </p>
          
          {note.tx_hash && (
            <div className={styles.blockchainInfo}>
              <p className={styles.blockchainLabel}>
                🔗 Blockchain Transaction
              </p>
              <p className={styles.blockchainHash}>
                {note.tx_hash}
              </p>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <small className={styles.modalFooterDate}>
            Created: {new Date(note.created_at).toLocaleString()}
          </small>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;