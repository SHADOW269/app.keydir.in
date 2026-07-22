'use client';

import { timeAgo } from '@/lib/utils';

interface LogEntry {
  createdAt: string;
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

interface Props {
  priceEnabled: boolean;
  setPriceEnabled: (v: boolean) => void;
  priceSchedule: string;
  setPriceSchedule: (v: string) => void;
  stockEnabled: boolean;
  setStockEnabled: (v: boolean) => void;
  stockSchedule: string;
  setStockSchedule: (v: string) => void;
  delayMin: number;
  setDelayMin: (v: number) => void;
  delayMax: number;
  setDelayMax: (v: number) => void;
  maxRpm: number;
  setMaxRpm: (v: number) => void;
  maxRph: number;
  setMaxRph: (v: number) => void;
  concurrency: number;
  setConcurrency: (v: number) => void;
  retryAttempts: number;
  setRetryAttempts: (v: number) => void;
  quietStart: string;
  setQuietStart: (v: string) => void;
  quietEnd: string;
  setQuietEnd: (v: string) => void;
  windowStart: string;
  setWindowStart: (v: string) => void;
  windowEnd: string;
  setWindowEnd: (v: string) => void;
  healthStatus: string;
  lastLog: LogEntry | undefined;
}

export function SchedulerSection({
  priceEnabled, setPriceEnabled, priceSchedule, setPriceSchedule,
  stockEnabled, setStockEnabled, stockSchedule, setStockSchedule,
  delayMin, setDelayMin, delayMax, setDelayMax,
  maxRpm, setMaxRpm, maxRph, setMaxRph,
  concurrency, setConcurrency, retryAttempts, setRetryAttempts,
  quietStart, setQuietStart, quietEnd, setQuietEnd,
  windowStart, setWindowStart, windowEnd, setWindowEnd,
  healthStatus, lastLog,
}: Props) {
  return (
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
                <span>{lastLog ? `Last: ${timeAgo(new Date(lastLog.createdAt))}` : 'No runs'}</span>
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
                <span>{lastLog ? `Last: ${timeAgo(new Date(lastLog.createdAt))}` : 'No runs'}</span>
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
  );
}
