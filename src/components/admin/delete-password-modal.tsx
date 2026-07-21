'use client';

interface Props {
  title?: string;
  description: React.ReactNode;
  password: string;
  error: string | null;
  pending: boolean;
  onPasswordChange: (password: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  inputClassName?: string;
  errorClassName?: string;
  buttonClassName?: string;
}

export function DeletePasswordModal({
  title = 'Confirm Deletion',
  description,
  password,
  error,
  pending,
  onPasswordChange,
  onConfirm,
  onCancel,
  onKeyDown,
  className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4',
  inputClassName = 'pe-input',
  errorClassName = 'pe-modal-error',
  buttonClassName,
}: Props) {
  const handleKeyDown = onKeyDown || ((e: React.KeyboardEvent) => { if (e.key === 'Enter') onConfirm(); });

  return (
    <div className={className}>
      <div className="neo-card max-w-sm w-full p-6">
        <h3 className="pe-modal-title">{title}</h3>
        <p className="pe-modal-text">{description}</p>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputClassName}
          autoFocus
        />
        {error && <p className={errorClassName}>{error}</p>}
        <div className="pe-modal-actions">
          <button
            onClick={onConfirm}
            disabled={!password || pending}
            className={buttonClassName || 'btn-danger flex-1'}
          >
            {pending ? 'DELETING...' : 'DELETE'}
          </button>
          <button onClick={onCancel} className="btn-secondary flex-1">CANCEL</button>
        </div>
      </div>
    </div>
  );
}
