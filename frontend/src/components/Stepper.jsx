import { Check } from 'lucide-react';
import { formatShortDate } from '../lib/dates';
import { STATUS_LABELS, STEPS, getStepNumber } from '../lib/requestStatus';

const CIRCLE_CLASSES = {
  done: 'border-primary bg-primary text-white',
  current: 'border-primary bg-surface text-primary ring-4 ring-primary-soft',
  todo: 'border-line bg-surface text-muted-strong',
};

const LABEL_CLASSES = {
  done: 'font-semibold text-ink',
  current: 'font-semibold text-primary',
  todo: 'font-medium text-muted-strong',
};

// Words for screen readers, because colour and icons alone are not enough.
const STATE_TEXT = {
  done: '(done)',
  current: '(current step)',
  todo: '(to do)',
};

function Stepper({ status, history = [] }) {
  const stopped = status === 'cancelled' || status === 'declined';

  // How far did the request get? A stopped request has no step of its own, so
  // look through its history for the highest step it reached.
  const reached = stopped
    ? Math.max(0, ...history.map((row) => getStepNumber(row.toStatus)))
    : getStepNumber(status);

  return (
    <div>
      {/* Vertical on small screens, horizontal from md (768px) up. */}
      <ol
        aria-label="Project progress"
        className="isolate flex flex-col gap-6 md:flex-row md:gap-0"
      >
        {STEPS.map((step, index) => {
          const number = index + 1;
          // The step the request is on right now (never for a stopped one).
          const isCurrent = !stopped && number === reached;

          let state = 'todo';
          if (number < reached) state = 'done';
          if (number === reached) {
            // A stopped or completed request has nothing in progress.
            state = stopped || status === 'completed' ? 'done' : 'current';
          }

          const row = history.find((item) => item.toStatus === step);
          let dateText = '—';
          if (row && state !== 'todo') {
            dateText = formatShortDate(row.createdAt);
            if (state === 'current') dateText = `Since ${dateText}`;
          }

          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex items-center gap-3 md:flex-1 md:flex-col md:gap-2 md:text-center"
            >
              {/* Connector line from the previous circle to this one. */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-full left-4 h-6 w-1 md:top-4 md:right-1/2 md:bottom-auto md:left-auto md:h-1 md:w-full ${
                    number <= reached ? 'bg-primary' : 'bg-line'
                  }`}
                />
              )}
              {/* "relative z-10" keeps every circle painted above the lines. */}
              <span
                aria-hidden="true"
                className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-3 text-sm font-bold ${CIRCLE_CLASSES[state]}`}
              >
                {state === 'done' ? <Check className="size-4" /> : number}
              </span>
              <span className="flex flex-col">
                <span className={`text-sm ${LABEL_CLASSES[state]}`}>
                  {STATUS_LABELS[step]}
                  <span className="sr-only"> {STATE_TEXT[state]}</span>
                </span>
                <span className="text-xs text-muted-strong">{dateText}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {stopped && (
        <p
          className={`mt-4 text-sm font-semibold ${
            status === 'declined' ? 'text-danger' : 'text-muted-strong'
          }`}
        >
          {STATUS_LABELS[status]}
        </p>
      )}
    </div>
  );
}

export default Stepper;
