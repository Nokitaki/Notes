// src/NoteCard.jsx
import { styles } from './styles.js';
import editBtn from './assets/editbtn.png';
import deleteBtn from './assets/deletebtn.png';

// Helper to check if content is a checklist
const parseContent = (content) => {
  try {
    const parsed = JSON.parse(content);
    if (parsed && parsed.type === 'checklist' && Array.isArray(parsed.items)) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null; // It's just normal text
  }
};

const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  onCardClick,
  onTogglePin 
}) => {
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    if (onCardClick) onCardClick(note);
  };

  const imageButtonStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: '4px',
    transition: 'all 0.2s ease',
  };

  // Parse content to see if it's a checklist
  const checklistData = parseContent(note.content);

  return (
    <div 
      style={{
        ...styles.noteCard, 
        backgroundColor: note.color || '#ffffff',
        color: 'black',
        cursor: 'pointer',
        border: note.is_pinned ? '2px solid #f59e0b' : '1px solid #e2e8f0',
        position: 'relative',
        boxShadow: note.is_pinned ? '0 4px 12px rgba(245, 158, 11, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      onClick={handleCardClick}
    >
      {/* Pin button in upper right corner */}
      <button 
        onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1rem',
          background: note.is_pinned ? '#fffbeb' : '#f8fafc',
          color: note.is_pinned ? '#d97706' : '#64748b',
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        title={note.is_pinned ? "Unpin note" : "Pin note"}
      >
        {note.is_pinned ? '📌' : '📍'}
      </button>

      <h3 style={{ 
        ...styles.noteTitle, 
        color: 'black',
        paddingRight: '40px', // Make space for the pin button
        marginTop: '4px',
        minHeight: '32px'
      }}>
        {note.title}
      </h3>
      
      <div style={{ 
        ...styles.noteContent, 
        color: 'black',
        marginTop: '8px'
      }}>
        {checklistData ? (
          // 📋 CHECKLIST PREVIEW MODE
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {checklistData.items.slice(0, 3).map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '1.1rem', cursor: 'default', opacity: 0.8 }}>
                  {item.completed ? '☑️' : '⬜'}
                </span>
                 <span style={{ 
                   textDecoration: item.completed ? 'line-through' : 'none',
                   color: item.completed ? '#94a3b8' : '#334155',
                   fontSize: '0.9rem',
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   whiteSpace: 'nowrap'
                 }}>
                   {item.text}
                 </span>
              </div>
            ))}
            
            {checklistData.items.length > 3 && (
              <small style={{ 
                color: '#64748b', 
                marginTop: '4px', 
                fontStyle: 'italic',
                display: 'block' 
              }}>
                + {checklistData.items.length - 3} more items...
              </small>
            )}
          </div>
        ) : (
          // 📝 TEXT MODE (Default) - render markdown subset
          (note.content && note.content.trim()) ? (
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(note.content) }} />
          ) : (
            <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No content</span>
          )
        )}
      </div>

      <div style={styles.noteFooter}>
        <small style={{ ...styles.noteDate, color: 'black' }}>
          {new Date(note.created_at).toLocaleString()}
        </small>
        <div style={styles.noteActions}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            style={imageButtonStyle}
            title="Edit note"
          >
            <img 
              src={editBtn} 
              alt="Edit" 
              style={{ 
                width: '40px', 
                height: '40px', 
                objectFit: 'contain' 
              }} 
            />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            style={imageButtonStyle}
            title="Delete note"
          >
            <img 
              src={deleteBtn} 
              alt="Delete" 
              style={{ 
                width: '40px', 
                height: '40px',  
                objectFit: 'contain' 
              }} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;