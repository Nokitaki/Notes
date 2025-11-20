// src/EditModal.jsx
import { useState, useEffect, useRef } from 'react';
import styles from './styles/EditModal.module.css';
import { insertAtCursor } from './markdown.js';

const EditModal = ({ note, isOpen, onClose, onUpdate }) => {
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Parse content when modal opens
  useEffect(() => {
    if (note) {
      setUpdatedTitle(note.title);
      setTags(note.tags || []);
      
      try {
        const parsed = JSON.parse(note.content);
        if (parsed && parsed.type === 'checklist' && Array.isArray(parsed.items)) {
          setIsChecklist(true);
          setChecklistItems(parsed.items);
          setTextContent('');
        } else {
          throw new Error('Not a checklist');
        }
      } catch (e) {
        // Fallback to normal text mode
        setIsChecklist(false);
        setTextContent(note.content);
        setChecklistItems([]);
      }
    }
  }, [note, isOpen]);

  // Handle Checklist Operations
  const toggleItem = (id) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setChecklistItems(prev => [
      ...prev, 
      { id: Date.now(), text: newItemText.trim(), completed: false }
    ]);
    setNewItemText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addItem();
    }
  };

  // Tag handling
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag.startsWith('#') ? tag : `#${tag}`]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleUpdate = () => {
    if (!updatedTitle.trim()) return;

    let finalContent = textContent;

    // If it's a checklist, verify we pack it back into JSON
    if (isChecklist) {
      const checklistData = {
        type: 'checklist',
        items: checklistItems
      };
      finalContent = JSON.stringify(checklistData);
    }

    onUpdate(note.id, updatedTitle.trim(), finalContent.trim(), tags);
    onClose();
  };

  if (!isOpen || !note) return null;

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isChecklist ? 'Edit Checklist' : 'Edit Note'}
          </h2>
          <button onClick={onClose} className={styles.modalCloseButton}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formContainer}>
            {/* Title Input */}
            <input 
              type="text" 
              value={updatedTitle} 
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className={styles.input}
              placeholder="Note title..."
            />

            {/* EDITOR AREA */}
            {isChecklist ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Add New Item */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className={styles.input}
                    placeholder="Add new item..."
                    style={{ flex: 1 }}
                  />
                  <button 
                    onClick={addItem}
                    style={{
                      padding: '0 20px',
                      background: '#64748b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Checklist Items */}
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px'
                }}>
                  {checklistItems.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                      No items. Add one above!
                    </p>
                  )}
                  
                  {checklistItems.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderBottom: '1px solid #f1f5f9',
                      background: item.completed ? '#f8fafc' : 'white'
                    }}>
                      <input 
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ 
                        flex: 1,
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? '#94a3b8' : '#334155'
                      }}>
                        {item.text}
                      </span>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '1.1rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // STANDARD TEXT AREA
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button type="button" onClick={() => insertAtCursor(textareaRef.current, '**bold**')} className={styles.input} style={{ padding: '6px' }}>Bold</button>
                  <button type="button" onClick={() => insertAtCursor(textareaRef.current, '# ')} className={styles.input} style={{ padding: '6px' }}>H1</button>
                  <button type="button" onClick={() => insertAtCursor(textareaRef.current, '```\n|\n```')} className={styles.input} style={{ padding: '6px' }}>Code</button>
                  <button type="button" onClick={() => insertAtCursor(textareaRef.current, '- ')} className={styles.input} style={{ padding: '6px' }}>• List</button>
                </div>
                <textarea 
                  ref={textareaRef}
                  value={textContent} 
                  onChange={(e) => setTextContent(e.target.value)}
                  className={styles.textarea}
                  placeholder="Note content (Markdown supported)..."
                />
              </div>
            )}

            {/* Tags Section */}
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <label style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                color: '#475569',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                🏷️ Tags
              </label>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <input
                  type="text"
                  placeholder="Add tag (e.g., school, urgent)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className={styles.input}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                  }}
                />
                <button
                  onClick={handleAddTag}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                  }}
                >
                  Add
                </button>
              </div>

              {/* Display Tags */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem',
                minHeight: '32px'
              }}>
                {tags.length === 0 ? (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#94a3b8',
                    fontStyle: 'italic'
                  }}>
                    No tags added
                  </span>
                ) : (
                  tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#ede9fe',
                        color: '#7c3aed',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7c3aed',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <small className={styles.footerHint}>
            {isChecklist ? 'Checking a box creates a blockchain transaction' : 'Tip: Ctrl+Enter to save'}
          </small>
          <div className={styles.buttonGroup}>
            <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button onClick={handleUpdate} className={styles.saveButton}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;