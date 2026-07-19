'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  id?: string;
  badge?: string;
  children: React.ReactNode;
}

const STORAGE_KEY = 'kb-cards';

function loadOpenState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveOpenState(state: Record<string, boolean>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function CollapsibleCard({ title, icon, defaultOpen = true, id, badge, children }: Props) {
  const cardId = id || title.toLowerCase().replace(/\s+/g, '-');
  const [open, setOpen] = useState(defaultOpen);
  const initialized = useRef(false);

  // Load persisted state
  useEffect(() => {
    const saved = loadOpenState();
    if (cardId in saved) setOpen(saved[cardId]);
    initialized.current = true;
  }, [cardId]);

  // Save state on toggle
  const toggle = () => {
    const next = !open;
    setOpen(next);
    const saved = loadOpenState();
    saved[cardId] = next;
    saveOpenState(saved);
  };

  return (
    <div className={`cc-card ${open ? 'cc-card--open' : ''}`}>
      <button type="button" className="cc-header" onClick={toggle}>
        <div className="cc-header-left">
          {icon && <span className="cc-icon">{icon}</span>}
          <span className="cc-title">{title}</span>
          {badge && <span className="cc-badge">{badge}</span>}
        </div>
        <span className={`cc-chevron ${open ? 'cc-chevron--open' : ''}`}>›</span>
      </button>
      {open && <div className="cc-body">{children}</div>}
    </div>
  );
}
