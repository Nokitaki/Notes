import { useState } from 'react';
import { styles } from './styles.js';

const NoteForm = ({ title, content, color, setTitle, setContent, setColor, onCreateNote }) => {
  const colors = [
    { name: 'White', value: '#ffffff', border: '#e2e8f0' },
    { name: 'Yellow', value: '#fef3c7', border: '#fbbf24' },
    { name: 'Pink', value: '#fce7f3', border: '#f472b6' },
    { name: 'Blue', value: '#dbeafe', border: '#60a5fa' },
    { name: 'Green', value: '#d1fae5', border: '#34d399' },
    { name: 'Purple', value: '#e9d5ff', border: '#a855f7' },
    { name: 'Orange', value: '#fed7aa', border: '#fb923c' },
    { name: 'Gray', value: '#f3f4f6', border: '#9ca3af' }
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      onCreateNote();
    }
  };

  return (
    <div style={styles.leftColumn}>
      <div style={styles.noteForm}>
        <h2 style={styles.formTitle}>Create New Note</h2>
        <input
          type="text"
          placeholder="Enter note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ ...styles.input, color: 'black' }}
          onKeyPress={handleKeyPress}
        />
        <textarea
          placeholder="Write your note content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          style={{ ...styles.textarea, color: 'black' }}
          onKeyPress={handleKeyPress}
        />
        
        {/* Color Picker */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {colors.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: colorOption.value,
                  border: color === colorOption.value ? `3px solid ${colorOption.border}` : `1px solid ${colorOption.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: color === colorOption.value ? 'scale(1.1)' : 'scale(1)',
                }}
                title={colorOption.name}
              />
            ))}
          </div>
        </div>

        <button onClick={onCreateNote} style={styles.addButton}>
           Add Note
        </button>

      </div>
    </div>
  );
};

export default NoteForm;