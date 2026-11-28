import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  readSidebarCollapsed,
  saveSidebarCollapsed,
} from './sidebarPreference';

// spyOn swaps a real method for a watched one; restoreAllMocks puts it back.
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

function breakStorage(method) {
  vi.spyOn(Storage.prototype, method).mockImplementation(() => {
    throw new Error('storage is blocked');
  });
}

describe('sidebarPreference', () => {
  it('is expanded when nothing is saved', () => {
    expect(readSidebarCollapsed()).toBe(false);
  });

  it('reads back a saved choice', () => {
    saveSidebarCollapsed(true);
    expect(readSidebarCollapsed()).toBe(true);
    saveSidebarCollapsed(false);
    expect(readSidebarCollapsed()).toBe(false);
  });

  it('is expanded for an unexpected saved value', () => {
    localStorage.setItem('codehaus_sidebar_collapsed', 'banana');
    expect(readSidebarCollapsed()).toBe(false);
  });

  it('is expanded when reading throws', () => {
    breakStorage('getItem');
    expect(readSidebarCollapsed()).toBe(false);
  });

  it('does not crash when saving throws', () => {
    breakStorage('setItem');
    expect(() => saveSidebarCollapsed(true)).not.toThrow();
  });
});
