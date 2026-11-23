import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import SocialButton from '../components/SocialButton';
import { login } from '../services/authService';
import { setToken } from '../services/tokenStorage';

function LoginPage() {
  // useState: each line makes one value React remembers. Changing it with the
  // setter (setIdentifier...) makes React draw this page again.
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // useNavigate gives a function that changes the page from code.
  const navigate = useNavigate();
  // useLocation lets us read the "router state" Register sent us when it
  // navigated here. "?." means: if state is empty, give undefined, don't crash.
  const location = useLocation();
  const justRegistered = location.state?.registered;

  // "async" lets us use "await" inside: wait for the backend before continuing.
  async function handleSubmit(e) {
    // preventDefault stops the browser's own form submit (a page reload).
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(identifier, password);
      // Save ONLY the token (not the user, never the password).
      setToken(data.token, remember);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // err.message is the backend's { error } text, e.g. "Invalid credentials".
      setError(err.message);
    } finally {
      // finally runs after success or failure: re-enable the button.
      setLoading(false);
    }
  }

  return (
    <AuthLayout variant="login">
      <h1 className="text-center font-heading text-4xl leading-10 font-bold text-ink [@media(max-height:820px)]:text-3xl [@media(max-height:820px)]:leading-9">
        Welcome Back!
      </h1>
      <p className="mt-2 text-center text-base text-muted">
        Sign in to your CodeHaus account
      </p>

      <form
        method="post"
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-4 [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:gap-3"
      >
        {justRegistered && (
          <p
            role="status"
            className="rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success-text"
          >
            Account created. Please sign in.
          </p>
        )}

        {/* value + onChange = "controlled input": React state is the single
            source of truth, and every keystroke updates it. */}
        <AuthInput
          id="login-identifier"
          name="identifier"
          label="Email or mobile number"
          placeholder="Email or mobile number"
          icon={Mail}
          autoComplete="username"
          required
          disabled={loading}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <PasswordInput
          id="login-password"
          name="password"
          label="Password"
          placeholder="Password"
          autoComplete="current-password"
          required
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between text-sm">
          {/* Checked = token goes in localStorage; unchecked = sessionStorage */}
          <label className="flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-5 rounded-md border-line accent-primary"
            />
            Remember me
          </label>
          <a
            href="#"
            className="font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Forgot password?
          </a>
        </div>

        {/* role="alert" makes screen readers announce the message right away */}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary [@media(max-height:820px)]:h-11 text-base font-bold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 motion-safe:active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2
                aria-hidden="true"
                className="size-5 motion-safe:animate-spin"
              />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight aria-hidden="true" className="size-5" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 [@media(max-height:820px)]:my-4 flex items-center gap-4 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="flex flex-col gap-3">
        <SocialButton provider="google">Continue with Google</SocialButton>
        <SocialButton provider="github">Continue with GitHub</SocialButton>
      </div>

      <p className="mt-6 text-center text-sm text-ink [@media(max-height:820px)]:mt-4">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          Register here
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
