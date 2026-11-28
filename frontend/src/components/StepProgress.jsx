import { STEPS, getStepNumber } from '../lib/requestStatus';

// The small progress bar shown in lists.
function StepProgress({ status, lastStep }) {
  if (status === 'cancelled' || status === 'declined') {
    return (
      <p className="text-xs text-muted-strong">Stopped at step {lastStep}</p>
    );
  }

  const step = getStepNumber(status);
  const done = status === 'completed';

  return (
    <div>
      {/* The bar is decoration; the text below says the same thing. */}
      <div aria-hidden="true" className="h-2 rounded-full bg-line">
        <div
          className={`h-2 rounded-full ${done ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-strong">
        {done ? 'Done' : `Step ${step} of ${STEPS.length}`}
      </p>
    </div>
  );
}

export default StepProgress;
