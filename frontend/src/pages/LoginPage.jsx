import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import SocialButton from '../components/SocialButton';

function LoginPage() {
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
        onSubmit={(e) => {
          // preventDefault stops the browser's own form submit (a page reload).
          // Real submit (POST with fetch) comes in the fetch lesson
          e.preventDefault();
        }}
        className="mt-8 flex flex-col gap-4 [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:gap-3"
      >
        <AuthInput
          id="login-identifier"
          name="identifier"
          label="Email or mobile number"
          placeholder="Email or mobile number"
          icon={Mail}
          autoComplete="username"
        />
        <PasswordInput
          id="login-password"
          name="password"
          label="Password"
          placeholder="Password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          {/* Remember me is visual only for now: it is not saved anywhere yet */}
          <label className="flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              name="remember"
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

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary [@media(max-height:820px)]:h-11 text-base font-bold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:active:scale-[0.98]"
        >
          Sign In
          <ArrowRight aria-hidden="true" className="size-5" />
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
