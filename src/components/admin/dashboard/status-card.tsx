interface StatusCardProps {
  title: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  details?: string;
  span?: number;
}

const STATUS_STYLES = {
  healthy: { color: 'var(--green)', icon: '●', label: 'Healthy' },
  warning: { color: 'var(--orange)', icon: '●', label: 'Warning' },
  error: { color: 'var(--red)', icon: '●', label: 'Error' },
  unknown: { color: 'var(--text-muted)', icon: '○', label: 'Unknown' },
};

export function StatusCard({ title, status, details, span = 3 }: StatusCardProps) {
  const s = STATUS_STYLES[status];
  return (
    <div className="dash-status-card" style={{ gridColumn: `span ${span}` }}>
      <div className="dash-status-header">
        <span className="dash-status-dot" style={{ color: s.color }}>{s.icon}</span>
        <span className="dash-status-title">{title}</span>
      </div>
      <div className="dash-status-label" style={{ color: s.color }}>{s.label}</div>
      {details && <div className="dash-status-details">{details}</div>}
    </div>
  );
}
