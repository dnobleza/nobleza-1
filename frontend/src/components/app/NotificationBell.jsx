import { Bell } from 'lucide-react';
import { focusRing } from '../landing/focusRing';

// Jumps to "Recent updates" on the dashboard. A plain <a> is used because the
// browser scrolls to "#..." by itself.
function NotificationBell({ hasUnread }) {
  return (
    <a
      href="/dashboard#recent-updates"
      aria-label="Notifications"
      aria-describedby={hasUnread ? 'unread-note' : undefined}
      className={`relative flex size-11 shrink-0 items-center justify-center rounded-full text-navy-deep transition-colors duration-150 hover:bg-surface ${focusRing}`}
    >
      <Bell aria-hidden="true" className="size-5" />
      {hasUnread && (
        <>
          <span
            aria-hidden="true"
            className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent"
          />
          {/* Read by screen readers, so the dot is not the only signal. */}
          <span id="unread-note" className="sr-only">
            You have unread updates
          </span>
        </>
      )}
    </a>
  );
}

export default NotificationBell;
