export const noteFormStyles = {
  // Main container
  container: {
    width: '400px',
    minWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    boxShadow: '4px 0 25px rgba(0, 0, 0, 0.08)',
    height: 'calc(100vh - 60px)',
    overflow: 'auto',
    position: 'sticky',
    top: '60px',
    left: 0,
    borderRight: '1px solid rgba(226, 232, 240, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },

  // Header
  header: {
    marginBottom: '0.5rem',
    animation: 'fadeIn 0.3s ease-out',
  },

  headerTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1b1dff',
    margin: 0,
    letterSpacing: '-0.01em',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  headerSubtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0.5rem 0 0 0',
    fontWeight: '400',
    lineHeight: '1.5',
  },

  // Mode toggle
  modeToggleWrapper: {
    animation: 'fadeIn 0.4s ease-out 0.1s both',
  },

  modeToggleLabel: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  modeToggleContainer: {
    display: 'flex',
    height: '56px',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: '12px',
    padding: '6px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },

  modeButton: (isActive) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: isActive ? '#1F2544' : 'transparent',
    color: isActive ? 'white' : '#64748b',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9375rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.15)' : 'none',
    transform: isActive ? 'scale(0.98)' : 'scale(1)',
    outline: 'none',
    ':hover': {
      backgroundColor: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
      transform: 'scale(0.97)',
    },
  }),

  modeButtonContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },

  modeButtonIcon: {
    fontSize: '1.25rem',
    opacity: 0.9,
  },

  modeButtonText: {
    fontSize: '0.8125rem',
    fontWeight: '600',
  },

  // Input sections
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    animation: 'fadeIn 0.4s ease-out 0.2s both',
  },

  inputLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  labelIcon: {
    opacity: 0.7,
  },

  // Title input
  titleInput: {
    width: '100%',
    boxSizing: 'border-box',
    color: '#1e293b',
    padding: '0.875rem 1.25rem',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '10px',
    fontSize: '0.8rem',
    backgroundColor: 'white',
    outline: 'none',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '::placeholder': {
      color: '#94a3b8',
    },
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    },
    ':hover': {
      borderColor: '#cbd5e1',
    },
  },

  // Content section
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
    animation: 'fadeIn 0.4s ease-out 0.3s both',
  },

  // Text note mode
  textNoteContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '200px',
    resize: 'vertical',
    color: '#1e293b',
    padding: '1.25rem',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '10px',
    fontSize: '0.8rem',
    backgroundColor: 'white',
    outline: 'none',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lineHeight: '1.6',
    fontWeight: '400',
    transition: 'all 0.3s ease',
    '::placeholder': {
      color: '#94a3b8',
    },
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    },
    ':hover': {
      borderColor: '#cbd5e1',
    },
  },

  textCounter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
  },

  textCounterText: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
  },

  textCounterHint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  // Checklist mode
  checklistContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
  },

  checklistInputWrapper: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },

  checklistInput: {
    flex: 1,
    padding: '0.875rem 1.25rem',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '10px',
    fontSize: '0.9375rem',
    color: '#1e293b',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.3s ease',
    '::placeholder': {
      color: '#94a3b8',
    },
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    },
    ':hover': {
      borderColor: '#cbd5e1',
    },
  },

  checklistAddButton: {
    padding: '0.875rem 1.5rem',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    ':hover:not(:disabled)': {
      backgroundColor: 'rgba(102, 126, 234, 0.15)',
      transform: 'translateY(-1px)',
    },
    ':active:not(:disabled)': {
      transform: 'translateY(0)',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },

  checklistAddIcon: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },

  checklistItemsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: '10px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },

  checklistHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
  },

  checklistCount: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#475569',
  },

  checklistProgress: {
    fontSize: '0.8125rem',
    color: '#667eea',
    fontWeight: '600',
  },

  emptyChecklist: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 1rem',
    textAlign: 'center',
  },

  emptyChecklistIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    opacity: 0.4,
  },

  emptyChecklistTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#475569',
    margin: '0 0 0.5rem 0',
  },

  emptyChecklistText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: 0,
  },

  checklistItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '300px',
    overflowY: 'auto',
  },

  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem',
    borderRadius: '8px',
    backgroundColor: 'white',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: '#cbd5e1',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transform: 'translateX(2px)',
    },
  },

  checklistItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    flex: 1,
  },

  checklistCheckbox: (completed) => ({
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: completed ? '#667eea' : 'white',
    color: completed ? 'white' : 'transparent',
    border: `2px solid ${completed ? '#667eea' : '#cbd5e1'}`,
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),

  checkIcon: {
    width: '10px',
    height: '10px',
  },

  checklistItemText: (completed) => ({
    flex: 1,
    textDecoration: completed ? 'line-through' : 'none',
    color: completed ? '#94a3b8' : '#475569',
    fontSize: '0.9375rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }),

  checklistRemoveButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    outline: 'none',
    ':hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
    },
  },

  removeIcon: {
    width: '12px',
    height: '12px',
  },

  // Tags section
  tagsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    animation: 'fadeIn 0.4s ease-out 0.4s both',
  },

  tagHint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '400',
  },

  tagsInputWrapper: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },

  tagInput: {
    flex: 1,
    padding: '0.875rem 1.25rem',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '10px',
    fontSize: '0.9375rem',
    color: '#1e293b',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.3s ease',
    '::placeholder': {
      color: '#94a3b8',
    },
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    },
    ':hover': {
      borderColor: '#cbd5e1',
    },
  },

  tagAddButton: {
    padding: '0.875rem 1.5rem',
    backgroundColor: '#1F2544',
    color: '#ffffffff',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    outline: 'none',
    ':hover:not(:disabled)': {
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      transform: 'translateY(-1px)',
    },
    ':active:not(:disabled)': {
      transform: 'translateY(0)',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },

  tagsDisplay: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },

  tagItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.875rem',
    backgroundColor: 'transparent',
    color: '#1F2544',
    borderRadius: '20px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    border: '1px solid #1F2544',
    animation: 'fadeIn 0.3s ease',
  },

  tagText: {
    opacity: 0.9,
  },

  tagRemoveButton: {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#8b5cf6',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.7,
    transition: 'all 0.2s ease',
    borderRadius: '50%',
    ':hover': {
      opacity: 1,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
    },
  },

  tagRemoveIcon: {
    width: '8px',
    height: '8px',
  },

  // Action section
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: 'auto',
    animation: 'fadeIn 0.4s ease-out 0.5s both',
  },

  createButton: {
  width: '100%',
  background: 'linear-gradient(45deg, #1A1A2E, #1F2544, #16213E)',
  color: 'white',
  border: 'none',
  padding: '1rem 1.5rem',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  outline: 'none',
  position: 'relative',
  overflow: 'hidden',
  
  // For React inline styles, you'd handle hover via state or CSS
  // Here's the CSS version:
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
    animation: 'pulse 2s infinite',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  }
},

  createButtonIcon: {
    fontSize: '1.25rem',
    fontWeight: '300',
    opacity: 0.9,
  },

  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  shortcutHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },

  shortcutKey: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid #e2e8f0',
  },

  shortcutPlus: {
    color: '#94a3b8',
    fontSize: '0.75rem',
  },

  shortcutText: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginLeft: '0.25rem',
  },
};