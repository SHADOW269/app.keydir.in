'use client';

interface StickySaveBarProps {
  visible: boolean;
  pending?: boolean;
  saveLabel?: string;
  onDiscard: () => void;
  formId?: string;
}

export function StickySaveBar({ visible, pending, saveLabel, onDiscard, formId }: StickySaveBarProps) {
  return (
    <div className={`pe-save-bar ${visible ? 'visible' : ''}`}>
      <div className="pe-save-bar-label">
        <span className="pe-save-bar-dot" />
        Unsaved Changes
      </div>
      <div className="pe-save-bar-actions">
        <button type="button" onClick={onDiscard} className="btn-secondary">CANCEL</button>
        {formId && (
          <button type="submit" form={formId} disabled={pending} className="btn-primary">
            {pending ? 'SAVING...' : (saveLabel || 'SAVE')}
          </button>
        )}
      </div>
    </div>
  );
}
