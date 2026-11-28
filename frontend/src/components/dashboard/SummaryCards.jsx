import { Check, Inbox, Search, Zap } from 'lucide-react';
import { appCardClasses } from '../app/cardStyles';

const TONE_CLASSES = {
  blue: 'bg-primary-soft text-primary-deep',
  amber: 'bg-accent-soft text-warning',
  green: 'bg-green-100 text-success-text',
  gray: 'bg-surface-alt text-muted-strong',
};

// "icon: Icon" renames the prop to a capital letter so JSX can draw it.
function SummaryCard({ icon: Icon, tone, value, label }) {
  return (
    <li className={`${appCardClasses} flex items-center gap-4 p-5`}>
      <span
        aria-hidden="true"
        className={`flex size-12 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}
      >
        <Icon className="size-5" />
      </span>
      <p className="flex flex-col">
        <span className="font-heading text-3xl font-bold text-navy-deep">
          {value}
        </span>
        <span className="text-sm text-muted-strong">{label}</span>
      </p>
    </li>
  );
}

function SummaryCards({ summary }) {
  return (
    <ul
      aria-label="Project summary"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6"
    >
      <SummaryCard
        icon={Zap}
        tone="blue"
        value={summary.active}
        label="Active projects"
      />
      <SummaryCard
        icon={Search}
        tone="amber"
        value={summary.counts.in_review}
        label="In review"
      />
      <SummaryCard
        icon={Check}
        tone="green"
        value={summary.counts.completed}
        label="Completed"
      />
      <SummaryCard
        icon={Inbox}
        tone="gray"
        value={summary.total}
        label="Total requests"
      />
    </ul>
  );
}

export default SummaryCards;
