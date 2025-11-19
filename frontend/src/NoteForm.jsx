// NoteForm.jsx
import { useState } from 'react';
import { styles } from './styles.js';

const NoteForm = ({ title, content, setTitle, setContent, onCreateNote }) => {
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCreateNote();
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, {
        id: Date.now(),
        text: newChecklistItem.trim(),
        completed: false
      }]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (id) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const handleToggleChecklistItem = (id) => {
    setChecklistItems(checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleKeyPressChecklist = (e) => {
    if (e.key === 'Enter') {
      handleAddChecklistItem();
    }
  };

  const handleCreateNote = () => {
    if (!title.trim()) {
      alert('Please enter a title for your note.');
      return;
    }

    let noteContent = '';
    
    if (isChecklistMode) {
      const checklistData = {
        type: 'checklist',
        items: checklistItems
      };
      noteContent = JSON.stringify(checklistData);
    } else {
      noteContent = content;
    }

    const newNote = {
      title: title.trim(),
      content: noteContent,
      color: '#ffffff',
    };

    onCreateNote(newNote);
    
    // Reset form
    setTitle('');
    setContent('');
    setChecklistItems([]);
    setIsChecklistMode(false);
  };

  return (
    <div style={styles.leftColumn}>
      <div style={{
        ...styles.noteForm,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Mode Toggle Only */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          backgroundColor: '#f8fafc',
          padding: '0.5rem',
          borderRadius: '12px'
        }}>
          <button
            type="button"
            onClick={() => setIsChecklistMode(false)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: !isChecklistMode ? '#667eea' : 'transparent',
              color: !isChecklistMode ? 'white' : '#64748b',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
          >
             Text Note
          </button>
          <button
            type="button"
            onClick={() => setIsChecklistMode(true)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isChecklistMode ? '#667eea' : 'transparent',
              color: isChecklistMode ? 'white' : '#64748b',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
          >
             Checklist
          </button>
        </div>

        {/* Content Area */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '0'
        }}>
          {!isChecklistMode ? (
            // Text Note Mode - Keep title and content
            <>
              {/* Title Input */}
              <div>
                <input
                  type="text"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ 
                    ...styles.input, 
                    color: 'black',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Textarea */}
              <div style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px'
              }}>
                <textarea
                  placeholder="Write your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ 
                    ...styles.textarea, 
                    color: 'black',
                    flex: 1,
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: '150px',
                    resize: 'vertical'
                  }}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Create Button for Text Mode */}
              <div style={{ marginTop: 'auto' }}>
                <button 
                  onClick={handleCreateNote} 
                  style={{
                    ...styles.addButton,
                    width: '100%',
                  }}
                >
                   Add Note
                </button>

                <small style={{ 
                  color: '#64748b', 
                  textAlign: 'center', 
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '0.5rem'
                }}>
                  Tip: Ctrl + Enter to quickly save
                </small>
              </div>
            </>
          ) : (
            // Checklist Mode - Remove title input and create button
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minHeight: '200px'
            }}>
              {/* Add Item Input */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Add a new checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={handleKeyPressChecklist}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: 'black',
                    backgroundColor: 'white', // Changed to white background
                  }}
                />
                <button
                  onClick={handleAddChecklistItem}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#64748b', // Changed to #64748b
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                  }}
                >
                  Add
                </button>
              </div>

              {/* Checklist Items */}
              <div style={{ 
                flex: 1,
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                overflowY: 'auto',
                minHeight: '150px'
              }}>
                {checklistItems.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#94a3b8', 
                    padding: '2rem'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                    <p style={{ 
                      fontStyle: 'italic',
                      fontSize: '0.9rem',
                      margin: 0
                    }}>
                      No checklist items yet
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {checklistItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          style={{ 
                            width: '16px', 
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                        <span
                          style={{
                            flex: 1,
                            textDecoration: item.completed ? 'line-through' : 'none',
                            color: item.completed ? '#94a3b8' : '#374151',
                            fontSize: '0.9rem',
                          }}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteForm;