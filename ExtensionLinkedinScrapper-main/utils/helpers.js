// Helper utility functions

export function sanitizeText(text) {
  if (!text) return '';
  return String(text);
}

export function sanitizeNumber(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

