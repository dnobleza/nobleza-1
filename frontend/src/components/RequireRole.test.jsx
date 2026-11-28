import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthProvider from '../context/AuthProvider';
import { me } from '../services/authService';
import { clearToken, getToken } from '../services/tokenStorage';
import RequireRole from './RequireRole';

// vi.mock swaps the real files for fake functions we control, so the test
// needs no backend and no real browser storage.
vi.mock('../services/authService', () => ({ me: vi.fn() }));
vi.mock('../services/tokenStorage', () => ({
  getToken: vi.fn(),
  clearToken: vi.fn(),
}));

// A tiny copy of the app's routes, opened at the address in "path".
// MemoryRouter keeps the address in memory instead of a real address bar.
function openAt(path) {
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<p>Login page</p>} />
            <Route element={<RequireRole role="client" />}>
              <Route path="/dashboard" element={<p>Client dashboard</p>} />
            </Route>
            <Route element={<RequireRole role="admin" />}>
              <Route path="/admin" element={<p>Admin page</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}

function loggedInAs(role) {
  getToken.mockReturnValue('a-token');
  me.mockResolvedValue({ user: { name: 'Maria Santos', role } });
}

describe('RequireRole', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends a visitor with no token to the login page', async () => {
    getToken.mockReturnValue(null);
    openAt('/dashboard');
    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(me).not.toHaveBeenCalled();
  });

  it.each([
    ['client', '/dashboard', 'Client dashboard'],
    ['client', '/admin', 'Client dashboard'],
    ['admin', '/dashboard', 'Admin page'],
    ['admin', '/admin', 'Admin page'],
  ])('%s opening %s sees "%s"', async (role, path, text) => {
    loggedInAs(role);
    openAt(path);
    expect(await screen.findByText(text)).toBeInTheDocument();
    // Asked the backend once, even with redirects and StrictMode.
    expect(me).toHaveBeenCalledTimes(1);
  });

  it('forgets the token and goes to login on a 401', async () => {
    let token = 'expired-token';
    getToken.mockImplementation(() => token);
    clearToken.mockImplementation(() => {
      token = null;
    });
    me.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }));
    openAt('/dashboard');
    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(clearToken).toHaveBeenCalled();
  });

  it('shows a loading message while waiting', () => {
    getToken.mockReturnValue('a-token');
    // A promise that never finishes.
    me.mockReturnValue(new Promise(() => {}));
    openAt('/dashboard');
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(screen.queryByText('Client dashboard')).not.toBeInTheDocument();
  });

  it('shows the error and a retry button when the server fails', async () => {
    getToken.mockReturnValue('a-token');
    me.mockRejectedValue(new Error("Can't reach the server."));
    openAt('/dashboard');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Can't reach the server.",
    );
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
    expect(clearToken).not.toHaveBeenCalled();
  });
});
