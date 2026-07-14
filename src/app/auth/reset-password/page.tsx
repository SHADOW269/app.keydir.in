'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthTerminal } from '@/components/auth/auth-terminal';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const password = form.get('password') as string;
    const supabase = createClient();

    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  return (
    <AuthLayout title={'SET NEW\nPASSWORD.'}>
      <AuthTerminal prompt="update-password --secure">
        {error && <div className="auth-msg error">{error}</div>}

        {success ? (
          <div className="auth-message-page">
            <div className="auth-msg-icon">✓</div>
            <h2>Password Updated</h2>
            <p>Your password has been changed successfully.</p>
            <div className="auth-alt-link auth-gap">
              <Link href="/auth/login">Login →</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">New Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="auth-input"
              />
            </div>

            <button type="submit" className="btn-primary auth-btn auth-btn-tight" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password →'}
            </button>
          </form>
        )}

        <div className="auth-alt-link">
          <Link href="/auth/login">← Back to Login</Link>
        </div>
      </AuthTerminal>
    </AuthLayout>
  );
}
