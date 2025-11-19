// src/EmptyState.jsx
import { styles } from './styles.js';

const EmptyState = () => {
  return (
    <div style={styles.emptyState}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
      <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
        No notes yet. Create your first note!
      </p>
    </div>
  );
};

export default EmptyState;