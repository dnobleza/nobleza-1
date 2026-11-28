import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../context/useAuth';
import AppLayout from './AppLayout';
import { clientNav } from './navConfig';

const KEY = 'codehaus_sidebar_collapsed';

// jsdom (the pretend browser) is missing matchMedia and the dialog methods,
// so we add simple stand-ins.
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

function renderLayout(nav = clientNav) {
  const auth = { user: { name: 'Maria Santos' }, logout: vi.fn() };
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AppLayout nav={nav} />}>
            <Route path="/dashboard" element={<p>Page content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  // The sidebar is drawn twice (desktop + drawer), so tests look inside one.
  return {
    sidebar: within(document.getElementById('app-sidebar')),
    drawerElement: document.getElementById('app-drawer'),
    user: userEvent.setup(),
  };
}

const toggle = (sidebar) =>
  sidebar.getByRole('button', { name: /(collapse|expand) sidebar/i });

describe('collapsible sidebar', () => {
  it('starts expanded, with the toggle pointing at the sidebar', () => {
    const { sidebar } = renderLayout();
    const button = toggle(sidebar);
    expect(button).toHaveAccessibleName('Collapse sidebar');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'app-sidebar');
  });

  it('changes aria-expanded and the label on each click', async () => {
    const { sidebar, user } = renderLayout();
    await user.click(toggle(sidebar));
    expect(toggle(sidebar)).toHaveAccessibleName('Expand sidebar');
    expect(toggle(sidebar)).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle(sidebar));
    expect(toggle(sidebar)).toHaveAccessibleName('Collapse sidebar');
    expect(toggle(sidebar)).toHaveAttribute('aria-expanded', 'true');
  });

  it('works with Enter and Space and keeps focus', async () => {
    const { sidebar, user } = renderLayout();
    const button = toggle(sidebar);
    act(() => button.focus());
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveFocus();
  });

  it('saves the choice', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const { sidebar, user } = renderLayout();
    await user.click(toggle(sidebar));
    expect(setItem).toHaveBeenLastCalledWith(KEY, '1');
    await user.click(toggle(sidebar));
    expect(setItem).toHaveBeenLastCalledWith(KEY, '0');
  });

  it('starts collapsed when that was saved', () => {
    localStorage.setItem(KEY, '1');
    const { sidebar } = renderLayout();
    expect(toggle(sidebar)).toHaveAttribute('aria-expanded', 'false');
  });

  it('still works when localStorage throws', async () => {
    for (const method of ['getItem', 'setItem']) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('storage is blocked');
      });
    }
    const { sidebar, user } = renderLayout();
    expect(toggle(sidebar)).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle(sidebar));
    expect(toggle(sidebar)).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps accessible names when collapsed', () => {
    localStorage.setItem(KEY, '1');
    const { sidebar } = renderLayout();
    const link = sidebar.getByRole('link', { name: 'Dashboard' });
    expect(link).toHaveAttribute('aria-label', 'Dashboard');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(sidebar.getByRole('link', { name: 'CodeHaus home' })).toBeVisible();
    expect(
      sidebar.getByRole('button', { name: 'Log out' }),
    ).toHaveAttribute('aria-label', 'Log out');
    expect(sidebar.queryByText('Need help?')).not.toBeInTheDocument();
    expect(sidebar.queryByText('Menu')).not.toBeInTheDocument();
  });

  it('shows a tooltip on hover and keyboard focus, and hides it on Esc', async () => {
    localStorage.setItem(KEY, '1');
    const { sidebar, user } = renderLayout();
    const link = sidebar.getByRole('link', { name: 'Dashboard' });
    const tooltip = () => sidebar.queryByTestId('sidebar-tooltip');

    await user.hover(link);
    expect(tooltip()).toHaveTextContent('Dashboard');
    await user.unhover(link);
    expect(tooltip()).not.toBeInTheDocument();

    // Tab until the link has focus, like a keyboard user.
    while (document.activeElement !== link) {
      await user.tab();
    }
    expect(tooltip()).toHaveTextContent('Dashboard');
    await user.keyboard('{Escape}');
    expect(tooltip()).not.toBeInTheDocument();
  });

  it('has no tooltip when expanded', async () => {
    const { sidebar, user } = renderLayout();
    await user.hover(sidebar.getByRole('link', { name: 'Dashboard' }));
    expect(sidebar.queryByTestId('sidebar-tooltip')).not.toBeInTheDocument();
  });

  it('names the icon-only Start a project button', () => {
    localStorage.setItem(KEY, '1');
    const { sidebar } = renderLayout({ ...clientNav, startProject: true });
    expect(
      sidebar.getByRole('link', { name: 'Start a project' }),
    ).toHaveAttribute('aria-label', 'Start a project');
  });
});

describe('mobile drawer (unchanged)', () => {
  it('opens from the hamburger and reports it', async () => {
    const { drawerElement, user } = renderLayout();
    const hamburger = screen.getByRole('button', { name: 'Open menu' });
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await user.click(hamburger);
    expect(drawerElement.showModal).toHaveBeenCalled();
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  });

  it('stays expanded, with no toggle, when the desktop rail is collapsed', async () => {
    localStorage.setItem(KEY, '1');
    const { drawerElement, user } = renderLayout();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const drawer = within(drawerElement);
    expect(drawer.getByText('Need help?')).toBeInTheDocument();
    expect(drawer.getByText('Menu')).toBeInTheDocument();
    expect(
      drawer.getByRole('link', { name: 'Dashboard' }),
    ).not.toHaveAttribute('aria-label');
    expect(
      drawer.queryByRole('button', { name: /sidebar/i }),
    ).not.toBeInTheDocument();
  });

  it('returns focus to the hamburger when closed', async () => {
    const { drawerElement, user } = renderLayout();
    const hamburger = screen.getByRole('button', { name: 'Open menu' });
    await user.click(hamburger);
    // Two things are named "Close menu" now, so look inside the drawer.
    await user.click(
      within(drawerElement).getByRole('button', { name: 'Close menu' }),
    );
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    expect(hamburger).toHaveFocus();
  });
});
