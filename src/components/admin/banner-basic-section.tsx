'use client';

import { Card } from './admin-card';

const STATUS = [
  { v: 'draft', l: 'Draft', c: 'var(--text-muted)' },
  { v: 'active', l: 'Active', c: 'var(--green)' },
  { v: 'paused', l: 'Paused', c: 'var(--orange)' },
  { v: 'expired', l: 'Expired', c: 'var(--red)' },
];

interface Props {
  title: string;
  onTitleChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  prio: number;
  onPrioChange: (v: number) => void;
}

export function BannerBasicSection({ title, onTitleChange, status, onStatusChange, prio, onPrioChange }: Props) {
  return (
    <Card t="Basic Information">
      <div className="ce-field">
        <label className="ce-lb">Banner Name</label>
        <input className="admin-input" value={title} onChange={e => onTitleChange(e.target.value)} placeholder="e.g. Summer Sale 2026" />
      </div>
      <div className="ce-2c">
        <div className="ce-field">
          <label className="ce-lb">Status</label>
          <div className="sp">
            {STATUS.map(s => (
              <button key={s.v} type="button" onClick={() => onStatusChange(s.v)}
                className={`sp-b ${status === s.v ? 'on' : ''}`}
                style={status === s.v ? { borderColor: s.c, color: s.c } : undefined}>
                <i className="sp-dot" style={{ background: s.c }} />{s.l}
              </button>
            ))}
          </div>
        </div>
        <div className="ce-field">
          <label className="ce-lb">Priority</label>
          <input className="admin-input" type="number" min={0} value={prio} onChange={e => onPrioChange(parseInt(e.target.value) || 0)} />
          <span className="ce-hi">Lower number = shown first</span>
        </div>
      </div>
    </Card>
  );
}
