'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  runAllScrapers, runFailedScrapers, retryFailedScrape, runVendorScrapers,
  getFailedLogs, getLatestPriceChanges, getActivityFeed,
  type FailedLogEntry, type PriceChangeEntry, type ActivityEntry,
} from '@/lib/admin/scraper-actions';

type VendorStat = {
  id: string; name: string; slug: string; logo: string | null; enabled: boolean;
  scraperEnabled: boolean; total: number; success: number; failed: number; pending: number;
  successRate: number; lastRun: Date | null; avgMs: number | null;
};

interface Props {
  vendors: { id: string; name: string; slug: string }[];
  vendorStats: VendorStat[];
  initialFailedLogs: FailedLogEntry[];
  initialPriceChanges: PriceChangeEntry[];
  initialActivity: ActivityEntry[];
  enabledVendors: number;
  lastRunTime: string;
}

export function ScraperOpsClient({
  vendors, vendorStats, initialFailedLogs, initialPriceChanges, initialActivity, enabledVendors, lastRunTime,
}: Props) {
  const [failedLogs, setFailedLogs] = useState(initialFailedLogs);
  const [priceChanges, setPriceChanges] = useState(initialPriceChanges);
  const [activity, setActivity] = useState(initialActivity);

  const searchParams = useSearchParams();
  const [logVendorFilter, setLogVendorFilter] = useState(searchParams.get('vendor') || '');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const refresh = useCallback(async () => {
    const [logs, prices, act] = await Promise.all([
      getFailedLogs({ vendor: logVendorFilter || undefined }),
      getLatestPriceChanges(),
      getActivityFeed(),
    ]);
    setFailedLogs(logs);
    setPriceChanges(prices);
    setActivity(act);
  }, [logVendorFilter]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const iv = setInterval(refresh, 30_000); return () => clearInterval(iv); }, [refresh]);

  async function handleAction(fn: () => Promise<{ message?: string; error?: string }>, label: string) {
    setActionLoading(label);
    setActionMsg(null);
    try {
      const res = await fn();
      setActionMsg({ type: res.error ? 'err' : 'ok', text: res.error || res.message || 'Done' });
      await refresh();
    } catch (e) {
      setActionMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed' });
    }
    setActionLoading(null);
    setTimeout(() => setActionMsg(null), 5000);
  }

  async function handleRetry(vpId: string) {
    setRetryingId(vpId);
    try { await retryFailedScrape(vpId); await refresh(); } catch {}
    setRetryingId(null);
  }

  function handleCopyError(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filteredLogs = failedLogs.filter((l) => !logVendorFilter || l.vendorSlug === logVendorFilter);
  const displayActivity = showAllActivity ? activity : activity.slice(0, 8);
  const isRunning = !!actionLoading;

  const actualPriceChanges = priceChanges.filter((ch) => ch.oldPrice !== ch.newPrice && ch.oldPrice > 0);
  const todayCount = actualPriceChanges.filter((ch) => {
    const d = new Date(ch.recordedAt);
    return d.toDateString() === new Date().toDateString();
  }).length;
  const hourCount = actualPriceChanges.filter((ch) =>
    Date.now() - new Date(ch.recordedAt).getTime() < 3600_000
  ).length;

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <div className="sop-hdr">
        <div className="sop-hdr-left">
          <div className="sop-hdr-title">SCRAPER <em className="sop-hdr-accent">OPERATIONS</em></div>
          <div className="sop-hdr-sub">Monitor, schedule and control product scraping.</div>
        </div>
        <div className="sop-hdr-right">
          <div className="sop-hdr-badge sop-live-badge">
            <span className="sop-live-dot" /> LIVE
          </div>
          <div className="sop-hdr-meta">
            <span className="sop-hdr-meta-label">Last Run</span>
            <span className="sop-hdr-meta-val">{lastRunTime}</span>
          </div>
          <div className="sop-hdr-meta">
            <span className="sop-hdr-meta-label">Cron</span>
            <span className="sop-hdr-meta-val sop-cron-status">Manual</span>
          </div>
          <div className="sop-hdr-actions">
            <button
              className="admin-btn admin-btn-primary sop-ctrl-btn"
              disabled={isRunning}
              onClick={() => handleAction(runAllScrapers, 'run-all')}
            >
              {actionLoading === 'run-all' ? '⏳...' : '▶ Run All'}
            </button>
            <button
              className="admin-btn sop-ctrl-btn sop-ctrl-btn-secondary"
              disabled={isRunning}
              onClick={() => handleAction(runFailedScrapers, 'run-failed')}
            >
              {actionLoading === 'run-failed' ? '⏳...' : '↻ Failed'}
            </button>
            <button className="admin-btn admin-btn-ghost sop-ctrl-btn" disabled title="Not yet implemented">⏸</button>
            <button className="admin-btn admin-btn-ghost sop-ctrl-btn" disabled title="Not yet implemented">▶</button>
            <button className="admin-btn admin-btn-danger sop-ctrl-btn" disabled title="Not yet implemented">■</button>
          </div>
        </div>
      </div>

      {/* ═══ MAIN 2-COLUMN GRID ═══ */}
      <div className="sop-main-grid">

        {/* ── LEFT COLUMN (70%) ── */}
        <div className="sop-left-col">

          {/* SCRAPER CONTROLS */}
          <div className="sop-card">
            <div className="sop-card-header">
              <span className="sop-card-title">Scraper Controls</span>
            </div>
            <div className="sop-card-body">
              {actionMsg && (
                <div className={`sop-toast ${actionMsg.type === 'ok' ? 'sop-toast-ok' : 'sop-toast-err'}`}>
                  {actionMsg.text}
                </div>
              )}
              <div className="sop-ctrl-vendor-row">
                <select
                  className="sop-select"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <button
                  className="admin-btn sop-ctrl-btn sop-ctrl-btn-secondary"
                  disabled={!selectedVendor || isRunning}
                  onClick={() => selectedVendor && handleAction(() => runVendorScrapers(selectedVendor), 'run-vendor')}
                >
                  {actionLoading === 'run-vendor' ? '⏳...' : 'Run Vendor'}
                </button>
              </div>
              <div className="sop-ctrl-queue">
                <div className="sop-queue-item">
                  <span className="sop-queue-dot sop-q-dot-green" /> Waiting
                  <span className="sop-queue-count">{enabledVendors}</span>
                </div>
                <div className="sop-queue-item">
                  <span className="sop-queue-dot sop-q-dot-yellow" /> Running
                  <span className="sop-queue-count">{isRunning ? '1' : '0'}</span>
                </div>
                <div className="sop-queue-item">
                  <span className="sop-queue-dot sop-q-dot-red" /> Failed
                  <span className="sop-queue-count">{failedLogs.length}</span>
                </div>
                <div className="sop-queue-item">
                  <span className="sop-queue-dot sop-q-dot-cyan" /> Completed
                  <span className="sop-queue-count">{initialActivity.filter((a) => a.color === 'var(--green)').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAILED LOGS */}
          <div className="sop-card sop-card-fixed">
            <div className="sop-card-header">
              <span className="sop-card-title">Failed Logs</span>
              <div className="sop-card-header-actions">
                <select className="sop-select sop-select-sm" value={logVendorFilter} onChange={(e) => setLogVendorFilter(e.target.value)}>
                  <option value="">All Vendors</option>
                  {vendors.map((v) => <option key={v.id} value={v.slug}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div className="sop-card-body sop-card-body-table">
              {filteredLogs.length === 0 ? (
                <div className="sop-empty-success">
                  <div className="sop-empty-success-icon">✓</div>
                  <div className="sop-empty-success-title">No failed scraping jobs.</div>
                  <div className="sop-empty-success-sub">Everything is operating normally.</div>
                </div>
              ) : (
                <div className="sop-table-wrap">
                  <table className="sop-table">
                    <thead>
                      <tr>
                        <th>Vendor</th><th>Product</th><th>Error</th><th>HTTP</th><th>Retries</th><th>Time</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, i) => (
                        <tr key={log.id} className={i % 2 === 0 ? 'sop-row-even' : 'sop-row-odd'}>
                          <td className="sop-td sop-td-bold">{log.vendorName}</td>
                          <td className="sop-td sop-td-trunc">{log.productName}</td>
                          <td className="sop-td sop-td-error sop-td-trunc">{log.error}</td>
                          <td className="sop-td sop-td-mono">{log.httpStatus || '—'}</td>
                          <td className="sop-td sop-td-mono">{log.retryCount}</td>
                          <td className="sop-td sop-td-time">{timeAgo(new Date(log.createdAt))}</td>
                          <td className="sop-td">
                            <div className="sop-row-actions">
                              <button
                                className="sop-icon-btn"
                                disabled={retryingId === log.id}
                                onClick={() => log.vendorProductId && handleRetry(log.vendorProductId)}
                                title="Retry"
                              >↻</button>
                              <button
                                className={`sop-icon-btn ${copiedId === log.id ? 'sop-icon-btn-ok' : ''}`}
                                onClick={() => handleCopyError(`${log.error} (${log.httpStatus || 'no HTTP'})`, log.id)}
                                title="Copy Error"
                              >{copiedId === log.id ? '✓' : '⧉'}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* LATEST PRICE CHANGES */}
          <div className="sop-card">
            <div className="sop-card-header">
              <span className="sop-card-title">Latest Price Changes</span>
              <div className="sop-card-header-actions">
                <span className="sop-price-stat">Today: <strong>{todayCount}</strong></span>
                <span className="sop-price-stat">Last Hour: <strong>{hourCount}</strong></span>
              </div>
            </div>
            <div className="sop-card-body sop-card-body-table">
              {actualPriceChanges.length === 0 ? (
                <div className="sop-empty-success">
                  <div className="sop-empty-success-icon">✓</div>
                  <div className="sop-empty-success-title">No price changes detected.</div>
                  <div className="sop-empty-success-sub">Everything is up to date.</div>
                </div>
              ) : (
                <div className="sop-table-wrap">
                  <table className="sop-table">
                    <thead>
                      <tr>
                        <th>Product</th><th>Vendor</th><th>Previous Price</th><th>Current Price</th><th>Change</th><th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actualPriceChanges.map((ch, i) => {
                        const diff = ch.newPrice - ch.oldPrice;
                        const isDown = diff < 0;
                        return (
                          <tr key={ch.id} className={`${i % 2 === 0 ? 'sop-row-even' : 'sop-row-odd'} sop-row-clickable`}>
                            <td className="sop-td sop-td-bold">{ch.productName}</td>
                            <td className="sop-td sop-td-dim">{ch.vendorName}</td>
                            <td className="sop-td sop-td-mono">₹{ch.oldPrice.toLocaleString('en-IN')}</td>
                            <td className="sop-td sop-td-mono sop-td-bold">₹{ch.newPrice.toLocaleString('en-IN')}</td>
                            <td className="sop-td">
                              <span className={`sop-price-change ${isDown ? 'sop-price-down' : 'sop-price-up'}`}>
                                {isDown ? '↓' : '↑'} ₹{Math.abs(diff).toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="sop-td sop-td-time">{timeAgo(new Date(ch.recordedAt))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (30%) ── */}
        <div className="sop-right-col">

          {/* QUEUE MONITOR */}
          <div className="sop-card sop-card-dark">
            <div className="sop-card-header">
              <span className="sop-card-title">Queue Monitor</span>
            </div>
            <div className="sop-card-body">
              <div className="sop-qm-rows">
                <div className="sop-qm-row">
                  <span className="sop-qm-label"><span className="sop-queue-dot sop-q-dot-green" /> Running</span>
                  <span className="sop-qm-val">{isRunning ? 1 : 0}</span>
                </div>
                <div className="sop-qm-row">
                  <span className="sop-qm-label"><span className="sop-queue-dot sop-q-dot-cyan" /> Waiting</span>
                  <span className="sop-qm-val">{enabledVendors}</span>
                </div>
                <div className="sop-qm-row">
                  <span className="sop-qm-label"><span className="sop-queue-dot sop-q-dot-green" /> Completed</span>
                  <span className="sop-qm-val">{initialActivity.filter((a) => a.color === 'var(--green)').length}</span>
                </div>
                <div className="sop-qm-row">
                  <span className="sop-qm-label"><span className="sop-queue-dot sop-q-dot-red" /> Failed</span>
                  <span className="sop-qm-val">{failedLogs.length}</span>
                </div>
              </div>
              <div className="sop-qm-progress">
                <div className="sop-qm-progress-label">Progress</div>
                <div className="sop-qm-bar">
                  <div className="sop-qm-bar-fill" style={{ width: isRunning ? '60%' : '100%' }} />
                </div>
              </div>
              <div className="sop-qm-eta">
                <span className="sop-qm-eta-label">Estimated Finish</span>
                <span className="sop-qm-eta-val">{isRunning ? '~2 min' : 'Done'}</span>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="sop-card sop-card-fixed">
            <div className="sop-card-header">
              <span className="sop-card-title">Recent Activity</span>
              <span className="sop-live-badge-inline"><span className="sop-live-dot" /> Live</span>
            </div>
            <div className="sop-card-body sop-activity-scroll">
              {displayActivity.length === 0 ? (
                <div className="sop-empty-state">
                  <div className="sop-empty-state-icon">○</div>
                  <div>No recent activity.</div>
                </div>
              ) : (
                <>
                  {displayActivity.map((item) => (
                    <div key={item.id} className="sop-activity-item">
                      <span className="sop-activity-icon" style={{ color: item.color }}>{item.icon}</span>
                      <div className="sop-activity-body">
                        <span className="sop-activity-text">{item.text}</span>
                        <span className="sop-activity-time">{item.time}</span>
                      </div>
                    </div>
                  ))}
                  {!showAllActivity && activity.length > 8 && (
                    <button className="sop-view-all-btn" onClick={() => setShowAllActivity(true)}>
                      View all activity →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* NEEDS REVIEW */}
          <div className="sop-card sop-card-orange">
            <div className="sop-card-header">
              <span className="sop-card-title">Needs Review</span>
            </div>
            <div className="sop-card-body">
              <div className="sop-review-items">
                <div className="sop-review-item">
                  <span className="sop-review-dot" style={{ background: 'var(--red)' }} />
                  <span className="sop-review-label">Missing Price</span>
                  <span className="sop-review-count">{failedLogs.filter((l) => l.error.toLowerCase().includes('price')).length}</span>
                </div>
                <div className="sop-review-item">
                  <span className="sop-review-dot" style={{ background: 'var(--yellow)' }} />
                  <span className="sop-review-label">Missing Stock</span>
                  <span className="sop-review-count">{failedLogs.filter((l) => l.error.toLowerCase().includes('stock') || l.error.toLowerCase().includes('availability')).length}</span>
                </div>
                <div className="sop-review-item">
                  <span className="sop-review-dot" style={{ background: 'var(--orange)' }} />
                  <span className="sop-review-label">Broken Selector</span>
                  <span className="sop-review-count">{failedLogs.filter((l) => l.error.toLowerCase().includes('selector') || l.error.toLowerCase().includes('not found')).length}</span>
                </div>
                <div className="sop-review-item">
                  <span className="sop-review-dot" style={{ background: 'var(--red)' }} />
                  <span className="sop-review-label">Cloudflare 403</span>
                  <span className="sop-review-count">{failedLogs.filter((l) => l.httpStatus === 403 || l.error.toLowerCase().includes('cloudflare')).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ VENDOR HEALTH ═══ */}
      <div className="sop-card sop-full sop-vendor-section">
        <div className="sop-card-header">
          <span className="sop-card-title">Vendor Health</span>
        </div>
        <div className="sop-card-body">
          <div className="sop-vendor-grid">
            {vendorStats.map((v) => {
              const isHealthy = v.successRate >= 90;
              const isPaused = !v.enabled;
              return (
                <div key={v.id} className={`sop-vcard ${isPaused ? 'sop-vcard-paused' : ''}`}>
                  <div className="sop-vcard-top">
                    <div className="sop-vcard-logo">{v.logo ? <img src={v.logo} alt="" /> : <span>◆</span>}</div>
                    <div className="sop-vcard-info">
                      <div className="sop-vcard-name">{v.name}</div>
                      <div className={`sop-vcard-status ${isHealthy ? 'sop-vs-healthy' : 'sop-vs-degraded'}`}>
                        {isPaused ? 'Paused' : isHealthy ? 'Healthy' : 'Degraded'}
                      </div>
                    </div>
                    <div className={`sop-vcard-dot ${v.enabled ? 'on' : 'off'}`} />
                  </div>
                  <div className="sop-vcard-health">
                    <div className="sop-health-bar">
                      <div
                        className="sop-health-fill"
                        style={{
                          width: `${v.successRate}%`,
                          background: isHealthy ? 'var(--green)' : v.successRate >= 70 ? 'var(--yellow)' : 'var(--red)',
                        }}
                      />
                    </div>
                    <span className="sop-health-pct" style={{ color: isHealthy ? 'var(--green)' : v.successRate >= 70 ? 'var(--yellow)' : 'var(--red)' }}>
                      {v.total > 0 ? `${v.successRate}%` : '—'}
                    </span>
                  </div>
                  <div className="sop-vcard-stats">
                    <div className="sop-vs"><span className="sop-vs-val">{v.total}</span><span className="sop-vs-lbl">Products</span></div>
                    <div className="sop-vs"><span className="sop-vs-val sop-vs-green">{v.success}</span><span className="sop-vs-lbl">Updated</span></div>
                    <div className="sop-vs"><span className="sop-vs-val" style={{ color: v.failed > 0 ? 'var(--red)' : 'var(--text-dim)' }}>{v.failed}</span><span className="sop-vs-lbl">Failed</span></div>
                    <div className="sop-vs"><span className="sop-vs-val">{v.avgMs != null ? `${v.avgMs}ms` : '—'}</span><span className="sop-vs-lbl">Avg Runtime</span></div>
                  </div>
                  <div className="sop-vcard-footer">
                    <span className="sop-vcard-last">Last Run: {v.lastRun ? timeAgo(v.lastRun) : 'Never'}</span>
                  </div>
                  <div className="sop-vcard-actions">
                    <a href={`/admin/vendors/${v.id}`} className="admin-btn admin-btn-ghost sop-vcard-btn">Configure</a>
                    <a href={`/admin/vendors/${v.id}?tab=logs`} className="admin-btn admin-btn-ghost sop-vcard-btn">Logs</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}
