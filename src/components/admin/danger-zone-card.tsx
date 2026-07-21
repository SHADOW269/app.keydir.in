'use client';

interface DangerZoneCardProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onAction: () => void;
}

export function DangerZoneCard({ title = 'Danger Zone', description, buttonLabel, onAction }: DangerZoneCardProps) {
  return (
    <div className="ce-danger">
      <div className="ce-danger-inner">
        <div className="ce-danger-text">
          <span className="ce-danger-title">{title}</span>
          {description && <span className="ce-danger-desc">{description}</span>}
        </div>
        <button type="button" onClick={onAction} className="ce-toolbar-btn ce-toolbar-btn-danger">{buttonLabel || 'Delete'}</button>
      </div>
    </div>
  );
}
