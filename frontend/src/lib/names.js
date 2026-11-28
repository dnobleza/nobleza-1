// Splits a full name into words. " Maria   Santos " -> ['Maria', 'Santos'].
// trim() removes outer spaces, split(/\s+/) cuts at any run of spaces, and
// filter(Boolean) throws away empty pieces.
function getWords(name = '') {
  return name.trim().split(/\s+/).filter(Boolean);
}

export function getFirstName(name) {
  return getWords(name)[0] ?? '';
}

// First letter of the first and last word: "Maria Santos" -> "MS".
export function getInitials(name) {
  const words = getWords(name);
  if (words.length === 0) return '';

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}
