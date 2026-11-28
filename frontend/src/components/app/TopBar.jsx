import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { focusRing } from '../landing/focusRing';
import Breadcrumb from './Breadcrumb';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

function TopBar({
  nav,
  user,
  hasUnread,
  menuOpen,
  onMenuClick,
  menuButtonRef,
  onLogout,
}) {
  // useLocation tells us the current address, e.g. "/dashboard".
  const { pathname } = useLocation();
  // flatMap joins the items of every section into one list.
  const page = nav.sections
    .flatMap((section) => section.items)
    .find((item) => item.to === pathname);

  return (
    <header className="flex items-center gap-3">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuClick}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="app-drawer"
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-line-cool bg-surface text-navy-deep lg:hidden ${focusRing}`}
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <Breadcrumb
        rootLabel={nav.root.label}
        rootTo={nav.root.to}
        current={page?.label}
      />

      <div className="ml-auto flex items-center gap-2">
        {nav.showBell && <NotificationBell hasUnread={hasUnread} />}
        <UserMenu name={user.name} badge={nav.badge} onLogout={onLogout} />
      </div>
    </header>
  );
}

export default TopBar;
