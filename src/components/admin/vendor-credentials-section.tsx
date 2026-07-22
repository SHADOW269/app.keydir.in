'use client';

import { CollapsibleCard } from './collapsible-card';

interface Vendor {
  cloudflareProtected: boolean;
  useJavaScriptRendering: boolean;
}

interface Props {
  vendor: Vendor;
  pending: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function VendorCredentialsSection({ vendor, pending, onSubmit }: Props) {
  return (
    <>
      <form onSubmit={onSubmit}>
        <CollapsibleCard title="Credentials & Access" icon="█" id="vd-credentials">
          <div className="vd-form-grid">
            <div className="admin-field">
              <label className="admin-label">Cookies</label>
              <textarea name="cookies" rows={3} className="admin-input" placeholder='key=value; session=***' style={{ fontFamily: 'var(--f-m)', fontSize: '0.7rem' }} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Proxy</label>
              <input name="proxy" type="password" className="admin-input" placeholder="http://user:pass@host:port" />
            </div>
            <div className="admin-field">
              <label className="filter-option">
                <input type="checkbox" name="cloudflareProtected" defaultChecked={vendor.cloudflareProtected} />
                <span className="admin-label" style={{ margin: 0 }}>Cloudflare Protected</span>
              </label>
            </div>
            <div className="admin-field">
              <label className="admin-label">API Key</label>
              <input name="apiKey" type="password" className="admin-input" placeholder="sk-••••••••" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Rate Limit (RPM)</label>
              <input name="rateLimit" type="number" defaultValue={60} className="admin-input" />
            </div>
            <div className="admin-field">
              <label className="filter-option">
                <input type="checkbox" name="useJavaScriptRendering" defaultChecked={vendor.useJavaScriptRendering} />
                <span className="admin-label" style={{ margin: 0 }}>JavaScript Rendering</span>
              </label>
            </div>
          </div>
        </CollapsibleCard>

        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? 'SAVING...' : 'SAVE CREDENTIALS →'}
          </button>
        </div>
      </form>
      <div className="vd-security-note">
        Secrets are masked. Replace without revealing existing values.
      </div>
    </>
  );
}
