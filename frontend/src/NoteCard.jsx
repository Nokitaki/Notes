// src/NoteCard.jsx
import { styles } from './styles.js';
import { markdownToHtml } from './markdown.js';

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
  onCardClick
}) => {
  const handleCardClick = (e) => {
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

  // Parse content to see if it's a checklist
  const checklistData = parseContent(note.content);

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
      
      <div style={{ ...styles.noteContent, color: 'black' }}>
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