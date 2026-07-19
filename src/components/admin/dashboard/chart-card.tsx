import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  span?: number;
  height?: number;
  action?: ReactNode;
}

export function ChartCard({ title, subtitle, children, span = 6, height = 280, action }: ChartCardProps) {
  return (
    <div className="dash-chart-card" style={{ gridColumn: `span ${span}` }}>
      <div className="dash-chart-header">
        <div>
          <div className="dash-chart-title">{title}</div>
          {subtitle && <div className="dash-chart-subtitle">{subtitle}</div>}
        </div>
        {action && <div className="dash-chart-action">{action}</div>}
      </div>
      <div className="dash-chart-body" style={{ height }}>
        {children}
      </div>
    </div>
  );
}
