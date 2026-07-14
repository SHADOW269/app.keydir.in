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
      <AuthTerminal prompt="reset-password --email">
        {params.error && (
          <div className="auth-msg error">{params.error}</div>
        )}
        {params.message && (
          <div className="auth-msg success">{params.message}</div>
        )}

        <p className="auth-message-sub auth-message-sub--block">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form action={forgotPassword}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@email.com"
              className="auth-input"
            />
          </div>

          <button type="submit" className="btn-primary auth-btn auth-btn-tight">
            Send Reset Link →
          </button>
        </form>

        <div className="auth-alt-link">
          Remember your password? <Link href="/auth/login">Login →</Link>
        </div>
      </AuthTerminal>
    </AuthLayout>
  );
}
