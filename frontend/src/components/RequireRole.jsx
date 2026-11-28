import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { homePathFor } from '../lib/homePath';
import { getToken } from '../services/tokenStorage';

// Guards a group of routes: only the given role gets through.
// IMPORTANT: this is only for user experience. Anyone can change JavaScript in
// their own browser. The REAL security is the backend checking every request.
function RequireRole({ role }) {
  const auth = useAuth();
  const { loadUser } = auth;
  const token = getToken();

  useEffect(() => {
    if (token) loadUser();
  }, [token, loadUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // We have a token but no answer for it yet.
  if (auth.token !== token) {
    return (
      <p
        role="status"
        className="flex min-h-screen items-center justify-center gap-2 bg-surface-cool text-muted-strong"
      >
        <Loader2
          aria-hidden="true"
          className="size-5 motion-safe:animate-spin"
        />
        Loading…
      </p>
    );
  }

  if (auth.error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-cool px-4">
        <p
          role="alert"
          className="rounded-lg border border-danger bg-surface px-4 py-3 text-sm font-medium text-danger"
        >
          {auth.error}
        </p>
        <button
          type="button"
          onClick={auth.retry}
          className="h-12 rounded-full bg-primary px-6 font-bold text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Try again
        </button>
      </main>
    );
  }

  if (auth.user.role !== role) {
    return <Navigate to={homePathFor(auth.user.role)} replace />;
  }

  // Outlet = "draw the matching child route here".
  return <Outlet />;
}

export default RequireRole;
