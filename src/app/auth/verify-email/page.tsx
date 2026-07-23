import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthTerminal } from '@/components/auth/auth-terminal';

export default function VerifyEmailPage() {
  return (
    <AuthLayout title={'VERIFY\nYOUR\nEMAIL.'}>
      <AuthTerminal>
        <div className="auth-message-page">
          <div className="auth-msg-icon">{'\uD83D\uDCE7'}</div>
          <h2>Check Your Email</h2>
          <p>
            We&apos;ve sent a verification link to your email address.
            Click the link to activate your account.
          </p>
          <p className="auth-message-sub">
            Didn&apos;t receive it? Check your spam folder or try registering again.
          </p>
        </div>

        <div className="auth-alt-link auth-gap">
          <Link href="/auth/login">{'\u2190'} Back to Login</Link>
        </div>
      </AuthTerminal>
    </AuthLayout>
  );
}
