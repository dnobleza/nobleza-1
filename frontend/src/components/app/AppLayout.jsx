import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { sampleHasUnread } from '../../data/dashboardSample';
import {
  readSidebarCollapsed,
  saveSidebarCollapsed,
} from '../../lib/sidebarPreference';
import { focusRing } from '../landing/focusRing';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

// The frame around every logged-in page: sidebar, top bar, then the page.
function AppLayout({ nav }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);
  // Desktop sidebar only. We pass the function itself (no brackets), so React
  // calls it once, on the first draw, and the saved width shows immediately.
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    saveSidebarCollapsed(next);
  }

  // <dialog> is built into the browser. showModal() gives us Esc to close,
  // keeps Tab inside the drawer and blocks the page behind it.
  function openMenu() {
    drawerRef.current.showModal();
    setMenuOpen(true);
  }

  function closeMenu() {
    drawerRef.current.close();
  }

  // Runs however the drawer was closed (Esc, X, backdrop, link).
  function handleDrawerClose() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  // If the window grows to desktop size, the real sidebar appears, so close the
  // drawer. 64rem is Tailwind's "lg" breakpoint (1024px).
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)');
    function handleChange() {
      if (desktop.matches) drawerRef.current?.close();
    }
    desktop.addEventListener('change', handleChange);
    return () => desktop.removeEventListener('change', handleChange);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-surface-cool lg:flex">
      {/* Only the width animates; the page beside it follows along.
          Collapsed uses overflow-visible so tooltips can stick out. */}
      <aside
        id="app-sidebar"
        className={`sticky top-0 z-20 hidden h-screen shrink-0 self-start border-r border-line-cool bg-surface shadow-[0_12px_32px_-12px_rgb(15_23_42/0.28)] motion-safe:transition-[width] motion-safe:duration-200 lg:block ${
          collapsed
            ? 'w-[72px] overflow-visible'
            : 'w-[260px] overflow-x-hidden overflow-y-auto'
        }`}
      >
        <Sidebar
          nav={nav}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          onLogout={handleLogout}
        />
      </aside>

      {/* A click on the dark backdrop reports the dialog itself as the target. */}
      <dialog
        ref={drawerRef}
        id="app-drawer"
        aria-label="Menu"
        onClose={handleDrawerClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
        className="m-0 h-dvh max-h-none w-[260px] overflow-y-auto bg-surface backdrop:bg-ink/40 motion-safe:transition-transform motion-safe:duration-200 motion-safe:starting:open:-translate-x-full"
      >
        <button
          type="button"
          onClick={closeMenu}
          aria-label="Close menu"
          className={`absolute top-4 right-3 flex size-11 items-center justify-center rounded-full text-navy-deep hover:bg-surface-alt ${focusRing}`}
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        <div className="h-full">
          <Sidebar nav={nav} onNavigate={closeMenu} onLogout={handleLogout} />
        </div>
      </dialog>

      {/* min-w-0 lets this column shrink instead of causing sideways scroll. */}
      <div className="mx-auto w-full max-w-[1180px] min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <TopBar
          nav={nav}
          user={user}
          hasUnread={sampleHasUnread}
          menuOpen={menuOpen}
          onMenuClick={openMenu}
          menuButtonRef={menuButtonRef}
          onLogout={handleLogout}
        />
        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
