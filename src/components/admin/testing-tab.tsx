'use client';

import { CollapsibleCard } from './collapsible-card';
import type { ScrapeResult } from '@/lib/scraper/types';

interface Vendor {
  scraperEnabled: boolean;
  priceSelector: string | null;
}

interface Props {
  vendor: Vendor;
  testUrl: string;
  setTestUrl: (v: string) => void;
  testResult: ScrapeResult | null;
  testing: boolean;
  handleTest: () => void;
}

export function TestingTab({ vendor, testUrl, setTestUrl, testResult, testing, handleTest }: Props) {
  return (
    <CollapsibleCard title="Scraper Testing" icon="⚡" id="vd-testing">
      {!vendor.scraperEnabled || !vendor.priceSelector ? (
        <div className="sch-alert sch-alert--info" style={{ marginBottom: 16 }}>
          <span className="sch-alert-icon">ℹ</span>
          <span>
            Scraper is not configured. Go to <strong>Scraper</strong> tab → enable scraper → save, then configure at least a <strong>Price selector</strong> in the <strong>Selectors</strong> tab.
          </span>
        </div>
      ) : null}
      <div className="vd-test-layout">
        <div className="vd-test-config">
          <div className="admin-field">
            <label className="admin-label">Test URL</label>
            <input type="url" value={testUrl} onChange={(e) => setTestUrl(e.target.value)}
              className="admin-input" placeholder="https://example.com/product" />
          </div>
          <div className="vd-btn-row">
            <button type="button" onClick={handleTest} disabled={testing || !testUrl} className="btn-primary btn-sm">
              {testing ? 'TESTING...' : 'RUN TEST'}
            </button>
            <button type="button" className="btn-secondary btn-sm" disabled>RUN FULL SCRAPE</button>
            <button type="button" className="btn-secondary btn-sm" disabled>DOWNLOAD HTML</button>
            <button type="button" className="btn-secondary btn-sm" disabled>SCREENSHOT</button>
          </div>
        </div>

        <div className="vd-test-results">
          {testResult && (
            <div className="vd-test-output">
              <div className="vd-test-header">
                <span className="vd-test-title">EXTRACTION RESULT</span>
                <span className={`vd-sel-badge ${testResult.success ? 'vd-sel-badge--ok' : 'vd-sel-badge--err'}`}>
                  {testResult.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              <div className="vd-test-rows">
                {testResult.price != null && (
                  <div className="vd-test-row"><span className="vd-test-key">Price</span><span className="vd-test-val" style={{ color: 'var(--cyan)' }}>₹{Number(testResult.price).toLocaleString('en-IN')}</span></div>
                )}
                {testResult.availability && (
                  <div className="vd-test-row"><span className="vd-test-key">Availability</span><span className="vd-test-val">{String(testResult.availability)}</span></div>
                )}
                {testResult.title && (
                  <div className="vd-test-row"><span className="vd-test-key">Title</span><span className="vd-test-val">{String(testResult.title)}</span></div>
                )}
                {testResult.image && (
                  <div className="vd-test-row"><span className="vd-test-key">Image</span><span className="vd-test-val vd-test-val--truncate">{String(testResult.image).substring(0, 60)}...</span></div>
                )}
                {testResult.httpStatus && (
                  <div className="vd-test-row"><span className="vd-test-key">HTTP</span><span className="vd-test-val">{testResult.httpStatus}</span></div>
                )}
                {testResult.responseTimeMs != null && (
                  <div className="vd-test-row"><span className="vd-test-key">Response</span><span className="vd-test-val">{testResult.responseTimeMs}ms</span></div>
                )}
                {testResult.error && (
                  <div className="vd-test-row"><span className="vd-test-key">Error</span><span className="vd-test-val" style={{ color: 'var(--red)' }}>{String(testResult.error)}</span></div>
                )}
              </div>
            </div>
          )}
          {!testResult && !testing && (
            <div className="vd-test-empty">
              Enter a URL and run a test to see extracted data
            </div>
          )}
        </div>
      </div>
    </CollapsibleCard>
  );
}
