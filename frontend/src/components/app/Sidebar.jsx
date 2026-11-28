import {
  ArrowRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import logoMark from '../../assets/logo/logo-mark.svg';
import logo from '../../assets/logo/logo.svg';
import { focusRing } from '../landing/focusRing';
import SidebarTooltip from './SidebarTooltip';

const ITEM_CLASSES = `flex min-h-11 items-center gap-3 overflow-hidden rounded-xl whitespace-nowrap transition-colors duration-150 ${focusRing}`;

// "before:" draws the 4px blue bar on the sidebar's left edge, so its position
// must match the sidebar's side padding. The bar sits outside the item, so the
// active item must not use overflow-hidden.
function itemClasses(isActive, collapsed) {
  const layout = collapsed ? 'justify-center' : 'px-3';
  const bar = collapsed ? 'before:-left-3.5' : 'before:-left-4';
  const base = `${ITEM_CLASSES} ${layout}`;

  return isActive
    ? `${base.replace('overflow-hidden ', '')} relative bg-primary-soft font-semibold text-primary-deep before:absolute before:inset-y-2 before:w-1 before:rounded-r before:bg-primary ${bar}`
    : `${base} font-medium text-muted-strong hover:bg-surface-alt`;
}

// collapsed + onToggleCollapsed are only given to the desktop sidebar. The
// mobile drawer leaves them out, so it is always expanded and has no toggle.
// onNavigate is optional: the drawer uses it to close itself.
function Sidebar({
  nav,
  collapsed = false,
  onToggleCollapsed,
  onNavigate,
  onLogout,
}) {
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  // An aria-label is only needed when there is no visible text.
  const iconName = (label) => (collapsed ? label : undefined);
  // sr-only hides text from the eye but keeps it for screen readers.
  const textClass = collapsed ? 'sr-only' : undefined;

  // The desktop sidebar keeps its full width while the rail grows back, so the
  // text does not wrap during the animation.
  const width = !collapsed && onToggleCollapsed ? 'min-w-[259px]' : '';

  return (
    <div
      className={`flex min-h-full flex-col gap-4 py-4 ${collapsed ? 'px-3.5' : 'px-4'} ${width}`}
    >
      {/* 72px is too narrow for logo and toggle side by side, so they stack. */}
      <div
        className={`flex items-center gap-2 ${collapsed ? 'flex-col' : 'justify-between'}`}
      >
        <SidebarTooltip label="CodeHaus home" show={collapsed}>
          <Link
            to="/"
            onClick={onNavigate}
            aria-label={iconName('CodeHaus home')}
            className={`rounded-lg ${focusRing}`}
          >
            <img
              src={collapsed ? logoMark : logo}
              alt="CodeHaus home"
              className={collapsed ? 'size-10' : 'h-12 w-auto'}
            />
          </Link>
        </SidebarTooltip>

        {onToggleCollapsed && (
          <SidebarTooltip label={toggleLabel} show={collapsed}>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              aria-controls="app-sidebar"
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-strong transition-colors duration-150 hover:bg-surface-alt ${focusRing}`}
            >
              <ToggleIcon aria-hidden="true" className="size-5" />
            </button>
          </SidebarTooltip>
        )}
      </div>

      {nav.startProject && (
        <SidebarTooltip label="Start a project" show={collapsed}>
          <Link
            to="/start"
            onClick={onNavigate}
            aria-label={iconName('Start a project')}
            className={`flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-accent-strong font-bold whitespace-nowrap text-white transition-colors duration-150 hover:bg-accent-strong-hover ${focusRing}`}
          >
            <Plus aria-hidden="true" className="size-5 shrink-0" />
            <span className={textClass}>Start a project</span>
          </Link>
        </SidebarTooltip>
      )}

      <nav aria-label="Main" className="flex flex-col gap-4">
        {nav.sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-muted-strong uppercase">
                {section.label}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                // JSX needs a capital letter to treat a variable as a component.
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <SidebarTooltip label={item.label} show={collapsed}>
                      {/* "end" = active only on this exact address. NavLink
                          also sets aria-current="page" by itself. */}
                      <NavLink
                        to={item.to}
                        end
                        onClick={onNavigate}
                        aria-label={iconName(item.label)}
                        className={({ isActive }) =>
                          itemClasses(isActive, collapsed)
                        }
                      >
                        <Icon aria-hidden="true" className="size-5 shrink-0" />
                        <span className={textClass}>{item.label}</span>
                      </NavLink>
                    </SidebarTooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* mt-auto pushes everything from here to the bottom. */}
      <div className="mt-auto flex flex-col gap-3">
        {nav.showHelp && !collapsed && (
          <div className="rounded-2xl bg-primary-tint p-4 text-sm text-primary-deep">
            <p className="font-bold text-navy-deep">Need help?</p>
            <p className="mt-1">
              Questions about your project? Send us a message anytime.
            </p>
            <a
              href="mailto:codehausdevelopment@gmail.com"
              className={`mt-2 inline-flex items-center gap-1 rounded font-semibold hover:underline ${focusRing}`}
            >
              Email us
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        )}
        <SidebarTooltip label="Log out" show={collapsed}>
          <button
            type="button"
            onClick={onLogout}
            aria-label={iconName('Log out')}
            className={itemClasses(false, collapsed)}
          >
            <LogOut aria-hidden="true" className="size-5 shrink-0" />
            <span className={textClass}>Log out</span>
          </button>
        </SidebarTooltip>
      </div>
    </div>
  );
}

export default Sidebar;
