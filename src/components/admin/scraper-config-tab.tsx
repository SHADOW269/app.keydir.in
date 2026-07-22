'use client';

import { CollapsibleCard } from './collapsible-card';

interface Vendor {
  scraperEnabled: boolean;
  scraperEngine: string;
  customScraper: string | null;
  scraperVersion: number;
  useJavaScriptRendering: boolean;
  cloudflareProtected: boolean;
  scraperNotes: string | null;
  customHeaders: string | null;
}

interface Props {
  vendor: Vendor;
  pending: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ScraperConfigTab({ vendor, pending, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit}>
      <CollapsibleCard title="Engine" icon="▲" id="vd-engine">
        <div className="admin-field">
          <label className="filter-option">
            <input type="checkbox" name="scraperEnabled" defaultChecked={vendor.scraperEnabled} />
            <span className="admin-label" style={{ margin: 0 }}>Enable Scraper</span>
          </label>
        </div>
        <div className="vd-form-grid">
          <div className="admin-field">
            <label className="admin-label">Engine</label>
            <select name="scraperEngine" defaultValue={vendor.scraperEngine || 'cheerio'} className="admin-input">
              <option value="cheerio">Cheerio (fast, no JS)</option>
              <option value="playwright">Playwright (JS rendering)</option>
              <option value="puppeteer">Puppeteer</option>
              <option value="api">API</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label">Custom Scraper</label>
            <input name="customScraper" defaultValue={vendor.customScraper ?? ''} className="admin-input" placeholder="e.g. meckeys" />
          </div>
        </div>
        <div className="vd-form-grid">
          <div className="admin-field">
            <label className="admin-label">Version</label>
            <input className="admin-input" value={`v${vendor.scraperVersion}`} readOnly style={{ opacity: 0.6 }} />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Execution" icon="◷" id="vd-execution" defaultOpen={false}>
        <div className="vd-form-grid">
          <div className="admin-field">
            <label className="admin-label">Timeout (ms)</label>
            <input name="timeout" type="number" defaultValue={30000} className="admin-input" />
          </div>
          <div className="admin-field">
            <label className="admin-label">Retry Attempts</label>
            <input name="retryAttempts" type="number" defaultValue={3} className="admin-input" />
          </div>
          <div className="admin-field">
            <label className="admin-label">Delay (ms)</label>
            <input name="delay" type="number" defaultValue={1000} className="admin-input" />
          </div>
          <div className="admin-field">
            <label className="admin-label">Random Delay (ms)</label>
            <input name="randomDelay" type="number" defaultValue={500} className="admin-input" />
          </div>
          <div className="admin-field">
            <label className="admin-label">Concurrency</label>
            <input name="concurrency" type="number" defaultValue={1} className="admin-input" />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Behaviour" icon="◇" id="vd-behaviour">
        <div className="vd-form-grid">
          <div className="admin-field">
            <label className="filter-option">
              <input type="checkbox" name="useJavaScriptRendering" defaultChecked={vendor.useJavaScriptRendering} />
              <span className="admin-label" style={{ margin: 0 }}>JavaScript Rendering</span>
            </label>
          </div>
          <div className="admin-field">
            <label className="filter-option">
              <input type="checkbox" name="cloudflareProtected" defaultChecked={vendor.cloudflareProtected} />
              <span className="admin-label" style={{ margin: 0 }}>Cloudflare Protection</span>
            </label>
          </div>
          <div className="admin-field">
            <label className="filter-option">
              <input type="checkbox" name="followRedirects" defaultChecked />
              <span className="admin-label" style={{ margin: 0 }}>Follow Redirects</span>
            </label>
          </div>
          <div className="admin-field">
            <label className="filter-option">
              <input type="checkbox" name="respectRobots" defaultChecked={false} />
              <span className="admin-label" style={{ margin: 0 }}>Respect robots.txt</span>
            </label>
          </div>
          <div className="admin-field">
            <label className="filter-option">
              <input type="checkbox" name="debugLogging" defaultChecked={false} />
              <span className="admin-label" style={{ margin: 0 }}>Debug Logging</span>
            </label>
          </div>
        </div>
        <div className="admin-field" style={{ marginTop: 16 }}>
          <label className="admin-label">Cookies</label>
          <textarea name="cookies" rows={2} className="admin-input font-mono" placeholder='key=value; ...' />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Configuration" icon="≡" id="vd-config" defaultOpen={false}>
        <div className="admin-field">
          <label className="admin-label">Notes</label>
          <textarea name="scraperNotes" rows={3} defaultValue={vendor.scraperNotes ?? ''} className="admin-input" placeholder="Internal notes..." />
        </div>
        <div className="admin-field">
          <label className="admin-label">Custom Headers (JSON)</label>
          <textarea name="customHeaders" rows={4} defaultValue={vendor.customHeaders ?? ''} className="admin-input" style={{ fontFamily: 'var(--f-m)', fontSize: '0.7rem' }}
            placeholder='{"Accept-Language": "en-IN"}' />
        </div>
      </CollapsibleCard>

      <div style={{ marginTop: 20 }}>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'SAVING...' : 'SAVE SCRAPER CONFIG →'}
        </button>
      </div>
    </form>
  );
}
