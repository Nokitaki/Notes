// src/NotesHeader.jsx
import { notesHeaderStyles } from './notesHeaderStyles.js';

const NotesHeader = ({ notesCount, pinnedCount, filteredCount }) => {
  const isFiltered = filteredCount !== notesCount;
  
  return (
    <div style={notesHeaderStyles.header}>
      <h1 style={notesHeaderStyles.title}>My Notes ({notesCount})</h1>
      {/*<div style={notesHeaderStyles.countContainer}>
        {isFiltered ? (
          <span style={notesHeaderStyles.count}>
            Showing {filteredCount} of {notesCount} notes
            {pinnedCount > 0 && ` • ${pinnedCount} pinned`}
          </span>
        ) : (
          <span style={notesHeaderStyles.count}>
            {notesCount} notes{pinnedCount > 0 && ` • ${pinnedCount} pinned`}
          </span>
        )}
      </div>*/}
    </div>
  );
};

export default NotesHeader;