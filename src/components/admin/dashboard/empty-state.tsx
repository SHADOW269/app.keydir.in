import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  span?: number;
}

export function EmptyState({ icon = '📋', title, description, action, span = 12 }: EmptyStateProps) {
  return (
    <div className="dash-empty-state" style={{ gridColumn: `span ${span}` }}>
      <div className="dash-empty-icon">{icon}</div>
      <div className="dash-empty-title">{title}</div>
      {description && <div className="dash-empty-desc">{description}</div>}
      {action && <div className="dash-empty-action">{action}</div>}
    </div>
  );
}
