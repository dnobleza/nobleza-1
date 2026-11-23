import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import SocialButton from '../components/SocialButton';

const linkClass =
  'font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none';

function RegisterPage() {
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
        onSubmit={(e) => {
          // preventDefault stops the browser's own form submit (a page reload).
          // Real submit (POST with fetch) comes in the fetch lesson
          e.preventDefault();
        }}
        className="mt-8 flex flex-col gap-4 [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:gap-3"
      >
        <AuthInput
          id="register-name"
          name="name"
          label="Full name"
          placeholder="Full Name"
          icon={User}
          autoComplete="name"
        />
        <AuthInput
          id="register-email"
          name="email"
          label="Email address"
          placeholder="Email Address"
          type="email"
          icon={Mail}
          autoComplete="email"
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
        />
        <PasswordInput
          id="register-password"
          name="password"
          label="Password"
          placeholder="Password"
          autoComplete="new-password"
        />
        <PasswordInput
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Confirm Password"
          autoComplete="new-password"
        />

        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="terms"
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

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-strong [@media(max-height:820px)]:h-11 text-base font-bold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-accent-strong-hover focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:active:scale-[0.98]"
        >
          Register Account
          <ArrowRight aria-hidden="true" className="size-5" />
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
