// src/NotesList.jsx
import { useState, useMemo } from 'react';
import { styles } from './styles.js';
import NoteCard from './NoteCard.jsx';
import NotesHeader from './NotesHeader.jsx';
import EmptyState from './EmptyState.jsx';

const NotesList = ({ notes, onEdit, onDelete, onCardClick, onTogglePin }) => {
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title'

  // Sort notes based on sort option
  const sortedNotes = useMemo(() => {
    let sorted = [...notes];

    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return sorted;
  }, [notes, sortBy]);

  // Separate pinned and unpinned notes from sorted results
  const pinnedNotes = sortedNotes.filter(note => note.is_pinned);
  const unpinnedNotes = sortedNotes.filter(note => !note.is_pinned);

  // Determine if we should show section headers
  const hasPinnedNotes = pinnedNotes.length > 0;
  const hasUnpinnedNotes = unpinnedNotes.length > 0;
  const hasNotes = sortedNotes.length > 0;

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  return (
    <div style={styles.rightColumn}>
      <NotesHeader 
        notesCount={notes.length} 
        pinnedCount={notes.filter(note => note.is_pinned).length} 
        filteredCount={sortedNotes.length}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
      
      {!hasNotes ? (
        <EmptyState />
      ) : (
        <div style={styles.notesContainer}>
          {/* Pinned Notes Section */}
          {hasPinnedNotes && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📌</span>
                <h3 style={styles.sectionTitle}>Pinned Notes</h3>
                <span style={styles.sectionCount}>({pinnedNotes.length})</span>
              </div>
              <div style={styles.notesGrid}>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCardClick={onCardClick}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unpinned Notes - Only show header if there are pinned notes */}
          {hasUnpinnedNotes && (
            <div style={styles.section}>
              {hasPinnedNotes && (
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>📝</span>
                  <h3 style={styles.sectionTitle}>Other Notes</h3>
                  <span style={styles.sectionCount}>({unpinnedNotes.length})</span>
                </div>
              )}
              <div style={styles.notesGrid}>
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCardClick={onCardClick}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesList;