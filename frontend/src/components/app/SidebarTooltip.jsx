import { useEffect, useState } from 'react';

// Was focus moved by the keyboard? A mouse click also focuses a button, and we
// don't want the tooltip to stay stuck after a click.
function isKeyboardFocus(element) {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

// Wraps an icon-only control and shows its name beside it.
// The wrapper is always drawn, even when show is false: adding or removing it
// would make React rebuild the control inside, and keyboard focus would be lost.
function SidebarTooltip({ label, show, children }) {
  const [open, setOpen] = useState(false);
  const visible = show && open;

  // Esc closes the tooltip without moving the mouse or focus.
  useEffect(() => {
    if (!visible) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  return (
    <span
      className="relative flex flex-col"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={(event) => {
        if (isKeyboardFocus(event.target)) setOpen(true);
      }}
      onBlur={() => setOpen(false)}
    >
      {children}
      {visible && (
        // pl-3 is padding, not a gap, so the mouse can move onto the tooltip
        // without leaving the wrapper. aria-hidden: the control already has
        // this name, so screen readers should not hear it twice.
        <span
          aria-hidden="true"
          data-testid="sidebar-tooltip"
          className="absolute top-1/2 left-full z-20 -translate-y-1/2 pl-3"
        >
          <span className="block rounded-lg bg-navy-deep px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-md">
            {label}
          </span>
        </span>
      )}
    </span>
  );
}

export default SidebarTooltip;
