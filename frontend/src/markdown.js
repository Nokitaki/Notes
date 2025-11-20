// Minimal Markdown -> safe HTML converter for bold, headings, code blocks, and bullet lists
// Escapes HTML first to avoid XSS and implements a small subset of markdown features.
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function markdownToHtml(md = '') {
  if (!md) return '';

  // Normalize line endings
  let s = String(md).replace(/\r\n?/g, '\n');

  // Escape everything first
  s = escapeHtml(s);

  // Handle fenced code blocks ``` ```
  s = s.replace(/```([\s\S]*?)```/g, (m, code) => {
    return '<pre><code>' + escapeHtml(code) + '</code></pre>';
  });

  // Headings: ###### .. to # .. (must run before inline formatting)
  s = s.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>');
  s = s.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>');
  s = s.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
  s = s.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  s = s.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  s = s.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

  // Bold **text**
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Unordered lists: group consecutive lines starting with - or *
  s = s.replace(/(^((?:[-*]\s+.*(?:\n|$))+))/gm, (m) => {
    const items = m.trim().split(/\n/).map(line => line.replace(/^[-*]\s+/, ''));
    return '<ul>' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>';
  });

  // Convert remaining single newlines to <br/> for simple paragraphs,
  // but preserve those that are already wrapped in block tags.
  s = s.replace(/\n{2,}/g, '</p><p>');

  // Wrap in paragraph tags if not already starting with a block-level tag
  if (!s.trim().startsWith('<')) {
    s = '<p>' + s + '</p>';
  } else {
    // ensure top-level paragraphs are balanced
    s = '<div>' + s + '</div>';
  }

  // Remove empty paragraphs introduced accidentally
  s = s.replace(/<p><\/p>/g, '');

  return s;
}

export function insertAtCursor(textarea, insertText) {
  if (!textarea) return;
  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const value = textarea.value || '';
  textarea.value = value.slice(0, start) + insertText + value.slice(end);
  // move cursor inside inserted text when it contains a placeholder |
  const placeholderIndex = textarea.value.indexOf('|', start);
  if (placeholderIndex !== -1) {
    textarea.value = textarea.value.replace('|', '');
    textarea.selectionStart = textarea.selectionEnd = placeholderIndex;
  } else {
    const pos = start + insertText.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
  }
  textarea.focus();
}
