import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthTerminal } from '@/components/auth/auth-terminal';
import { SocialButtons } from '@/components/auth/social-buttons';
import { login } from '@/lib/auth/actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthLayout title={'LOGIN\nTO\nYOUR\nACCOUNT.'}>
      <AuthTerminal prompt="login --secure">
        {params.error && (
          <div className="auth-msg error">{params.error}</div>
        )}
        {params.message && (
          <div className="auth-msg success">{params.message}</div>
        )}

        <form action={login}>
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
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          <div className="auth-checkbox">
            <input type="checkbox" id="remember" name="remember" />
            <label htmlFor="remember">Remember Me</label>
          </div>

          <div className="auth-forgot-link">
            <Link href="/auth/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-primary auth-btn">
            Login →
          </button>
        </form>

        <div className="auth-gap">
          <SocialButtons />
        </div>

        <div className="auth-alt-link">
          Don&apos;t have an account? <Link href="/auth/register">Register →</Link>
        </div>
      </AuthTerminal>
    </AuthLayout>
  );
}
