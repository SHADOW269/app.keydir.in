'use client';

import { useState } from 'react';

export function ChipSelect({ options, value, onChange, name }: { options: string[]; value: string[]; onChange: (v: string[]) => void; name: string }) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div className="kb-chip-grid">
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      {options.map((opt) => (
        <button key={opt} type="button" className={`kb-chip ${value.includes(opt) ? 'active' : ''}`} onClick={() => toggle(opt)}>
          <span className="kb-chip-check">{value.includes(opt) ? '☑' : '☐'}</span>
          {opt}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, name, checked, onChange }: { label: string; name: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="kb-toggle-row">
      <span className="kb-toggle-label">{label}</span>
      <input type="hidden" name={name} value={checked ? 'true' : 'false'} />
      <div className="kb-toggle-right">
        <span className={`kb-toggle-status ${checked ? 'on' : ''}`}>{checked ? 'Yes' : 'No'}</span>
        <button type="button" className={`kb-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-label={label}>
          <span className="kb-switch-thumb" />
        </button>
      </div>
    </div>
  );
}

export function TagInput({ label, value, onChange, placeholder, name }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; name?: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) { onChange([...value, trimmed]); setInput(''); }
  };
  return (
    <div className="kb-tag-input-wrap">
      {name && <input type="hidden" name={name} value={JSON.stringify(value)} />}
      <label className="kb-field-label">{label}</label>
      <div className="kb-tag-chips">
        {value.map((tag) => (
          <span key={tag} className="kb-tag-chip">
            {tag}
            <button type="button" className="kb-tag-remove" onClick={() => onChange(value.filter((t) => t !== tag))}>×</button>
          </span>
        ))}
        <input
          type="text"
          className="kb-tag-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={placeholder || `+ Add ${label}`}
        />
      </div>
    </div>
  );
}

export function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`kb-field ${wide ? 'full-width' : ''}`}>
      <label className="kb-field-label">{label}</label>
      {children}
    </div>
  );
}
