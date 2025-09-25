import { styles } from './styles.js';

const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  onCardClick
}) => {
  const handleCardClick = (e) => {
    console.log('Card clicked!', note.title);
    if (e.target.closest('button')) return;
    if (onCardClick) onCardClick(note);
  };

  const buttonStyle = {
    width: '70px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'black',
    transition: 'all 0.2s ease',
  };

  return (
    <div 
      style={{
        ...styles.noteCard, 
        backgroundColor: note.color || '#ffffff',
        color: 'black',
        cursor: 'pointer'
      }}
      onClick={handleCardClick}
    >
      <h3 style={{ ...styles.noteTitle, color: 'black' }}>{note.title}</h3>
      <p style={{ ...styles.noteContent, color: 'black' }}>
        {note.content || (
          <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>
            No content
          </span>
        )}
      </p>
      <div style={styles.noteFooter}>
        <small style={{ ...styles.noteDate, color: 'black' }}>
          {new Date(note.created_at).toLocaleString()}
        </small>
        <div style={styles.noteActions}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            style={{
              ...buttonStyle,
              background: '#f0f9ff',
              border: '1px solid #e0f2fe',
            }}
            title="Edit note"
          >
            Edit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            style={{
              ...buttonStyle,
              background: '#fef2f2',
              border: '1px solid #fecaca',
            }}
            title="Delete note"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;