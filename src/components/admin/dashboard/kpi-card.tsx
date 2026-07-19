interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon?: string;
  color?: string;
  span?: number;
}

export function KpiCard({ label, value, trend, icon, color = 'var(--yellow)', span = 3 }: KpiCardProps) {
  return (
    <div className="dash-kpi" style={{ gridColumn: `span ${span}` }}>
      <div className="dash-kpi-header">
        <span className="dash-kpi-label">{label}</span>
        {icon && <span className="dash-kpi-icon" style={{ color }}>{icon}</span>}
      </div>
      <div className="dash-kpi-value" style={{ color }}>{value}</div>
      {trend && (
        <div className={`dash-kpi-trend ${trend.positive ? 'positive' : 'negative'}`}>
          {trend.positive ? '▲' : '▼'} {trend.value}
        </div>
      )}
    </div>
  );
}
