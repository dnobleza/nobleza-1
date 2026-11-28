import { MessageSquare } from 'lucide-react';
import { formatLongDate, formatRelative } from '../../lib/dates';
import { PROJECT_TYPE_LABELS } from '../../lib/requestStatus';
import { appCardClasses } from '../app/cardStyles';
import Stepper from '../Stepper';

// "View details" is left out until the request page exists.
function FeaturedProject({ request }) {
  // [...] copies the list first, because reverse() changes the list it runs on.
  const latest = [...request.history].reverse().find((row) => row.note);

  return (
    <section className={`${appCardClasses} p-6`}>
      <h2 className="text-lg font-bold text-navy-deep">{request.title}</h2>
      <p className="text-sm text-muted-strong">
        {PROJECT_TYPE_LABELS[request.projectType]} · Submitted{' '}
        {formatLongDate(request.createdAt)}
      </p>

      <div className="mt-6">
        <Stepper status={request.status} history={request.history} />
      </div>

      {latest && (
        <div className="mt-6 flex gap-3 rounded-xl bg-primary-tint p-4 text-sm text-primary-deep">
          <MessageSquare aria-hidden="true" className="size-5 shrink-0" />
          <div>
            <p className="font-semibold text-navy-deep">
              Latest update · {formatRelative(latest.createdAt)}
            </p>
            <p>{latest.note}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default FeaturedProject;
