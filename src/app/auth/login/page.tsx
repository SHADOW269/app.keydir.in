import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthTerminal } from '@/components/auth/auth-terminal';
import { SocialButtons } from '@/components/auth/social-buttons';
import { PasswordInput } from '@/components/auth/password-input';
import { login } from '@/lib/auth/actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthLayout title={'LOGIN\nTO\nYOUR\nACCOUNT.'}>
      <AuthTerminal>
        {params.error && (
          <div className="auth-msg error" role="alert">{params.error}</div>
        )}
        {params.message && (
          <div className="auth-msg success" role="status">{params.message}</div>
        )}

        <form action={login} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email</label>
            <input
              type="email"
              name="email"
              id="login-email"
              required
              placeholder="you@email.com"
              className="auth-input"
              autoComplete="email"
              aria-label="Email address"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <PasswordInput
              name="password"
              id="login-password"
              required
              minLength={6}
              autoComplete="current-password"
              aria-label="Password"
            />
          </div>

          <div className="auth-row">
            <div className="auth-checkbox">
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember Me</label>
            </div>
            <div className="auth-forgot-link">
              <Link href="/auth/forgot-password">Forgot Password?</Link>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn auth-btn-tight">
            <span className="auth-btn-text">Login</span>
            <span className="auth-btn-arrow">{'\u2192'}</span>
          </button>
        </form>

        <div className="auth-gap">
          <SocialButtons />
        </div>

        <div className="auth-alt-link">
          Don&apos;t have an account? <Link href="/auth/register">Register {'\u2192'}</Link>
        </div>
      </AuthTerminal>
    </AuthLayout>
  );
}
