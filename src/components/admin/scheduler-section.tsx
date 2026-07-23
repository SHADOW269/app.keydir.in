'use client';

interface LogEntry {
  id: string;
  status: string;
  createdAt: string;
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
  windowStart: string;
  setWindowStart: (v: string) => void;
  windowEnd: string;
  setWindowEnd: (v: string) => void;
  lastLog: LogEntry | undefined;
  healthStatus: string;
  onSave: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'every-15m', label: 'Every 15 Minutes' },
  { value: 'every-30m', label: 'Every 30 Minutes' },
  { value: 'every-1h', label: 'Every Hour' },
  { value: 'every-2h', label: 'Every 2 Hours' },
  { value: 'every-4h', label: 'Every 4 Hours' },
  { value: 'every-6h', label: 'Every 6 Hours' },
  { value: 'every-12h', label: 'Every 12 Hours' },
  { value: 'daily', label: 'Once Daily' },
  { value: 'twice-daily', label: 'Twice Daily' },
  { value: 'weekly', label: 'Weekly' },
];

function formatTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return isToday ? `Today ${time}` : time;
}

function nextRunTime(
  priceSchedule: string,
  stockSchedule: string,
  lastLog: LogEntry | undefined,
): string {
  if (!lastLog) return '\u2014';

  const intervals: Record<string, number> = {
    'every-15m': 15,
    'every-30m': 30,
    'every-1h': 60,
    'every-2h': 120,
    'every-4h': 240,
    'every-6h': 360,
    'every-12h': 720,
    daily: 1440,
    'twice-daily': 720,
    weekly: 10080,
  };

  const priceMins = intervals[priceSchedule] ?? Infinity;
  const stockMins = intervals[stockSchedule] ?? Infinity;
  const nextMins = Math.min(priceMins, stockMins);

  if (nextMins === Infinity) return '\u2014';

  const next = new Date(
    new Date(lastLog.createdAt).getTime() + nextMins * 60000,
  );
  return formatTime(next);
}

export function SchedulerSection({
  priceEnabled,
  setPriceEnabled,
  priceSchedule,
  setPriceSchedule,
  stockEnabled,
  setStockEnabled,
  stockSchedule,
  setStockSchedule,
  windowStart,
  setWindowStart,
  windowEnd,
  setWindowEnd,
  lastLog,
  onSave,
}: Props) {
  return (
    <div className="sch-s">
      {/* ── Operating Hours ── */}
      <div className="sch-s-card">
        <div className="sch-s-head">Operating Hours</div>
        <div className="sch-s-body">
          <div className="sch-s-row">
            <div className="admin-field">
              <label className="admin-label">Start Time</label>
              <input
                type="time"
                className="admin-input"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">End Time</label>
              <input
                type="time"
                className="admin-input"
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
              />
            </div>
          </div>
          <p className="sch-s-note">
            The scraper will only run during these hours.
          </p>
        </div>
      </div>

      {/* ── Price Monitoring ── */}
      <div className="sch-s-card">
        <div className="sch-s-head">Price Monitoring</div>
        <div className="sch-s-body">
          <label className="filter-option sch-s-toggle">
            <input
              type="checkbox"
              checked={priceEnabled}
              onChange={(e) => setPriceEnabled(e.target.checked)}
            />
            <span className="admin-label" style={{ margin: 0 }}>
              {priceEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
          <div className="sch-s-freq">
            <label className="admin-label">Frequency</label>
            <select
              className="admin-input"
              value={priceSchedule}
              onChange={(e) => setPriceSchedule(e.target.value)}
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stock Monitoring ── */}
      <div className="sch-s-card">
        <div className="sch-s-head">Stock Monitoring</div>
        <div className="sch-s-body">
          <label className="filter-option sch-s-toggle">
            <input
              type="checkbox"
              checked={stockEnabled}
              onChange={(e) => setStockEnabled(e.target.checked)}
            />
            <span className="admin-label" style={{ margin: 0 }}>
              {stockEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
          <div className="sch-s-freq">
            <label className="admin-label">Frequency</label>
            <select
              className="admin-input"
              value={stockSchedule}
              onChange={(e) => setStockSchedule(e.target.value)}
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Status ── */}
      <div className="sch-s-card">
        <div className="sch-s-head">Status</div>
        <div className="sch-s-body">
          <div className="sch-s-status">
            <div className="sch-s-status-item">
              <span className="sch-s-status-label">Last Run</span>
              <span className="sch-s-status-value">
                {lastLog ? formatTime(new Date(lastLog.createdAt)) : '\u2014'}
              </span>
            </div>
            <div className="sch-s-status-item">
              <span className="sch-s-status-label">Next Run</span>
              <span className="sch-s-status-value">
                {nextRunTime(priceSchedule, stockSchedule, lastLog)}
              </span>
            </div>
            <div className="sch-s-status-item">
              <span className="sch-s-status-label">Last Status</span>
              <span
                className={`sch-s-status-value ${
                  lastLog?.status === 'success'
                    ? 'sch-s-status-value--ok'
                    : 'sch-s-status-value--err'
                }`}
              >
                {lastLog
                  ? lastLog.status === 'success'
                    ? '\u2713 Success'
                    : '\u2716 Failed'
                  : '\u2014'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save ── */}
      <div className="sch-s-save">
        <button type="button" className="btn-primary" onClick={onSave}>
          Save Settings {'\u2192'}
        </button>
      </div>
    </div>
  );
}
