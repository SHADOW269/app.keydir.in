import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthTerminal } from '@/components/auth/auth-terminal';
import { SocialButtons } from '@/components/auth/social-buttons';
import { register } from '@/lib/auth/actions';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthLayout title={'CREATE\nYOUR\nACCOUNT.'}>
      <AuthTerminal prompt="register --new-user">
        {params.error && (
          <div className="auth-msg error">{params.error}</div>
        )}

        <form action={register}>
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              type="text"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]+"
              placeholder="shadow269"
              className="auth-input"
            />
          </div>
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

          <button type="submit" className="btn-primary auth-btn auth-btn-tight">
            Create Account →
          </button>
        </form>

        <div className="auth-gap">
          <SocialButtons />
        </div>

        <div className="auth-alt-link">
          Already have an account? <Link href="/auth/login">Login →</Link>
        </div>
      </AuthTerminal>
    </AuthLayout>
  );
}
