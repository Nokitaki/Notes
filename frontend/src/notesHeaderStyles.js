export const notesHeaderStyles = {
  // Main header container
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'transparent',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
  },

  // Title with gradient text effect
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    letterSpacing: '-0.5px',
  },

  // Notes count badge
  count: {
    color: '#2c2c2e',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
  },

  // Container for count display (for alignment)
  countContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
};