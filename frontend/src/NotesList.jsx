import { styles } from './styles.js';
import NotesHeader from './NotesHeader.jsx';
import NoteCard from './NoteCard.jsx';
import EmptyState from './EmptyState.jsx';

const NotesList = ({ 
  notes, 
  onEdit, 
  onDelete, 
  onCardClick  // ADD THIS PROP
}) => {
  return (
    <div style={styles.rightColumn}>
      <NotesHeader notesCount={notes.length} />
      
      <div style={styles.notesGrid}>
        {notes.length === 0 ? (
          <EmptyState />
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onCardClick={onCardClick}  // ADD THIS PROP
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;