'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { linkProviderAction, unlinkProvider } from '@/lib/auth/actions';

interface AccountMethod {
  id: string;
  name: string;
  connected: boolean;
  email?: string;
}

interface ConnectedAccountsProps {
  methods: AccountMethod[];
  error?: string;
  message?: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  email: '✉',
  google: '/logos/google-logo.png',
  discord: '/logos/discord-logo.png',
};

const PROVIDER_LABELS: Record<string, string> = {
  email: 'Email & Password',
  google: 'Google',
  discord: 'Discord',
};

export function ConnectedAccounts({ methods, error, message }: ConnectedAccountsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const connectedCount = methods.filter((m) => m.connected).length;

  function handleUnlink(provider: string) {
    if (!confirm(`Disconnect ${PROVIDER_LABELS[provider] || provider}?`)) return;
    startTransition(async () => {
      await unlinkProvider(provider);
      router.refresh();
    });
  }

  function handleLink(provider: string) {
    startTransition(async () => {
      await linkProviderAction(provider);
      router.refresh();
    });
  }

  return (
    <div className="ca-terminal terminal auth-visible">
      <div className="t-bar">
        <div className="t-dot" />
        <div className="t-dot" />
        <div className="t-dot" />
        <span className="auth-term-title">auth.keydir.sh</span>
      </div>

      <div className="t-line">
        <span className="t-prompt">$</span>
        <span>settings --connected-accounts</span>
      </div>

      <div className="ca-section">
        {error && <div className="auth-msg error">{error}</div>}
        {message && <div className="auth-msg success">{message}</div>}

        <div className="ca-header">
          <span className="ca-header-label">Connected Accounts</span>
          <span className="ca-header-count">{connectedCount}/{methods.length}</span>
        </div>

        <div className="ca-list">
          {methods.map((method) => (
            <div key={method.id} className="ca-row">
              <div className="ca-row-left">
                <div className="ca-icon">
                  {PROVIDER_ICONS[method.id]?.startsWith('/') ? (
                    <Image
                      src={PROVIDER_ICONS[method.id]}
                      alt=""
                      width={18}
                      height={18}
                      unoptimized
                    />
                  ) : (
                    <span className="ca-icon-emoji">{PROVIDER_ICONS[method.id] || '?'}</span>
                  )}
                </div>
                <div className="ca-info">
                  <span className="ca-name">{PROVIDER_LABELS[method.id] || method.id}</span>
                  {method.connected && method.email && (
                    <span className="ca-email">{method.email}</span>
                  )}
                </div>
              </div>

              <div className="ca-row-right">
                <span className={`ca-status ${method.connected ? 'ca-status--connected' : 'ca-status--disconnected'}`}>
                  {method.connected ? '● Connected' : '○ Not Connected'}
                </span>

                {method.id === 'email' ? null : method.connected ? (
                  <form action={() => handleUnlink(method.id)}>
                    <button
                      type="submit"
                      className="btn-danger ca-btn"
                      disabled={isPending || connectedCount <= 1}
                      title={connectedCount <= 1 ? 'Cannot disconnect your last authentication method' : undefined}
                    >
                      Disconnect
                    </button>
                  </form>
                ) : (
                  <form action={() => handleLink(method.id)}>
                    <button type="submit" className="btn-secondary ca-btn">
                      Connect
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
