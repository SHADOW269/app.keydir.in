'use client';

import Link from 'next/link';

interface AdminHeaderProps {
  breadcrumb: string;
  title: string;
  subtitle?: string;
  icon?: string;
  pending?: boolean;
  pendingLabel?: string;
  saveLabel?: string;
  cancelHref?: string;
  isEdit?: boolean;
  onDelete?: () => void;
  extraActions?: React.ReactNode;
  formId?: string;
}

export function AdminHeader({
  breadcrumb, title, subtitle, pending, pendingLabel, saveLabel,
  cancelHref, isEdit, onDelete, extraActions, formId,
}: AdminHeaderProps) {
  return (
    <>
      <div className="pe-header">
        <div className="pe-header-left">
          <div className="pe-breadcrumb">
            <span>KEYBOARD DATABASE</span>
            <span className="pe-bc-sep">/</span>
            <span>{breadcrumb}</span>
          </div>
          <h1 className="pe-title">{title}</h1>
          {subtitle && <div className="pe-subtitle">{subtitle}</div>}
        </div>
        <div className="pe-header-actions">
          {cancelHref && <Link href={cancelHref} className="btn-secondary">CANCEL</Link>}
          {isEdit && onDelete && (
            <button type="button" onClick={onDelete} className="btn-danger">DELETE</button>
          )}
          {extraActions}
          {formId && (
            <button type="submit" form={formId} disabled={pending} className="btn-primary">
              {pending ? (pendingLabel || 'SAVING...') : (saveLabel || 'SAVE')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

interface EditorHeaderProps {
  title: string;
  stats?: { label: string; value: string | number }[];
  subtitle?: string;
  pending?: boolean;
  cancelHref?: string;
  isEdit?: boolean;
  onDelete?: () => void;
  onSave?: () => void;
  formId?: string;
}

export function EditorHeader({
  title, stats, subtitle, pending, cancelHref, isEdit, onDelete, onSave, formId,
}: EditorHeaderProps) {
  return (
    <header className="ce-hd">
      <div className="ce-hd-l">
        <div className="ce-hd-title-row">
          <span className="ce-name">{title}</span>
        </div>
        {stats ? (
          <div className="ce-hd-stats">
            {stats.map((s, i) => (
              <span key={s.label}>
                {i > 0 && <span className="ce-hd-stat-sep">•</span>}
                <span className="ce-hd-stat">{s.label} <strong>{s.value}</strong></span>
              </span>
            ))}
          </div>
        ) : subtitle ? (
          <div className="ce-hd-subtitle">{subtitle}</div>
        ) : null}
      </div>
      <div className="ce-hd-r">
        {cancelHref && (
          <button type="button" onClick={() => window.location.href = cancelHref} className="ce-toolbar-btn">Cancel</button>
        )}
        {onSave && (
          <button type={formId ? 'submit' : 'button'} form={formId} disabled={pending} className="ce-toolbar-btn ce-toolbar-btn-primary">
            {pending ? 'Saving…' : isEdit ? 'SAVE' : 'CREATE'}
          </button>
        )}
        {isEdit && onDelete && (
          <button type="button" onClick={onDelete} className="ce-toolbar-btn ce-toolbar-btn-danger">DELETE</button>
        )}
      </div>
    </header>
  );
}
