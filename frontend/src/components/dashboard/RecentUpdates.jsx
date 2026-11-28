import {
  Check,
  FileText,
  MessageSquare,
  Search,
  Send,
  X,
  Zap,
} from 'lucide-react';
import { formatRelative } from '../../lib/dates';
import { appCardClasses } from '../app/cardStyles';

const BLUE = 'bg-primary-soft text-primary-deep';
const AMBER = 'bg-accent-soft text-warning';

// For each new status: the icon, its circle colour and the sentence to show.
// "text" is a small function: give it the title, get the sentence back.
const EVENTS = {
  submitted: { icon: Send, tone: BLUE, text: (t) => `You submitted ${t}` },
  in_review: { icon: Search, tone: AMBER, text: (t) => `${t} is now in review` },
  quoted: { icon: FileText, tone: AMBER, text: (t) => `${t} has a quote` },
  in_progress: { icon: Zap, tone: BLUE, text: (t) => `${t} is now in progress` },
  completed: {
    icon: Check,
    tone: 'bg-green-100 text-success-text',
    text: (t) => `${t} completed`,
  },
  cancelled: {
    icon: X,
    tone: 'bg-surface-alt text-muted-strong',
    text: (t) => `You cancelled ${t}`,
  },
  declined: {
    icon: X,
    tone: 'bg-red-50 text-danger',
    text: (t) => `${t} was declined`,
  },
};

function RecentUpdates({ updates }) {
  return (
    // The bell in the top bar links to this id.
    <section id="recent-updates" className={`${appCardClasses} p-6`}>
      <h2 className="text-xl font-bold text-navy-deep">Recent updates</h2>
      <ol className="mt-4">
        {updates.map((update, index) => {
          const event = EVENTS[update.toStatus];
          const Icon = update.note ? MessageSquare : event.icon;
          const isLast = index === updates.length - 1;

          return (
            <li key={update.id} className="relative flex gap-3 pb-5 last:pb-0">
              {/* The line joining this circle to the next one. */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute top-8 bottom-0 left-4 w-0.5 bg-line-cool"
                />
              )}
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${update.note ? BLUE : event.tone}`}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-ink">
                  {update.note
                    ? `"${update.note}"`
                    : event.text(update.requestTitle)}
                </p>
                <p className="text-xs text-muted-strong">
                  {update.note && `${update.requestTitle} · `}
                  {formatRelative(update.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default RecentUpdates;
