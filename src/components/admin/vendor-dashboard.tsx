'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { CollapsibleCard } from '@/components/admin/collapsible-card';
import type { ScrapeResult } from '@/lib/scraper/types';
import { updateVendor, updateVendorScraperConfig, deleteVendor, testVendorScraper } from '@/lib/admin/actions';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string;
  affiliateLink: string | null;
  shippingPolicy: string | null;
  chartColor: string | null;
  enabled: boolean;
  scraperEnabled: boolean;
  scraperEngine: string;
  priceSelector: string | null;
  availabilitySelector: string | null;
  titleSelector: string | null;
  imageSelector: string | null;
  productExistsSelector: string | null;
  priceAttribute: string;
  availabilityAttribute: string;
  titleAttribute: string;
  imageAttribute: string;
  customHeaders: string | null;
  cloudflareProtected: boolean;
  useJavaScriptRendering: boolean;
  customScraper: string | null;
  scraperVersion: number;
  scraperNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  productCount: number;
  scrapeLogCount: number;
  successRate: number | null;
  avgResponseTime: number;
  successLogs: number;
  failedLogs: number;
  totalRecentLogs: number;
}

interface LogEntry {
  id: string;
  status: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  error: string | null;
  price: number | null;
  createdAt: string;
}

type Tab = 'vendor' | 'scraper' | 'selectors' | 'scheduler' | 'testing' | 'logs' | 'statistics' | 'security' | 'advanced';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'vendor', label: 'Vendor', icon: '◆' },
  { id: 'scraper', label: 'Scraper', icon: '▲' },
  { id: 'selectors', label: 'Selectors', icon: '◎' },
  { id: 'scheduler', label: 'Scheduler', icon: '◷' },
  { id: 'testing', label: 'Testing', icon: '⚡' },
  { id: 'logs', label: 'Logs', icon: '≡' },
  { id: 'statistics', label: 'Statistics', icon: '▦' },
  { id: 'security', label: 'Security', icon: '█' },
  { id: 'advanced', label: 'Advanced', icon: '⚙' },
];

export function VendorDashboard({ vendor, stats, recentLogs }: { vendor: Vendor; stats: Stats; recentLogs: LogEntry[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('vendor');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<ScrapeResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [chartColor, setChartColor] = useState(vendor.chartColor ?? '#22C55E');

  // Scheduler state
  const [priceEnabled, setPriceEnabled] = useState(true);
  const [priceSchedule, setPriceSchedule] = useState('every-12h');
  const [stockEnabled, setStockEnabled] = useState(true);
  const [stockSchedule, setStockSchedule] = useState('every-30m');
  const [delayMin, setDelayMin] = useState(3);
  const [delayMax, setDelayMax] = useState(10);
  const [maxRpm, setMaxRpm] = useState(10);
  const [maxRph, setMaxRph] = useState(100);
  const [concurrency, setConcurrency] = useState(1);
  const [retryAttempts, setRetryAttempts] = useState(3);
  const [quietStart, setQuietStart] = useState('02:00');
  const [quietEnd, setQuietEnd] = useState('06:00');
  const [windowStart, setWindowStart] = useState('08:00');
  const [windowEnd, setWindowEnd] = useState('23:00');

  const flash = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  async function handleSaveGeneral(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await updateVendor(vendor.id, form);
    if (result?.error) {
      setError(result.error);
    } else {
      flash('Vendor updated');
    }
    setPending(false);
  }

  async function handleSaveScraper(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await updateVendorScraperConfig(vendor.id, form);
    if (result?.error) {
      setError(result.error);
    } else {
      flash('Scraper config saved');
    }
    setPending(false);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteVendor(vendor.id, deletePassword);
    if (result?.error) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }
    router.push('/admin/vendors');
  }

  async function handleTestScraper() {
    if (!testUrl) return;
    setTesting(true);
    setTestResult(null);
    const result = await testVendorScraper(vendor.id, testUrl);
    setTestResult(result);
    setTesting(false);
  }

  const healthStatus = stats.successRate === null ? 'unknown' : stats.successRate >= 80 ? 'healthy' : stats.successRate >= 50 ? 'warning' : 'error';
  const healthColor = healthStatus === 'healthy' ? 'var(--green)' : healthStatus === 'warning' ? 'var(--orange)' : healthStatus === 'unknown' ? 'var(--text-dim)' : 'var(--red)';
  const healthLabel = healthStatus === 'healthy' ? 'HEALTHY' : healthStatus === 'warning' ? 'WARNING' : healthStatus === 'unknown' ? 'NO DATA' : 'BROKEN';

  const lastLog = recentLogs[0];

  return (
    <>
      <Navbar />
      <div className="vd-wrap">
        {/* ═══ STICKY HEADER ═══ */}
        <div className="vd-header">
          <div className="vd-header-inner">
            <div className="vd-header-left">
              <div className="vd-vendor-identity">
                {vendor.logo ? (
                  <img src={vendor.logo} alt={vendor.name} className="vd-logo" />
                ) : (
                  <div className="vd-logo-placeholder">{vendor.name.charAt(0)}</div>
                )}
                <div className="vd-vendor-meta">
                  <div className="vd-vendor-name">{vendor.name}</div>
                  <div className="vd-vendor-url">{vendor.website}</div>
                </div>
              </div>

              <div className="vd-header-stats">
                <div className="vd-stat-item">
                  <span className="vd-stat-dot" style={{ background: vendor.enabled ? 'var(--green)' : 'var(--red)' }} />
                  <span className="vd-stat-label">{vendor.enabled ? 'ENABLED' : 'DISABLED'}</span>
                </div>
                <div className="vd-stat-divider" />
                <div className="vd-stat-item">
                  <span className="vd-stat-value">{stats.productCount}</span>
                  <span className="vd-stat-label">PRODUCTS</span>
                </div>
                <div className="vd-stat-divider" />
                <div className="vd-stat-item">
                  <span className="vd-stat-value">{lastLog ? timeAgo(lastLog.createdAt) : '—'}</span>
                  <span className="vd-stat-label">LAST SCRAPE</span>
                </div>
                <div className="vd-stat-divider" />
                <div className="vd-stat-item">
                  <span className="vd-stat-value">{stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : '—'}</span>
                  <span className="vd-stat-label">AVG RUNTIME</span>
                </div>
                <div className="vd-stat-divider" />
                <div className="vd-stat-item">
                  <span className="vd-stat-value" style={{ color: healthColor }}>{stats.successRate !== null ? `${stats.successRate}%` : '—'}</span>
                  <span className="vd-stat-label">SUCCESS</span>
                </div>
                <div className="vd-stat-divider" />
                <div className="vd-stat-item">
                  <span className="vd-stat-value">v{vendor.scraperVersion}</span>
                  <span className="vd-stat-label">VERSION</span>
                </div>
              </div>
            </div>

            <div className="vd-header-actions">
              <button type="button" className="btn-sm vd-action-btn" disabled={pending} onClick={() => document.querySelector<HTMLFormElement>('#vendor-form')?.requestSubmit()}>
                {pending ? '...' : 'SAVE'}
              </button>
              <button type="button" className="btn-sm vd-action-btn vd-action-secondary" onClick={() => router.push('/admin/vendors')}>
                CANCEL
              </button>
              <button type="button" className="btn-sm vd-action-btn vd-action-danger" onClick={() => setShowDeleteModal(true)}>
                DELETE
              </button>
            </div>
          </div>
        </div>

        {/* ═══ TAB BAR ═══ */}
        <div className="vd-tab-bar">
          <div className="vd-tab-bar-inner">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`vd-tab ${activeTab === tab.id ? 'vd-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="vd-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="vd-body">
          <div className="vd-main">
            {error && <div className="vd-flash vd-flash--error">{error}</div>}
            {successMsg && <div className="vd-flash vd-flash--ok">{successMsg}</div>}

            {/* ─── VENDOR TAB ─── */}
            <div style={{ display: activeTab === 'vendor' ? undefined : 'none' }}>
              <form id="vendor-form" onSubmit={handleSaveGeneral}>
                <CollapsibleCard title="General" icon="◆" id="vd-general">
                  <div className="vd-form-grid">
                    <div className="admin-field">
                      <label className="admin-label">Vendor Name *</label>
                      <input name="name" required defaultValue={vendor.name} className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Website *</label>
                      <input name="website" required type="url" defaultValue={vendor.website} className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Affiliate Link</label>
                      <input name="affiliateLink" defaultValue={vendor.affiliateLink ?? ''} className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Shipping Policy</label>
                      <textarea name="shippingPolicy" rows={2} defaultValue={vendor.shippingPolicy ?? ''} className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Country</label>
                      <input name="country" defaultValue="IN" className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Currency</label>
                      <input name="currency" defaultValue="INR" className="admin-input" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Chart Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="color" value={chartColor} style={{ width: 36, height: 36, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                          onChange={(e) => { const v = e.target.value; setChartColor(v); }} />
                        <input type="text" name="chartColor" value={chartColor} className="admin-input" style={{ width: 100 }}
                          pattern="^#[0-9a-fA-F]{6}$" maxLength={7}
                          onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) setChartColor(v); }} />
                      </div>
                    </div>
                    <div className="admin-field">
                      <label className="filter-option">
                        <input type="checkbox" name="enabled" defaultChecked={vendor.enabled} />
                        <span className="admin-label" style={{ margin: 0 }}>Enabled</span>
                      </label>
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Statistics" icon="▦" id="vd-stats" defaultOpen={false}>
                  <div className="vd-stats-grid">
                    <div className="vd-stat-card">
                      <div className="vd-stat-card-value">{stats.productCount}</div>
                      <div className="vd-stat-card-label">Products</div>
                    </div>
                    <div className="vd-stat-card">
                      <div className="vd-stat-card-value">{stats.scrapeLogCount}</div>
                      <div className="vd-stat-card-label">Scrape Logs</div>
                    </div>
                    <div className="vd-stat-card">
                      <div className="vd-stat-card-value">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}</div>
                      <div className="vd-stat-card-label">First Added</div>
                    </div>
                    <div className="vd-stat-card">
                      <div className="vd-stat-card-value">{vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : '—'}</div>
                      <div className="vd-stat-card-label">Last Updated</div>
                    </div>
                  </div>
                </CollapsibleCard>
              </form>
            </div>

            {/* ─── SCRAPER TAB ─── */}
            <div style={{ display: activeTab === 'scraper' ? undefined : 'none' }}>
              <form onSubmit={handleSaveScraper}>
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
            </div>

            {/* ─── SELECTORS TAB ─── */}
            <div style={{ display: activeTab === 'selectors' ? undefined : 'none' }}>
              <form onSubmit={handleSaveScraper}>
                <CollapsibleCard title="CSS Selectors" icon="◎" id="vd-selectors">
                  <div className="vd-selector-table">
                    <div className="vd-selector-header">
                      <span className="vd-sel-col-field">Field</span>
                      <span className="vd-sel-col-selector">Selector</span>
                      <span className="vd-sel-col-attr">Attribute</span>
                      <span className="vd-sel-col-status">Status</span>
                    </div>
                    {[
                      { name: 'priceSelector', label: 'Price', attr: 'priceAttribute', defaultSel: vendor.priceSelector ?? '', defaultAttr: vendor.priceAttribute, required: true },
                      { name: 'availabilitySelector', label: 'Availability', attr: 'availabilityAttribute', defaultSel: vendor.availabilitySelector ?? '', defaultAttr: vendor.availabilityAttribute, required: false },
                      { name: 'titleSelector', label: 'Title', attr: 'titleAttribute', defaultSel: vendor.titleSelector ?? '', defaultAttr: vendor.titleAttribute, required: false },
                      { name: 'imageSelector', label: 'Image', attr: 'imageAttribute', defaultSel: vendor.imageSelector ?? '', defaultAttr: vendor.imageAttribute, required: false },
                      { name: 'productExistsSelector', label: 'Exists', attr: null, defaultSel: vendor.productExistsSelector ?? '', defaultAttr: '', required: false },
                    ].map((sel) => (
                      <div key={sel.name} className="vd-selector-row">
                        <span className="vd-sel-col-field">
                          {sel.label}{sel.required && <span style={{ color: 'var(--red)' }}> *</span>}
                        </span>
                        <span className="vd-sel-col-selector">
                          <input name={sel.name} defaultValue={sel.defaultSel} className="admin-input" style={{ fontSize: '0.7rem', fontFamily: 'var(--f-m)' }}
                            placeholder='.price, [data-price]' />
                        </span>
                        <span className="vd-sel-col-attr">
                          {sel.attr ? (
                            <select name={sel.attr} defaultValue={sel.defaultAttr} className="admin-input" style={{ fontSize: '0.7rem' }}>
                              {sel.name === 'priceSelector' && (<><option value="text">Text</option><option value="content">Content</option><option value="data-price">data-price</option><option value="href">href</option></>)}
                              {sel.name === 'availabilitySelector' && (<><option value="text">Text</option><option value="class">Class</option><option value="data-status">data-status</option></>)}
                              {sel.name === 'titleSelector' && (<><option value="text">Text</option></>)}
                              {sel.name === 'imageSelector' && (<><option value="src">src</option><option value="data-src">data-src</option><option value="content">content</option></>)}
                            </select>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>—</span>
                          )}
                        </span>
                        <span className="vd-sel-col-status">
                          {sel.defaultSel ? (
                            <span className="vd-sel-badge vd-sel-badge--ok">CONFIGURED</span>
                          ) : (
                            <span className="vd-sel-badge vd-sel-badge--empty">EMPTY</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleCard>

                <div style={{ marginTop: 20 }}>
                  <button type="submit" disabled={pending} className="btn-primary">
                    {pending ? 'SAVING...' : 'SAVE SELECTORS →'}
                  </button>
                </div>
              </form>
            </div>

            {/* ─── SCHEDULER TAB ─── */}
            <div style={{ display: activeTab === 'scheduler' ? undefined : 'none' }}>
              <div className="sch">

                {/* ── Alerts ── */}
                {(healthStatus === 'warning' || healthStatus === 'error' || healthStatus === 'unknown' || priceSchedule === 'manual' || stockSchedule === 'manual') && (
                  <div className="sch-alerts">
                    {healthStatus === 'warning' && (
                      <div className="sch-alert sch-alert--warning">
                        <span className="sch-alert-icon">⚠</span>
                        <span>Success rate below 80%. Check selectors and target site changes.</span>
                      </div>
                    )}
                    {healthStatus === 'error' && (
                      <div className="sch-alert sch-alert--error">
                        <span className="sch-alert-icon">✖</span>
                        <span>Scraper is broken. Immediate attention required.</span>
                      </div>
                    )}
                    {healthStatus === 'unknown' && (
                      <div className="sch-alert sch-alert--info">
                        <span className="sch-alert-icon">ℹ</span>
                        <span>No scrape data yet. Run a test to verify scraper configuration.</span>
                      </div>
                    )}
                    {priceSchedule === 'manual' && (
                      <div className="sch-alert sch-alert--info">
                        <span className="sch-alert-icon">ℹ</span>
                        <span>Price monitoring is set to Manual. Prices will not be checked automatically.</span>
                      </div>
                    )}
                    {stockSchedule === 'manual' && (
                      <div className="sch-alert sch-alert--info">
                        <span className="sch-alert-icon">ℹ</span>
                        <span>Stock monitoring is set to Manual. Stock levels will not be checked automatically.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ SECTION 1: MONITORING ═══ */}
                <div className="sch-section">
                  <div className="sch-section-head">
                    <span className="sch-section-icon">$</span>
                    <span className="sch-section-title">Monitoring</span>
                    <span className="sch-section-subtitle">Price &amp; stock schedule configuration</span>
                  </div>

                  <div className="sch-mon-grid">
                    {/* Price Schedule */}
                    <div className="sch-mon-card">
                      <div className="sch-mon-head">
                        <span className="sch-mon-dot" style={{ background: priceEnabled ? 'var(--cyan)' : 'var(--text-muted)' }} />
                        <span className="sch-mon-name">PRICE CHECK</span>
                        <label className="filter-option sch-mon-toggle">
                          <input type="checkbox" checked={priceEnabled} onChange={(e) => setPriceEnabled(e.target.checked)} />
                          <span className="admin-label" style={{ margin: 0 }}>{priceEnabled ? 'ON' : 'OFF'}</span>
                        </label>
                      </div>
                      <div className="sch-mon-body">
                        <div className="admin-field">
                          <label className="admin-label">Interval</label>
                          <select className="admin-input" value={priceSchedule} onChange={(e) => setPriceSchedule(e.target.value)} disabled={!priceEnabled}>
                            <option value="manual">Manual</option>
                            <option value="every-1h">Every Hour</option>
                            <option value="every-2h">Every 2 Hours</option>
                            <option value="every-3h">Every 3 Hours</option>
                            <option value="every-6h">Every 6 Hours</option>
                            <option value="every-12h">Every 12 Hours</option>
                            <option value="daily">Daily</option>
                            <option value="custom">Custom Cron</option>
                          </select>
                        </div>
                        {priceSchedule === 'custom' && (
                          <div className="admin-field">
                            <label className="admin-label">Cron</label>
                            <input className="admin-input" placeholder="0 */6 * * *" style={{ fontFamily: 'var(--f-m)', fontSize: '0.7rem' }} disabled={!priceEnabled} />
                          </div>
                        )}
                        <div className="sch-mon-stats">
                          <span>{priceEnabled ? requestsPerDay(priceSchedule) : 0} req/day</span>
                          <span>{lastLog ? `Last: ${timeAgo(lastLog.createdAt)}` : 'No runs'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Schedule */}
                    <div className="sch-mon-card">
                      <div className="sch-mon-head">
                        <span className="sch-mon-dot" style={{ background: stockEnabled ? 'var(--green)' : 'var(--text-muted)' }} />
                        <span className="sch-mon-name">STOCK CHECK</span>
                        <label className="filter-option sch-mon-toggle">
                          <input type="checkbox" checked={stockEnabled} onChange={(e) => setStockEnabled(e.target.checked)} />
                          <span className="admin-label" style={{ margin: 0 }}>{stockEnabled ? 'ON' : 'OFF'}</span>
                        </label>
                      </div>
                      <div className="sch-mon-body">
                        <div className="admin-field">
                          <label className="admin-label">Interval</label>
                          <select className="admin-input" value={stockSchedule} onChange={(e) => setStockSchedule(e.target.value)} disabled={!stockEnabled}>
                            <option value="every-5m">Every 5 Minutes</option>
                            <option value="every-10m">Every 10 Minutes</option>
                            <option value="every-15m">Every 15 Minutes</option>
                            <option value="every-30m">Every 30 Minutes</option>
                            <option value="every-1h">Every Hour</option>
                            <option value="every-2h">Every 2 Hours</option>
                            <option value="custom">Custom Cron</option>
                          </select>
                        </div>
                        {stockSchedule === 'custom' && (
                          <div className="admin-field">
                            <label className="admin-label">Cron</label>
                            <input className="admin-input" placeholder="*/30 * * * *" style={{ fontFamily: 'var(--f-m)', fontSize: '0.7rem' }} disabled={!stockEnabled} />
                          </div>
                        )}
                        <div className="sch-mon-stats">
                          <span>{stockEnabled ? requestsPerDay(stockSchedule) : 0} req/day</span>
                          <span>{lastLog ? `Last: ${timeAgo(lastLog.createdAt)}` : 'No runs'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Volume summary */}
                  <div className="sch-mon-volume">
                    <span className="sch-mon-vol-label">DAILY VOLUME</span>
                    <div className="sch-mon-vol-bar">
                      <div className="sch-mon-vol-fill sch-mon-vol-fill--stock" style={{ width: `${Math.min(100, ((stockEnabled ? requestsPerDay(stockSchedule) : 0) / Math.max(1, (stockEnabled ? requestsPerDay(stockSchedule) : 0) + (priceEnabled ? requestsPerDay(priceSchedule) : 0))) * 100)}%` }} />
                      <div className="sch-mon-vol-fill sch-mon-vol-fill--price" style={{ width: `${Math.min(100, ((priceEnabled ? requestsPerDay(priceSchedule) : 0) / Math.max(1, (stockEnabled ? requestsPerDay(stockSchedule) : 0) + (priceEnabled ? requestsPerDay(priceSchedule) : 0))) * 100)}%` }} />
                    </div>
                    <div className="sch-mon-vol-legend">
                      <span><span className="sch-vol-dot sch-vol-dot--price" />{priceEnabled ? requestsPerDay(priceSchedule) : 0} price</span>
                      <span><span className="sch-vol-dot sch-vol-dot--stock" />{stockEnabled ? requestsPerDay(stockSchedule) : 0} stock</span>
                      <span className="sch-mon-vol-total">{(stockEnabled ? requestsPerDay(stockSchedule) : 0) + (priceEnabled ? requestsPerDay(priceSchedule) : 0)} total/day</span>
                    </div>
                  </div>
                </div>

                {/* ═══ SECTION 2: REQUEST BEHAVIOUR ═══ */}
                <div className="sch-section">
                  <div className="sch-section-head">
                    <span className="sch-section-icon">≡</span>
                    <span className="sch-section-title">Request Behaviour</span>
                    <span className="sch-section-subtitle">Rate limits, concurrency, delays &amp; backoff</span>
                  </div>

                  <div className="sch-beh-grid">
                    <div className="sch-beh-control">
                      <div className="sch-beh-head"><span>MAX RPM</span><span className="sch-beh-val">{maxRpm}</span></div>
                      <input type="range" className="vd-range-input" value={maxRpm} onChange={(e) => setMaxRpm(Number(e.target.value))} min={1} max={60} />
                    </div>
                    <div className="sch-beh-control">
                      <div className="sch-beh-head"><span>MAX RPH</span><span className="sch-beh-val">{maxRph}</span></div>
                      <input type="range" className="vd-range-input" value={maxRph} onChange={(e) => setMaxRph(Number(e.target.value))} min={10} max={1000} step={10} />
                    </div>
                    <div className="sch-beh-control">
                      <div className="sch-beh-head"><span>CONCURRENCY</span><span className="sch-beh-val">{concurrency}</span></div>
                      <input type="range" className="vd-range-input" value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))} min={1} max={5} />
                    </div>
                    <div className="sch-beh-control">
                      <div className="sch-beh-head"><span>RETRIES</span><span className="sch-beh-val">{retryAttempts}</span></div>
                      <input type="range" className="vd-range-input" value={retryAttempts} onChange={(e) => setRetryAttempts(Number(e.target.value))} min={0} max={10} />
                    </div>
                  </div>

                  <div className="sch-beh-delays">
                    <div className="sch-beh-control">
                      <div className="sch-beh-head"><span>MIN DELAY</span><span className="sch-beh-val">{delayMin}s</span></div>
                      <input type="range" className="vd-range-input" value={delayMin} onChange={(e) => setDelayMin(Number(e.target.value))} min={1} max={30} />
                    </div>
                    <div className="sch-beh-control">
                      <div className="sch-beh-head"><span>MAX DELAY</span><span className="sch-beh-val">{delayMax}s</span></div>
                      <input type="range" className="vd-range-input" value={delayMax} onChange={(e) => setDelayMax(Number(e.target.value))} min={delayMin} max={60} />
                    </div>
                  </div>

                  <div className="sch-beh-backoff">
                    <span className="sch-beh-backoff-label">BACKOFF CHAIN</span>
                    <div className="sch-backoff-steps">
                      {['15m', '30m', '1h', '3h', '12h'].map((step, i) => (
                        <span key={step} className="sch-backoff-step">
                          <span className="sch-backoff-box">{step}</span>
                          {i < 4 && <span className="sch-backoff-arrow">→</span>}
                        </span>
                      ))}
                    </div>
                    <div className="sch-backoff-triggers">
                      <span className="sch-backoff-tag">429</span>
                      <span className="sch-backoff-tag">403</span>
                      <span className="sch-backoff-tag">CF</span>
                      <span className="sch-backoff-tag">CAPTCHA</span>
                      <span className="sch-backoff-tag">503</span>
                    </div>
                  </div>
                </div>

                {/* ═══ SECTION 3: OPERATING HOURS ═══ */}
                <div className="sch-section">
                  <div className="sch-section-head">
                    <span className="sch-section-icon">◐</span>
                    <span className="sch-section-title">Operating Hours</span>
                    <span className="sch-section-subtitle">Quiet hours, scraping window &amp; timezone</span>
                  </div>

                  <div className="sch-hours-grid">
                    <div className="sch-hours-block">
                      <div className="sch-hours-head">QUIET HOURS</div>
                      <div className="sch-hours-desc">No scraping during these hours</div>
                      <div className="sch-hours-row">
                        <div className="admin-field"><label className="admin-label">Start</label><input type="time" className="admin-input" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} /></div>
                        <span className="sch-hours-sep">→</span>
                        <div className="admin-field"><label className="admin-label">End</label><input type="time" className="admin-input" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} /></div>
                        <div className="admin-field"><label className="admin-label">TZ</label><select className="admin-input" defaultValue="vendor"><option value="vendor">Local</option><option value="UTC">UTC</option><option value="IST">IST</option></select></div>
                      </div>
                    </div>
                    <div className="sch-hours-divider" />
                    <div className="sch-hours-block">
                      <div className="sch-hours-head">SCRAPING WINDOW</div>
                      <div className="sch-hours-desc">Restrict to specific hours</div>
                      <div className="sch-hours-row">
                        <div className="admin-field"><label className="admin-label">Start</label><input type="time" className="admin-input" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} /></div>
                        <span className="sch-hours-sep">→</span>
                        <div className="admin-field"><label className="admin-label">End</label><input type="time" className="admin-input" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} /></div>
                        <div className="admin-field"><label className="admin-label">TZ</label><select className="admin-input" defaultValue="vendor"><option value="vendor">Local</option><option value="UTC">UTC</option><option value="IST">IST</option></select></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══ SECTION 4: PRODUCT PRIORITY ═══ */}
                <div className="sch-section">
                  <div className="sch-section-head">
                    <span className="sch-section-icon">▲</span>
                    <span className="sch-section-title">Product Priority</span>
                    <span className="sch-section-subtitle">Monitoring frequency by product tier</span>
                  </div>

                  <div className="sch-priority-table">
                    <div className="sch-pri-header">
                      <span>Level</span><span>Stock</span><span>Price</span><span>Behavior</span>
                    </div>
                    {[
                      { level: 'Critical', badge: 'sch-pri--critical', stock: '15 min', price: '3 hours', desc: 'Highest priority products' },
                      { level: 'High', badge: 'sch-pri--high', stock: '30 min', price: '6 hours', desc: 'Popular / in-demand items' },
                      { level: 'Normal', badge: 'sch-pri--normal', stock: '1 hour', price: '12 hours', desc: 'Standard monitoring' },
                      { level: 'Low', badge: 'sch-pri--low', stock: 'Daily', price: 'Daily', desc: 'Stable / niche products' },
                      { level: 'Archived', badge: 'sch-pri--archived', stock: 'None', price: 'None', desc: 'No automatic scraping' },
                    ].map((row) => (
                      <div key={row.level} className="sch-pri-row">
                        <span><span className={`sch-pri-badge ${row.badge}`}>{row.level}</span></span>
                        <span>{row.stock}</span>
                        <span>{row.price}</span>
                        <span className="sch-pri-desc">{row.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ─── TESTING TAB ─── */}
            <div style={{ display: activeTab === 'testing' ? undefined : 'none' }}>
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
                      <button type="button" onClick={handleTestScraper} disabled={testing || !testUrl} className="btn-primary btn-sm">
                        {testing ? 'TESTING...' : 'RUN TEST'}
                      </button>
                      <button type="button" className="btn-secondary btn-sm">RUN FULL SCRAPE</button>
                      <button type="button" className="btn-secondary btn-sm">DOWNLOAD HTML</button>
                      <button type="button" className="btn-secondary btn-sm">SCREENSHOT</button>
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
            </div>

            {/* ─── LOGS TAB ─── */}
            <div style={{ display: activeTab === 'logs' ? undefined : 'none' }}>
              <CollapsibleCard title="Scrape Logs" icon="≡" id="vd-logs">
                <div className="vd-logs-toolbar">
                  <input type="text" className="admin-input" style={{ maxWidth: 300, fontSize: '0.7rem' }} placeholder="Search logs..." />
                  <div className="vd-btn-row" style={{ marginLeft: 'auto' }}>
                    <button type="button" className="btn-secondary btn-sm">EXPORT</button>
                  </div>
                </div>
                <div className="vd-log-table">
                  <div className="vd-log-header">
                    <span className="vd-log-col-time">Timestamp</span>
                    <span className="vd-log-col-status">Status</span>
                    <span className="vd-log-col-duration">Duration</span>
                    <span className="vd-log-col-http">HTTP</span>
                    <span className="vd-log-col-error">Error</span>
                  </div>
                  {recentLogs.length === 0 ? (
                    <div className="vd-log-empty">No logs found</div>
                  ) : (
                    recentLogs.map((log) => (
                      <div key={log.id} className="vd-log-row">
                        <span className="vd-log-col-time">{new Date(log.createdAt).toLocaleString()}</span>
                        <span className="vd-log-col-status">
                          <span className={`vd-sel-badge ${log.status === 'SUCCESS' ? 'vd-sel-badge--ok' : log.status === 'FAILED' ? 'vd-sel-badge--err' : 'vd-sel-badge--warn'}`}>
                            {log.status}
                          </span>
                        </span>
                        <span className="vd-log-col-duration">{log.responseTimeMs != null ? `${log.responseTimeMs}ms` : '—'}</span>
                        <span className="vd-log-col-http">{log.httpStatus ?? '—'}</span>
                        <span className="vd-log-col-error" title={log.error ?? ''}>{log.error ? log.error.substring(0, 50) + (log.error.length > 50 ? '...' : '') : '—'}</span>
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleCard>
            </div>

            {/* ─── STATISTICS TAB ─── */}
            <div style={{ display: activeTab === 'statistics' ? undefined : 'none' }}>
              <>
                <div className="vd-stats-dashboard">
                  <div className="vd-stat-lg">
                    <div className="vd-stat-lg-label">Success Rate</div>
                    <div className="vd-stat-lg-value" style={{ color: stats.successRate === null ? 'var(--text-dim)' : stats.successRate >= 80 ? 'var(--green)' : stats.successRate >= 50 ? 'var(--orange)' : 'var(--red)' }}>
                      {stats.successRate !== null ? `${stats.successRate}%` : '—'}
                    </div>
                    <div className="vd-stat-lg-bar">
                      <div className="vd-stat-lg-fill" style={{ width: stats.successRate !== null ? `${stats.successRate}%` : '0%', background: stats.successRate === null ? 'var(--text-dim)' : stats.successRate >= 80 ? 'var(--green)' : stats.successRate >= 50 ? 'var(--orange)' : 'var(--red)' }} />
                    </div>
                  </div>
                  <div className="vd-stat-lg">
                    <div className="vd-stat-lg-label">Avg Response Time</div>
                    <div className="vd-stat-lg-value">{stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : '—'}</div>
                  </div>
                  <div className="vd-stat-lg">
                    <div className="vd-stat-lg-label">Products Tracked</div>
                    <div className="vd-stat-lg-value">{stats.productCount}</div>
                  </div>
                  <div className="vd-stat-lg">
                    <div className="vd-stat-lg-label">Total Scrape Runs</div>
                    <div className="vd-stat-lg-value">{stats.scrapeLogCount}</div>
                  </div>
                </div>

                <CollapsibleCard title="Recent Breakdown" icon="▦" id="vd-stats-breakdown" defaultOpen={false}>
                  <div className="vd-stats-grid">
                    <div className="vd-stat-card"><div className="vd-stat-card-value" style={{ color: 'var(--green)' }}>{stats.successLogs}</div><div className="vd-stat-card-label">Successful</div></div>
                    <div className="vd-stat-card"><div className="vd-stat-card-value" style={{ color: 'var(--red)' }}>{stats.failedLogs}</div><div className="vd-stat-card-label">Failed</div></div>
                    <div className="vd-stat-card"><div className="vd-stat-card-value">{stats.totalRecentLogs}</div><div className="vd-stat-card-label">Total (Recent)</div></div>
                    <div className="vd-stat-card"><div className="vd-stat-card-value">{vendor.scraperVersion}</div><div className="vd-stat-card-label">Config Version</div></div>
                  </div>
                </CollapsibleCard>
              </>
            </div>

            {/* ─── SECURITY TAB ─── */}
            <div style={{ display: activeTab === 'security' ? undefined : 'none' }}>
              <>
                <CollapsibleCard title="Security Configuration" icon="█" id="vd-security">
                  <div className="vd-security-grid">
                    <div className="vd-sec-row">
                      <span className="vd-sec-icon" style={{ color: 'var(--green)' }}>●</span>
                      <span className="vd-sec-label">Cookies</span>
                      <span className="vd-sec-value">Stored Securely</span>
                    </div>
                    <div className="vd-sec-row">
                      <span className="vd-sec-icon" style={{ color: 'var(--green)' }}>●</span>
                      <span className="vd-sec-label">API Keys</span>
                      <span className="vd-sec-value">Stored as Environment Variables</span>
                    </div>
                    <div className="vd-sec-row">
                      <span className="vd-sec-icon" style={{ color: vendor.cloudflareProtected ? 'var(--green)' : 'var(--text-dim)' }}>
                        {vendor.cloudflareProtected ? '●' : '○'}
                      </span>
                      <span className="vd-sec-label">Cloudflare</span>
                      <span className="vd-sec-value">{vendor.cloudflareProtected ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="vd-sec-row">
                      <span className="vd-sec-icon" style={{ color: 'var(--green)' }}>●</span>
                      <span className="vd-sec-label">Rate Limits</span>
                      <span className="vd-sec-value">Configured</span>
                    </div>
                    <div className="vd-sec-row">
                      <span className="vd-sec-icon" style={{ color: 'var(--green)' }}>●</span>
                      <span className="vd-sec-label">Proxy</span>
                      <span className="vd-sec-value">Configured</span>
                    </div>
                    <div className="vd-sec-row">
                      <span className="vd-sec-icon" style={{ color: vendor.useJavaScriptRendering ? 'var(--green)' : 'var(--text-dim)' }}>
                        {vendor.useJavaScriptRendering ? '●' : '○'}
                      </span>
                      <span className="vd-sec-label">JavaScript Rendering</span>
                      <span className="vd-sec-value">{vendor.useJavaScriptRendering ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </CollapsibleCard>
                <div className="vd-security-note">
                  Secrets are never displayed. Only masked values are shown. Replace secrets without revealing existing values.
                </div>
              </>
            </div>

            {/* ─── ADVANCED TAB ─── */}
            <div style={{ display: activeTab === 'advanced' ? undefined : 'none' }}>
              <>
                <CollapsibleCard title="Vendor Metadata" icon="⚙" id="vd-advanced-meta">
                  <div className="vd-form-grid">
                    <div className="admin-field">
                      <label className="admin-label">Version</label>
                      <input className="admin-input" value={`v${vendor.scraperVersion}`} readOnly />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Environment</label>
                      <input className="admin-input" value="production" readOnly />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Worker Assignment</label>
                      <input className="admin-input" defaultValue="default" />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">Priority</label>
                      <input name="priority" type="number" defaultValue={5} className="admin-input" min={1} max={10} />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Custom Headers" icon="≡" id="vd-advanced-headers" defaultOpen={false}>
                  <div className="admin-field">
                    <label className="admin-label">Headers (JSON)</label>
                    <textarea name="customHeaders" rows={5} defaultValue={vendor.customHeaders ?? ''} className="admin-input"
                      style={{ fontFamily: 'var(--f-m)', fontSize: '0.7rem' }} placeholder='{"Authorization": "..."}' />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="JSON Configuration" icon="◇" id="vd-advanced-json" defaultOpen={false}>
                  <div className="admin-field">
                    <label className="admin-label">Full Configuration (JSON)</label>
                    <textarea readOnly rows={10} className="admin-input" style={{ fontFamily: 'var(--f-m)', fontSize: '0.65rem', resize: 'vertical' }}
                      value={JSON.stringify(vendor, null, 2)} />
                  </div>
                  <div className="vd-btn-row" style={{ marginTop: 12 }}>
                    <button type="button" className="btn-secondary btn-sm">IMPORT</button>
                    <button type="button" className="btn-secondary btn-sm">EXPORT</button>
                    <button type="button" className="btn-secondary btn-sm">BACKUP</button>
                    <button type="button" className="btn-secondary btn-sm">RESTORE</button>
                  </div>
                </CollapsibleCard>
              </>
            </div>
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <div className="vd-sidebar">
            {activeTab === 'scheduler' ? (
              <>
                {/* ── Scheduler: Health ── */}
                <div className="sch-side-card">
                  <div className="sch-side-head">HEALTH</div>
                  <div className="sch-side-badge" style={{ borderColor: healthColor, color: healthColor }}>
                    <span className="sch-side-dot" style={{ background: healthColor }} />
                    {healthLabel}
                  </div>
                  <div className="sch-side-rows">
                    <div className="sch-side-row"><span>Success Rate</span><span style={{ color: healthColor }}>{stats.successRate !== null ? `${stats.successRate}%` : '—'}</span></div>
                    <div className="sch-side-row"><span>Avg Runtime</span><span>{stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : '—'}</span></div>
                    <div className="sch-side-row"><span>Consecutive Failures</span><span>{stats.failedLogs}</span></div>
                    <div className="sch-side-row"><span>Last Success</span><span>{lastLog?.status === 'SUCCESS' ? timeAgo(lastLog.createdAt) : '—'}</span></div>
                    <div className="sch-side-row"><span>429 Errors</span><span>{recentLogs.filter((l) => l.error?.includes('429')).length}</span></div>
                  </div>
                </div>

                {/* ── Scheduler: Queue ── */}
                <div className="sch-side-card">
                  <div className="sch-side-head">QUEUE</div>
                  <div className="sch-side-rows">
                    <div className="sch-side-row"><span>Running Jobs</span><span>0</span></div>
                    <div className="sch-side-row"><span>Waiting Jobs</span><span>0</span></div>
                    <div className="sch-side-row"><span>Queue Position</span><span>—</span></div>
                    <div className="sch-side-row"><span>Estimated Start</span><span>—</span></div>
                  </div>
                </div>

                {/* ── Scheduler: Today's Activity ── */}
                <div className="sch-side-card">
                  <div className="sch-side-head">TODAY&apos;S ACTIVITY</div>
                  <div className="sch-side-rows">
                    <div className="sch-side-row"><span>Price Changes</span><span>{recentLogs.filter((l) => l.price != null && l.status === 'SUCCESS').length}</span></div>
                    <div className="sch-side-row"><span>Stock Checks</span><span>{recentLogs.filter((l) => l.price == null && l.status === 'SUCCESS').length}</span></div>
                    <div className="sch-side-row"><span>Requests</span><span>{stats.totalRecentLogs}</span></div>
                    <div className="sch-side-row"><span>Errors</span><span style={{ color: stats.failedLogs > 0 ? 'var(--red)' : 'var(--text-dim)' }}>{stats.failedLogs}</span></div>
                  </div>
                </div>

                {/* ── Scheduler: Config Summary ── */}
                <div className="sch-side-card">
                  <div className="sch-side-head">CONFIGURATION</div>
                  <div className="sch-side-rows">
                    <div className="sch-side-row"><span>Price Schedule</span><span>{priceEnabled ? getLabel(priceSchedule) : 'Disabled'}</span></div>
                    <div className="sch-side-row"><span>Stock Schedule</span><span>{stockEnabled ? getLabel(stockSchedule) : 'Disabled'}</span></div>
                    <div className="sch-side-row"><span>Est. Requests/Day</span><span>{(stockEnabled ? requestsPerDay(stockSchedule) : 0) + (priceEnabled ? requestsPerDay(priceSchedule) : 0)}</span></div>
                    <div className="sch-side-row"><span>Avg Runtime</span><span>{stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : '—'}</span></div>
                  </div>
                </div>

                {/* ── Scheduler: Recommendations ── */}
                <div className="sch-side-card">
                  <div className="sch-side-head">RECOMMENDATIONS</div>
                  <div className="sch-side-recs">
                    <div className="sch-side-rec">
                      <span className="sch-side-rec-dot" style={{ background: 'var(--cyan)' }} />
                      <div className="sch-side-rec-text">
                        <span>Vendor prices rarely change.</span>
                        <span className="sch-side-rec-action">Recommended: 12 Hours</span>
                      </div>
                    </div>
                    <div className="sch-side-rec">
                      <span className="sch-side-rec-dot" style={{ background: 'var(--green)' }} />
                      <div className="sch-side-rec-text">
                        <span>Vendor stock changes frequently.</span>
                        <span className="sch-side-rec-action">Recommended: 30 Minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Default sidebar: Health Widget */}
                <div className="vd-panel">
                  <div className="vd-panel-title">VENDOR HEALTH</div>
                  <div className="vd-health" style={{ borderColor: healthColor }}>
                    <div className="vd-health-status" style={{ color: healthColor }}>
                      <span className="vd-health-dot" style={{ background: healthColor }} />
                      {healthLabel}
                    </div>
                    <div className="vd-health-rows">
                      <div className="vd-health-row"><span>Success Rate</span><span style={{ color: healthColor }}>{stats.successRate !== null ? `${stats.successRate}%` : '—'}</span></div>
                      <div className="vd-health-row"><span>Last Success</span><span>{lastLog?.status === 'SUCCESS' ? timeAgo(lastLog.createdAt) : '—'}</span></div>
                      <div className="vd-health-row"><span>Consecutive Failures</span><span>{stats.failedLogs}</span></div>
                      <div className="vd-health-row"><span>Avg Runtime</span><span>{stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : '—'}</span></div>
                    </div>
                    {healthStatus === 'warning' && (
                      <div className="vd-health-reason">
                        Success rate below 80%. Check selectors and target site changes.
                      </div>
                    )}
                    {healthStatus === 'error' && (
                      <div className="vd-health-reason">
                        Scraper is broken. Immediate attention required.
                      </div>
                    )}
                    {healthStatus === 'unknown' && (
                      <div className="vd-health-reason">
                        No scrape data yet. Run a test to verify scraper configuration.
                      </div>
                    )}
                  </div>
                </div>

                {/* Default sidebar: Performance */}
                <div className="vd-panel">
                  <div className="vd-panel-title">PERFORMANCE</div>
                  <div className="vd-perf-rows">
                    <div className="vd-perf-row"><span>Avg Runtime</span><span>{stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : '—'}</span></div>
                    <div className="vd-perf-row"><span>Fastest Run</span><span>{lastLog?.responseTimeMs != null ? `${lastLog.responseTimeMs}ms` : '—'}</span></div>
                    <div className="vd-perf-row"><span>Slowest Run</span><span>—</span></div>
                    <div className="vd-perf-row"><span>Products/Min</span><span>—</span></div>
                  </div>
                </div>

                {/* Default sidebar: Recent Activity */}
                <div className="vd-panel">
                  <div className="vd-panel-title">RECENT ACTIVITY</div>
                  <div className="vd-activity-list">
                    {recentLogs.slice(0, 8).map((log) => (
                      <div key={log.id} className="vd-activity-item">
                        <span className="vd-activity-dot" style={{ background: log.status === 'SUCCESS' ? 'var(--green)' : log.status === 'FAILED' ? 'var(--red)' : 'var(--orange)' }} />
                        <div className="vd-activity-info">
                          <span className="vd-activity-text">
                            {log.status === 'SUCCESS' ? 'Price updated' : log.status === 'FAILED' ? 'Scrape failed' : 'Pending'}
                            {log.price != null && ` — ₹${log.price.toLocaleString()}`}
                          </span>
                          <span className="vd-activity-time">{timeAgo(log.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                    {recentLogs.length === 0 && <div className="vd-empty-sm">No recent activity</div>}
                  </div>
                </div>

                {/* Default sidebar: Config History */}
                <div className="vd-panel">
                  <div className="vd-panel-title">CONFIG HISTORY</div>
                  <div className="vd-config-history">
                    <div className="vd-ch-item">
                      <span className="vd-ch-dot" />
                      <div className="vd-ch-info">
                        <span className="vd-ch-text">Version v{vendor.scraperVersion}</span>
                        <span className="vd-ch-time">{vendor.updatedAt ? timeAgo(vendor.updatedAt) : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ═══ STICKY BOTTOM BAR ═══ */}
        <div className="vd-footer">
          <div className="vd-footer-inner">
            <span className="vd-footer-status">
              <span className="vd-footer-dot" />
              Unsaved changes
            </span>
            <div className="vd-footer-actions">
              {activeTab === 'scheduler' && (
                <>
                  <button type="button" className="btn-secondary btn-sm">RUN PRICE CHECK</button>
                  <button type="button" className="btn-secondary btn-sm">RUN STOCK CHECK</button>
                </>
              )}
              <button type="button" className="btn-secondary btn-sm" onClick={() => router.push('/admin/vendors')}>CANCEL</button>
              <button type="button" className="btn-primary btn-sm" disabled={pending} onClick={() => document.querySelector<HTMLFormElement>('#vendor-form')?.requestSubmit()}>
                {pending ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DELETE MODAL ═══ */}
      {showDeleteModal && (
        <div className="vd-modal-backdrop">
          <div className="vd-modal">
            <div className="vd-modal-title">CONFIRM DELETION</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 12 }}>
              This will permanently delete <strong style={{ color: 'var(--text)' }}>{vendor.name}</strong> and all its product listings.
            </p>
            <input type="password" placeholder="Enter password" value={deletePassword}
              onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(); }}
              className="admin-input" autoFocus />
            {deleteError && <p style={{ fontSize: '0.7rem', color: 'var(--red)', marginTop: 6 }}>{deleteError}</p>}
            <div className="vd-btn-row" style={{ marginTop: 16 }}>
              <button onClick={handleDelete} disabled={!deletePassword || deleting} className="btn-danger btn-sm" style={{ flex: 1 }}>
                {deleting ? 'DELETING...' : 'DELETE'}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }} className="btn-secondary btn-sm" style={{ flex: 1 }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getLabel(schedule: string): string {
  const labels: Record<string, string> = {
    manual: 'Manual',
    'every-1h': 'Every Hour',
    'every-2h': 'Every 2 Hours',
    'every-3h': 'Every 3 Hours',
    'every-6h': 'Every 6 Hours',
    'every-12h': 'Every 12 Hours',
    daily: 'Daily',
    'every-5m': 'Every 5 Min',
    'every-10m': 'Every 10 Min',
    'every-15m': 'Every 15 Min',
    'every-30m': 'Every 30 Min',
    custom: 'Custom',
  };
  return labels[schedule] ?? schedule;
}

function requestsPerDay(schedule: string): number {
  const map: Record<string, number> = {
    manual: 0,
    'every-1h': 24,
    'every-2h': 12,
    'every-3h': 8,
    'every-6h': 4,
    'every-12h': 2,
    daily: 1,
    'every-5m': 288,
    'every-10m': 144,
    'every-15m': 96,
    'every-30m': 48,
    custom: 24,
  };
  return map[schedule] ?? 0;
}
