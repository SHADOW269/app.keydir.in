import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthTerminal } from '@/components/auth/auth-terminal';
import { forgotPassword } from '@/lib/auth/actions';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthLayout title={'RESET\nYOUR\nPASSWORD.'}>
      <AuthTerminal>
        {params.error && (
          <div className="auth-msg error" role="alert">{params.error}</div>
        )}
        {params.message && (
          <div className="auth-msg success" role="status">{params.message}</div>
        )}

        <p className="auth-message-sub auth-message-sub--block">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form action={forgotPassword}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="forgot-email">Email</label>
            <input
              type="email"
              name="email"
              id="forgot-email"
              required
              placeholder="you@email.com"
              className="auth-input"
              autoComplete="email"
              aria-label="Email address"
            />
          </div>

          <button type="submit" className="btn-primary auth-btn auth-btn-tight">
            Send Reset Link {'\u2192'}
          </button>
        </form>

        <div className="auth-alt-link">
          Remember your password? <Link href="/auth/login">Login {'\u2192'}</Link>
        </div>
      </AuthTerminal>
    </AuthLayout>
  );
}
