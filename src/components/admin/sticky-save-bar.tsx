'use client';

import { useEffect, useCallback, useMemo } from 'react';

interface StickySaveBarProps {
  hasChanges?: boolean;
  visible?: boolean;
  isSaving?: boolean;
  pending?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onDiscard?: () => void;
  onDelete?: () => void;
  isEdit?: boolean;
  saveLabel?: string;
  formId?: string;
}

export function StickySaveBar({
  hasChanges,
  visible,
  isSaving,
  pending,
  onSave,
  onCancel,
  onDiscard,
  onDelete,
  isEdit = false,
  saveLabel,
  formId,
}: StickySaveBarProps) {
  const show = hasChanges ?? visible ?? false;
  const saving = isSaving ?? pending ?? false;

  const handleSave = useMemo(() => onSave ?? (() => {
    if (formId) {
      const form = document.getElementById(formId) as HTMLFormElement;
      form?.requestSubmit();
    }
  }), [onSave, formId]);

  const handleCancel = useMemo(() => onCancel ?? onDiscard ?? (() => {}), [onCancel, onDiscard]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (show && !saving) handleSave();
    }
    if (e.key === 'Escape' && show) {
      handleCancel();
    }
  }, [show, saving, handleSave, handleCancel]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!show && !saving) return null;

  return (
    <div className="sticky-save-bar">
      <div className="sticky-save-bar-inner">
        <span className="sticky-save-bar-label">
          {saving ? 'Saving…' : 'Unsaved changes'}
          <span className="sticky-save-bar-hint">Ctrl+S to save · Esc to cancel</span>
        </span>
        <div className="sticky-save-bar-actions">
          {isEdit && onDelete && (
            <button type="button" onClick={onDelete} className="btn-danger btn-sm">
              Delete
            </button>
          )}
          <button type="button" onClick={handleCancel} disabled={saving} className="btn-secondary btn-sm">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary btn-sm">
            {saving ? 'Saving…' : saveLabel || 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
