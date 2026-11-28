import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { getInitials } from '../../lib/names';
import { focusRing } from '../landing/focusRing';

function UserMenu({ name, badge, onLogout }) {
  const [open, setOpen] = useState(false);
  // Refs give us the real elements on the page.
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  // While the menu is open, close it on Esc or on a click outside it.
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current.focus();
      }
    }
    function handlePointerDown(event) {
      if (!wrapperRef.current.contains(event.target)) setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  // Tabbing out of the menu closes it too.
  function handleBlur(event) {
    if (
      event.relatedTarget &&
      !wrapperRef.current.contains(event.relatedTarget)
    ) {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} onBlur={handleBlur} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="user-menu"
        className={`flex min-h-11 items-center gap-2 rounded-full border border-line-cool bg-surface py-1 pr-3 pl-1 text-sm font-semibold text-ink ${focusRing}`}
      >
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-deep"
        >
          {getInitials(name)}
        </span>
        {/* Hidden visually on phones, still read by screen readers. */}
        <span className="sr-only max-w-40 truncate sm:not-sr-only">{name}</span>
        {badge && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-warning">
            {badge}
          </span>
        )}
        <ChevronDown aria-hidden="true" className="size-4" />
      </button>

      {open && (
        <div
          id="user-menu"
          className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-line-cool bg-surface p-1 shadow-md"
        >
          <button
            type="button"
            onClick={onLogout}
            className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink hover:bg-surface-alt ${focusRing}`}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
