// src/NotesHeader.jsx
import { styles } from './styles.js';

const NotesHeader = ({ notesCount, pinnedCount, filteredCount }) => {
  const isFiltered = filteredCount !== notesCount;
  
  return (
    <div style={styles.notesHeader}>
      <h1 style={styles.notesTitle}>My Notes</h1>
      <div style={styles.notesCountContainer}>
        {isFiltered ? (
          <span style={styles.notesCount}>
            Showing {filteredCount} of {notesCount} notes
            {pinnedCount > 0 && ` • ${pinnedCount} pinned`}
          </span>
        ) : (
          <span style={styles.notesCount}>
            {notesCount} notes{pinnedCount > 0 && ` • ${pinnedCount} pinned`}
          </span>
        )}
      </div>
    </div>
  );
};

export default NotesHeader;