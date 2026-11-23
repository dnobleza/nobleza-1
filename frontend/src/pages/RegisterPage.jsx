import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail, Phone, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import SocialButton from '../components/SocialButton';
import { register } from '../services/authService';

const linkClass =
  'font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none';

// Small helper: the red text under a field. "id" is what aria-describedby
// points to, so screen readers read the message together with the field.
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {message}
    </p>
  );
}

function RegisterPage() {
  // One piece of state per field (controlled inputs).
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);

  // fieldErrors is an object like { password: '...', terms: '...' }.
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Quick checks in the browser so the user gets instant feedback.
  // The backend checks again: never trust only the browser.
  function validate() {
    const errors = {};
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!terms) {
      errors.terms = 'You must agree to the Terms of Service and Privacy Policy.';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errors = validate();
    setFieldErrors(errors);
    // Object.keys gives the list of field names that have an error.
    // If there is at least one, stop here and don't call the backend.
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      // Only the 5 fields the backend wants. No role, no terms.
      await register({
        name,
        email,
        mobileNumber,
        password,
        confirmPassword,
      });
      // Send the user to /login and pass a flag in "router state"
      // so Login can show "Account created".
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      // 400 / 409: show the backend's message, e.g. "Email already registered".
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout variant="register">
      <h1 className="text-center font-heading text-4xl leading-10 font-bold text-ink [@media(max-height:820px)]:text-3xl [@media(max-height:820px)]:leading-9">
        Create Your Account
      </h1>
      <p className="mt-2 text-center text-base text-muted">
        Get started with CodeHaus today
      </p>

      <form
        method="post"
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 flex flex-col gap-4 [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:gap-3"
      >
        <AuthInput
          id="register-name"
          name="name"
          label="Full name"
          placeholder="Full Name"
          icon={User}
          autoComplete="name"
          required
          disabled={loading}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AuthInput
          id="register-email"
          name="email"
          label="Email address"
          placeholder="Email Address"
          type="email"
          icon={Mail}
          autoComplete="email"
          required
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          id="register-mobile"
          name="mobileNumber"
          label="Mobile number"
          placeholder="Mobile Number (09XXXXXXXXX)"
          type="tel"
          inputMode="tel"
          icon={Phone}
          autoComplete="tel"
          required
          disabled={loading}
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
        />
        <div>
          <PasswordInput
            id="register-password"
            name="password"
            label="Password"
            placeholder="Password"
            autoComplete="new-password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={Boolean(fieldErrors.password)}
            describedBy={fieldErrors.password ? 'register-password-error' : undefined}
          />
          <FieldError
            id="register-password-error"
            message={fieldErrors.password}
          />
        </div>
        <div>
          <PasswordInput
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirm password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            required
            disabled={loading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            invalid={Boolean(fieldErrors.confirmPassword)}
            describedBy={
              fieldErrors.confirmPassword
                ? 'register-confirm-password-error'
                : undefined
            }
          />
          <FieldError
            id="register-confirm-password-error"
            message={fieldErrors.confirmPassword}
          />
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              disabled={loading}
              aria-invalid={fieldErrors.terms ? 'true' : undefined}
              aria-describedby={fieldErrors.terms ? 'register-terms-error' : undefined}
              className="mt-0.5 size-5 shrink-0 rounded-md border-line accent-primary"
            />
            <span>
              I agree to the{' '}
              <a href="#" className={linkClass}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className={linkClass}>
                Privacy Policy
              </a>
            </span>
          </label>
          <FieldError id="register-terms-error" message={fieldErrors.terms} />
        </div>

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
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-strong [@media(max-height:820px)]:h-11 text-base font-bold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-accent-strong-hover focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 motion-safe:active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2
                aria-hidden="true"
                className="size-5 motion-safe:animate-spin"
              />
              Creating account…
            </>
          ) : (
            <>
              Register Account
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

      <SocialButton provider="google">Continue with Google</SocialButton>

      <p className="mt-6 text-center text-sm text-ink [@media(max-height:820px)]:mt-4">
        Already have an account?{' '}
        <Link to="/login" className={linkClass}>
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;
