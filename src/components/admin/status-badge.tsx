'use client';

interface StatusBadgeProps {
  label: string;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'orange' | 'dim';
  icon?: string;
  size?: 'sm' | 'md';
}

const VARIANT_CLASSES: Record<string, string> = {
  green: 'b-green',
  yellow: 'b-yellow',
  red: 'b-red',
  blue: 'b-blue',
  orange: 'b-orange',
  dim: 'b-dim',
};

export function StatusBadge({ label, variant = 'dim', icon, size = 'md' }: StatusBadgeProps) {
  const cls = VARIANT_CLASSES[variant] || variant;
  return (
    <span className={`badge ${size === 'sm' ? 'badge-sm' : ''} ${cls}`}>
      {icon && <>{icon} </>}{label}
    </span>
  );
}

interface ScraperStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const SCRAPE_STATUS: Record<string, { label: string; cls: string; icon?: string }> = {
  SUCCESS: { label: 'In Stock', cls: 'b-green', icon: '✓' },
  PREORDER: { label: 'Preorder', cls: 'b-yellow', icon: '◷' },
  GROUP_BUY: { label: 'Group Buy', cls: 'b-blue', icon: '◎' },
  COMING_SOON: { label: 'Coming Soon', cls: 'b-orange', icon: '⏳' },
  OUT_OF_STOCK: { label: 'Out of Stock', cls: 'b-red', icon: '✕' },
  in_stock: { label: 'In Stock', cls: 'b-green', icon: '✓' },
  preorder: { label: 'Preorder', cls: 'b-yellow', icon: '◷' },
  group_buy: { label: 'Group Buy', cls: 'b-blue', icon: '◎' },
  coming_soon: { label: 'Coming Soon', cls: 'b-orange', icon: '⏳' },
  out_of_stock: { label: 'Out of Stock', cls: 'b-red', icon: '✕' },
};

export function ScraperStatusBadge({ status, size }: ScraperStatusBadgeProps) {
  const s = SCRAPE_STATUS[status] ?? { label: status || 'Unknown', cls: 'b-dim' };
  return <StatusBadge label={s.label} variant={s.cls.replace('b-', '') as StatusBadgeProps['variant']} icon={s.icon} size={size} />;
}
