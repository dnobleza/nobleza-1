// Date formatting with Intl, which is built into JavaScript (no library).

const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});
const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
// numeric: 'auto' gives "yesterday" instead of "1 day ago".
const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// "Nov 12"
export function formatShortDate(isoText) {
  return shortDate.format(new Date(isoText));
}

// "Nov 12, 2026"
export function formatLongDate(isoText) {
  return longDate.format(new Date(isoText));
}

// "today", "2 days ago", "last week", "last month"
export function formatRelative(isoText, now = new Date()) {
  // Compare calendar days (midnight to midnight), not exact hours.
  const startOfThen = new Date(isoText).setHours(0, 0, 0, 0);
  const startOfNow = new Date(now).setHours(0, 0, 0, 0);
  const days = Math.round((startOfNow - startOfThen) / DAY_IN_MS);

  if (days < 7) return relative.format(-days, 'day');
  if (days < 30) return relative.format(-Math.floor(days / 7), 'week');
  if (days < 365) return relative.format(-Math.floor(days / 30), 'month');
  return relative.format(-Math.floor(days / 365), 'year');
}
