// src/NoteForm.jsx
import { useState } from 'react';
import { noteFormStyles } from './noteFormStyles.js';

const NoteForm = ({ onCreateNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      handleAddTag();
    }
  };

  const handleCreateNote = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your note.');
      return;
    }

    setIsSubmitting(true);
    
    try {
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
        tags: tags,
        timestamp: new Date().toISOString()
      };

      await onCreateNote(newNote);
      
      // Reset form
      setTitle('');
      setContent('');
      setChecklistItems([]);
      setIsChecklistMode(false);
      setTags([]);
      setTagInput('');
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={noteFormStyles.container}>
        {/* Header Section */}
        <div style={noteFormStyles.header}>
          <h2 style={noteFormStyles.headerTitle}>Create New Note</h2>
        </div>

        {/* Mode Toggle - Professional Segmented Control */}
        <div style={noteFormStyles.modeToggleWrapper}>
          <div style={noteFormStyles.modeToggleContainer}>
            <button
              type="button"
              onClick={() => setIsChecklistMode(false)}
              style={noteFormStyles.modeButton(!isChecklistMode)}
            >
              <div style={noteFormStyles.modeButtonContent}>
                <span style={noteFormStyles.modeButtonText}>Text Note</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsChecklistMode(true)}
              style={noteFormStyles.modeButton(isChecklistMode)}
            >
              <div style={noteFormStyles.modeButtonContent}>
                <span style={noteFormStyles.modeButtonText}>Checklist</span>
              </div>
            </button>
          </div>
        </div>

        {/* Title Input Section */}
        <div style={noteFormStyles.inputSection}>
          <label style={noteFormStyles.inputLabel}>
            Title
          </label>
          <input
            type="text"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={noteFormStyles.titleInput}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Content Area */}
        <div style={noteFormStyles.contentSection}>
          <label style={noteFormStyles.inputLabel}>
            {!isChecklistMode ? 'Content' : 'Checklist Items'}
          </label>
          
          {!isChecklistMode ? (
            // Text Note Mode
            <div style={noteFormStyles.textNoteContainer}>
              <textarea
                placeholder="Note something down"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={noteFormStyles.textarea}
                onKeyPress={handleKeyPress}
                rows={8}
              />
              <div style={noteFormStyles.textCounter}>
                <span style={noteFormStyles.textCounterText}>
                  {content.length} characters
                </span>
                <span style={noteFormStyles.textCounterHint}>
                  Ctrl + Enter to save
                </span>
              </div>
            </div>
          ) : (
            // Checklist Mode
            <div style={noteFormStyles.checklistContainer}>
              {/* Add Item Input */}
              <div style={noteFormStyles.checklistInputWrapper}>
                <input
                  type="text"
                  placeholder="Add a new checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={handleKeyPressChecklist}
                  style={noteFormStyles.checklistInput}
                />
                <button
                  onClick={handleAddChecklistItem}
                  style={noteFormStyles.checklistAddButton}
                  disabled={!newChecklistItem.trim()}
                >
                  <span style={noteFormStyles.checklistAddIcon}>+</span>
                </button>
              </div>

              {/* Checklist Items */}
              <div style={noteFormStyles.checklistItemsSection}>
                <div style={noteFormStyles.checklistHeader}>
                  <span style={noteFormStyles.checklistCount}>
                    {checklistItems.length} items
                  </span>
                  <span style={noteFormStyles.checklistProgress}>
                    {checklistItems.filter(item => item.completed).length} completed
                  </span>
                </div>
                
                {checklistItems.length === 0 ? (
                  <div style={noteFormStyles.emptyChecklist}>
                    <div style={noteFormStyles.emptyChecklistIcon}>📋</div>
                    <h4 style={noteFormStyles.emptyChecklistTitle}>
                      No checklist items yet
                    </h4>
                    <p style={noteFormStyles.emptyChecklistText}>
                      Add items above to create your checklist
                    </p>
                  </div>
                ) : (
                  <div style={noteFormStyles.checklistItemsList}>
                    {checklistItems.map((item) => (
                      <div
                        key={item.id}
                        style={noteFormStyles.checklistItem}
                        onClick={() => handleToggleChecklistItem(item.id)}
                      >
                        <div style={noteFormStyles.checklistItemContent}>
                          <div style={noteFormStyles.checklistCheckbox(item.completed)}>
                            {item.completed && (
                              <svg 
                                width="12" 
                                height="12" 
                                viewBox="0 0 12 12"
                                style={noteFormStyles.checkIcon}
                              >
                                <path 
                                  d="M10.28 2.28L3.989 8.57 1.694 6.275c-.39-.39-1.024-.39-1.414 0s-.39 1.024 0 1.414l2.988 2.988c.39.39 1.024.39 1.414 0l6.988-6.988c.39-.39.39-1.024 0-1.414s-1.024-.39-1.414 0z"
                                  fill="currentColor"
                                />
                              </svg>
                            )}
                          </div>
                          <span style={noteFormStyles.checklistItemText(item.completed)}>
                            {item.text}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveChecklistItem(item.id);
                          }}
                          style={noteFormStyles.checklistRemoveButton}
                          title="Remove item"
                        >
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 12 12"
                            style={noteFormStyles.removeIcon}
                          >
                            <path 
                              d="M6 5.293l4.146-4.147a.5.5 0 0 1 .708.708L6.707 6l4.147 4.146a.5.5 0 0 1-.708.708L6 6.707l-4.146 4.147a.5.5 0 0 1-.708-.708L5.293 6 1.146 1.854a.5.5 0 1 1 .708-.708L6 5.293z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div style={noteFormStyles.tagsSection}>
          <label style={noteFormStyles.inputLabel}>
            <span style={noteFormStyles.labelIcon}>🏷️</span>
            Tags
            <span style={noteFormStyles.tagHint}> (Press Enter to add)</span>
          </label>
          
          <div style={noteFormStyles.tagsInputWrapper}>
            <input
              type="text"
              placeholder="Add tags to categorize your note..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              style={noteFormStyles.tagInput}
            />
            <button
              onClick={handleAddTag}
              style={noteFormStyles.tagAddButton}
              disabled={!tagInput.trim()}
            >
              +
            </button>
          </div>

          {/* Tags Display */}
          {tags.length > 0 && (
            <div style={noteFormStyles.tagsDisplay}>
              {tags.map((tag, index) => (
                <div
                  key={index}
                  style={noteFormStyles.tagItem}
                >
                  <span style={noteFormStyles.tagText}>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={noteFormStyles.tagRemoveButton}
                    title="Remove tag"
                  >
                    <svg 
                      width="10" 
                      height="10" 
                      viewBox="0 0 10 10"
                      style={noteFormStyles.tagRemoveIcon}
                    >
                      <path 
                        d="M5 4.293l3.146-3.147a.5.5 0 0 1 .708.708L5.707 5l3.147 3.146a.5.5 0 0 1-.708.708L5 5.707l-3.146 3.147a.5.5 0 0 1-.708-.708L4.293 5 1.146 1.854a.5.5 0 1 1 .708-.708L5 4.293z"
                        fill="#1F2544"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={noteFormStyles.actionSection}>
          <button 
            onClick={handleCreateNote} 
            style={noteFormStyles.createButton}
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? (
              <>
                <div style={noteFormStyles.spinner}></div>
                Creating...
              </>
            ) : (
              <>
                <span style={noteFormStyles.createButtonIcon}>+</span>
                Create Note
              </>
            )}
          </button>
  
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }
      `}</style>
    </>
  );
};

export default NoteForm;
