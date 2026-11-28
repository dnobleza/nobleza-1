import { formatRelative } from '../../lib/dates';
import { PROJECT_TYPE_LABELS } from '../../lib/requestStatus';
import { appCardClasses } from '../app/cardStyles';
import StatusBadge from '../StatusBadge';
import StepProgress from '../StepProgress';

// "View all" is left out until the My requests page exists.
function RequestList({ requests }) {
  return (
    <section className={`${appCardClasses} p-6`}>
      <h2 className="text-xl font-bold text-navy-deep">My requests</h2>
      {/* divide-y draws a line between rows. */}
      <ul className="mt-4 divide-y divide-line-cool border-t border-line-cool">
        {requests.map((request) => (
          // On phones the title takes a full line; progress and badge wrap.
          <li
            key={request.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4"
          >
            <div className="w-full min-w-0 sm:w-auto sm:flex-1">
              <h3 className="font-semibold text-ink">{request.title}</h3>
              <p className="text-sm text-muted-strong">
                {PROJECT_TYPE_LABELS[request.projectType]} · updated{' '}
                {formatRelative(request.updatedAt)}
              </p>
            </div>
            <div className="w-32">
              <StepProgress
                status={request.status}
                lastStep={request.lastStep}
              />
            </div>
            <div className="flex flex-1 justify-end sm:w-28 sm:flex-none">
              <StatusBadge status={request.status} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RequestList;
