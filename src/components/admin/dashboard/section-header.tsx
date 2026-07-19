import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  span?: number;
}

export function SectionHeader({ title, description, action, span = 12 }: SectionHeaderProps) {
  return (
    <div className="dash-section-header" style={{ gridColumn: `span ${span}` }}>
      <div>
        <h2 className="dash-section-title">{title}</h2>
        {description && <p className="dash-section-desc">{description}</p>}
      </div>
      {action && <div className="dash-section-action">{action}</div>}
    </div>
  );
}
