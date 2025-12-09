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

  // --- NEW STATUS LOGIC ---
  const status = note.status || 'Pending';
  
  let statusColor = '#f59e0b'; // Amber (Default Pending)
  let statusIcon = '⏳';
  let statusText = 'Pending';
  let cardOpacity = 1;
  let statusBg = '#fffbeb';

  if (status === 'Confirmed') {
    statusColor = '#10b981'; // Green
    statusIcon = '✓';
    statusText = 'Confirmed';
    statusBg = '#ecfdf5';
  } else if (status === 'Pending Update') {
    statusColor = '#3b82f6'; // Blue
    statusIcon = '🔄';
    statusText = 'Updating...';
    statusBg = '#eff6ff';
  } else if (status === 'Pending Delete') {
    statusColor = '#ef4444'; // Red
    statusIcon = '🗑️';
    statusText = 'Deleting...';
    statusBg = '#fef2f2';
    cardOpacity = 0.6; // Fade out effect
  }

  const checklistData = parseContent(note.content);

  return (
    <div 
      style={{
        ...styles.noteCard, 
        backgroundColor: note.color || '#ffffff',
        color: 'black',
        cursor: 'pointer',
        // Highlight border if pinned
        border: note.is_pinned ? '2px solid #f59e0b' : '1px solid #e2e8f0',
        position: 'relative',
        boxShadow: note.is_pinned ? '0 4px 12px rgba(245, 158, 11, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        opacity: cardOpacity, // Apply fade for deleting notes
        transition: 'opacity 0.3s ease'
      }}
      onClick={handleCardClick}
    >
      {/* STATUS BADGE */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '12px',
        backgroundColor: statusBg,
        border: `1px solid ${statusColor}`,
        fontSize: '0.75rem',
        fontWeight: '600',
        color: statusColor,
        zIndex: 5
      }}>
        <span>{statusIcon}</span>
        <span>{statusText}</span>
      </div>

      <h3 style={{ 
        ...styles.noteTitle, 
        color: 'black',
        paddingRight: '90px', // Extra space for badge
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
          // CHECKLIST PREVIEW
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
              <small style={{ color: '#64748b', marginTop: '4px', fontStyle: 'italic', display: 'block' }}>
                + {checklistData.items.length - 3} more items...
              </small>
            )}
          </div>
        ) : (
          // TEXT CONTENT
          note.content || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No content</span>
        )}
      </div>

      <div style={styles.noteFooter}>
        <small style={{ ...styles.noteDate, color: 'black' }}>
          {new Date(note.created_at).toLocaleString()}
        </small>
        
        {/* Disable actions if note is being deleted */}
        {status !== 'Pending Delete' && (
          <div style={styles.noteActions}>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(note); }}
              style={imageButtonStyle}
              title="Edit note"
            >
              <img src={editBtn} alt="Edit" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              style={imageButtonStyle}
              title="Delete note"
            >
              <img src={deleteBtn} alt="Delete" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;