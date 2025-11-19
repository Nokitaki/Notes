// src/NotesList.jsx
import { styles } from './styles.js';
import NoteCard from './NoteCard.jsx';
import NotesHeader from './NotesHeader.jsx';
import EmptyState from './EmptyState.jsx';

const NotesList = ({ notes, onEdit, onDelete, onCardClick }) => {
  return (
    <div style={styles.rightColumn}>
      <NotesHeader notesCount={notes.length} />
      
      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={styles.notesGrid}>
          {notes.map((note) => (
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