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

  // Parse helper inside component
  const getChecklistData = (content) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.type === 'checklist' && Array.isArray(parsed.items)) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const checklistData = getChecklistData(note.content);

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
          {checklistData ? (
            // 📋 FULL CHECKLIST VIEW
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {checklistData.items.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                   <span style={{ fontSize: '1.25rem' }}>
                     {item.completed ? '☑️' : '⬜'}
                   </span>
                   <span style={{ 
                     textDecoration: item.completed ? 'line-through' : 'none',
                     color: item.completed ? '#94a3b8' : '#1e293b',
                     fontSize: '1.1rem',
                   }}>
                     {item.text}
                   </span>
                </div>
              ))}
            </div>
          ) : (
            // 📝 STANDARD TEXT VIEW
            <p className={styles.modalText}>
              {note.content || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No content</span>}
            </p>
          )}

          {/* Tags Display */}
          {note.tags && note.tags.length > 0 && (
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '0.75rem'
              }}>
                🏷️ Tags
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#ede9fe',
                      color: '#7c3aed',
                      borderRadius: '16px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* BLOCKCHAIN PROOF SECTION */}
          {note.tx_hash && (
            <div className={styles.blockchainInfo}>
              <p className={styles.blockchainLabel}>
                🔗 Blockchain Transaction Proof
              </p>
              <p className={styles.blockchainHash}>
                {note.tx_hash}
              </p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <a 
                  href={`https://preprod.cardanoscan.io/transaction/${note.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.9rem',
                    color: '#667eea',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  View on Cardano Explorer ↗
                </a>
              </div>
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