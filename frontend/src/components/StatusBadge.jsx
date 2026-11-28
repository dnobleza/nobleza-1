import { STATUS_LABELS } from '../lib/requestStatus';

// Colours from dashboard-design.md section 4. Every badge has a 1px border so
// they are all the same size; only "declined" shows it (white + red border
// passes the WCAG AA contrast check, a red tint does not).
const STATUS_CLASSES = {
  submitted: 'border-transparent bg-primary-soft text-primary-deep',
  in_review: 'border-transparent bg-accent-soft text-warning',
  quoted: 'border-transparent bg-accent-soft text-accent-strong',
  in_progress: 'border-transparent bg-primary-soft text-primary-deep',
  completed: 'border-transparent bg-green-100 text-success-text',
  cancelled: 'border-transparent bg-surface-alt text-muted-strong',
  declined: 'border-danger bg-surface text-danger',
};

function StatusBadge({ status }) {
  // "??" means: if the left side is missing, use the right side instead.
  const label = STATUS_LABELS[status] ?? 'Unknown';
  const colours = STATUS_CLASSES[status] ?? STATUS_CLASSES.cancelled;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${colours}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
