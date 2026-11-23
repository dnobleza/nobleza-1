import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import { me } from '../services/authService';
import { clearToken } from '../services/tokenStorage';

// Display only. The badge color is cosmetic: it does not give any power.
// The backend decides what each role is allowed to do.
const roleBadgeClass = {
  client: 'bg-primary-soft text-primary',
  admin: 'bg-accent-soft text-warning',
};

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect runs code AFTER the page is drawn. Here: ask the backend who
  // is logged in. The [] at the end means "run once, when the page opens".
  useEffect(() => {
    // In development, React StrictMode runs effects twice and tears the first
    // one down. "ignore" stops the first run from updating state after cleanup.
    let ignore = false;

    async function loadUser() {
      try {
        const data = await me();
        if (!ignore) setUser(data.user);
      } catch (err) {
        if (ignore) return;
        if (err.status === 401) {
          // Token expired or invalid: forget it and go sign in again.
          clearToken();
          navigate('/login', { replace: true });
          return;
        }
        setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadUser();

    // The function we return is "cleanup": React runs it when the page closes
    // (or before the effect runs again).
    return () => {
      ignore = true;
    };
  }, [navigate]);

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8">
        {loading && (
          <p className="flex items-center justify-center gap-2 text-muted">
            <Loader2
              aria-hidden="true"
              className="size-5 motion-safe:animate-spin"
            />
            Loading…
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
          >
            {error}
          </p>
        )}

        {user && (
          <>
            <h1 className="font-heading text-3xl font-bold text-ink">
              Welcome, {user.name}
            </h1>

            <dl className="mt-6 flex flex-col gap-3 text-base">
              <div>
                <dt className="text-sm text-muted">Email</dt>
                <dd className="text-ink">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Mobile number</dt>
                <dd className="text-ink">{user.mobileNumber}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Role</dt>
                <dd>
                  <span
                    className={`inline-block rounded-lg px-3 py-1 text-sm font-medium ${
                      roleBadgeClass[user.role] ?? 'bg-surface-alt text-ink'
                    }`}
                  >
                    {user.role}
                  </span>
                </dd>
              </div>
            </dl>
          </>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-base font-bold text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:active:scale-[0.98]"
        >
          <LogOut aria-hidden="true" className="size-5" />
          Log out
        </button>
      </div>
    </main>
  );
}

export default DashboardPage;
