import { styles } from './styles.js';

const NotesHeader = ({ notesCount }) => {
  return (
    <div style={styles.notesHeader}>
      <h2 style={styles.notesTitle}>Your Notes</h2>
      <span style={styles.notesCount}>
        {notesCount} {notesCount === 1 ? 'note' : 'notes'}
      </span>
    </div>
  );
};

export default NotesHeader; 