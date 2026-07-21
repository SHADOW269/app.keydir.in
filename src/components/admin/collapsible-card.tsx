'use client';

import { usePersistentState } from './hooks/use-persistent-state';

interface Props {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  id?: string;
  badge?: string;
  children: React.ReactNode;
}

const STORAGE_KEY = 'kb-cards';

export function CollapsibleCard({ title, icon, defaultOpen = true, id, badge, children }: Props) {
  const cardId = id || title.toLowerCase().replace(/\s+/g, '-');
  const [openMap, setOpenMap] = usePersistentState<Record<string, boolean>>(STORAGE_KEY, {});
  const open = cardId in openMap ? openMap[cardId] : defaultOpen;

  const toggle = () => {
    setOpenMap((prev) => ({ ...prev, [cardId]: !open }));
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
