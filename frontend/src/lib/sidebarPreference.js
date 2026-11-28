// Remembers whether the desktop sidebar is collapsed.
// localStorage can throw (private windows, blocked storage), so every use is
// inside try/catch. If it fails, the sidebar is simply expanded.
const KEY = 'codehaus_sidebar_collapsed';

export function readSidebarCollapsed() {
  try {
    // Only the exact text '1' means collapsed. Empty or odd values do not.
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function saveSidebarCollapsed(collapsed) {
  try {
    // localStorage stores text only.
    localStorage.setItem(KEY, collapsed ? '1' : '0');
  } catch {
    // Not being able to remember is fine; the button still works.
  }
}
