import { Link } from 'react-router-dom';
import { focusRing } from '../landing/focusRing';

// "Home / Dashboard". This sits on the cool-gray page, so only darker text.
function Breadcrumb({ rootLabel, rootTo, current }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-sm">
      <ol className="flex items-center gap-2">
        <li>
          <Link
            to={rootTo}
            className={`rounded text-muted-strong hover:underline ${focusRing}`}
          >
            {rootLabel}
          </Link>
        </li>
        <li aria-hidden="true" className="text-muted-strong">
          /
        </li>
        <li aria-current="page" className="truncate font-semibold text-navy-deep">
          {current}
        </li>
      </ol>
    </nav>
  );
}

export default Breadcrumb;
