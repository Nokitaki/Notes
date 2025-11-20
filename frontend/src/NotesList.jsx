// src/NotesList.jsx
import { useState } from 'react';
import { styles } from './styles.js';
import NoteCard from './NoteCard.jsx';
import NotesHeader from './NotesHeader.jsx';
import EmptyState from './EmptyState.jsx';

const NotesList = ({ notes, onEdit, onDelete, onCardClick }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);

  // Get all unique tags from all notes
  const allTags = [...new Set(notes.flatMap(note => note.tags || []))].sort();

  // Get smart folder counts
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayNotes = notes.filter(note => 
    new Date(note.created_at) >= todayStart
  );

  const checklistNotes = notes.filter(note => {
    try {
      const parsed = JSON.parse(note.content);
      return parsed && parsed.type === 'checklist';
    } catch {
      return false;
    }
  });

  // Filter notes based on selection
  const getFilteredNotes = () => {
    let filtered = notes;

    if (selectedFilter === 'today') {
      filtered = todayNotes;
    } else if (selectedFilter === 'checklists') {
      filtered = checklistNotes;
    } else if (selectedFilter === 'tag' && selectedTag) {
      filtered = notes.filter(note => 
        note.tags && note.tags.includes(selectedTag)
      );
    }

    return filtered;
  };

  const filteredNotes = getFilteredNotes();

  const handleFilterClick = (filter, tag = null) => {
    setSelectedFilter(filter);
    setSelectedTag(tag);
  };

  return (
    <div style={styles.rightColumn}>
      {/* Smart Folders */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '2px solid #e2e8f0'
      }}>
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#475569',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📁 Smart Folders
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* All Notes */}
          <button
            onClick={() => handleFilterClick('all')}
            style={{
              padding: '0.6rem 0.75rem',
              backgroundColor: selectedFilter === 'all' ? '#667eea' : 'white',
              color: selectedFilter === 'all' ? 'white' : '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span>📋 All Notes</span>
            <span style={{
              padding: '0.15rem 0.5rem',
              backgroundColor: selectedFilter === 'all' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {notes.length}
            </span>
          </button>

          {/* Today's Notes */}
          <button
            onClick={() => handleFilterClick('today')}
            style={{
              padding: '0.6rem 0.75rem',
              backgroundColor: selectedFilter === 'today' ? '#667eea' : 'white',
              color: selectedFilter === 'today' ? 'white' : '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span>📅 Today</span>
            <span style={{
              padding: '0.15rem 0.5rem',
              backgroundColor: selectedFilter === 'today' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {todayNotes.length}
            </span>
          </button>

          {/* Checklists */}
          <button
            onClick={() => handleFilterClick('checklists')}
            style={{
              padding: '0.6rem 0.75rem',
              backgroundColor: selectedFilter === 'checklists' ? '#667eea' : 'white',
              color: selectedFilter === 'checklists' ? 'white' : '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span>☑️ Checklists</span>
            <span style={{
              padding: '0.15rem 0.5rem',
              backgroundColor: selectedFilter === 'checklists' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {checklistNotes.length}
            </span>
          </button>
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <>
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '0.5rem',
              }}>
                🏷️ Tags
              </h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem' 
              }}>
                {allTags.map(tag => {
                  const tagCount = notes.filter(note => 
                    note.tags && note.tags.includes(tag)
                  ).length;
                  const isActive = selectedFilter === 'tag' && selectedTag === tag;
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => handleFilterClick('tag', tag)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: isActive ? '#8b5cf6' : '#ede9fe',
                        color: isActive ? 'white' : '#7c3aed',
                        border: 'none',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {tag}
                      <span style={{
                        padding: '0.1rem 0.4rem',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(124,58,237,0.2)',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {tagCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <NotesHeader notesCount={filteredNotes.length} />
      
      {filteredNotes.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={styles.notesGrid}>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;