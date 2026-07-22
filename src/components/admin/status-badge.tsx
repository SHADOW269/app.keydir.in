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

import { AVAILABILITY_MAP } from '@/lib/constants';

const SCRAPE_STATUS: Record<string, { label: string; cls: string; icon?: string }> = {
  SUCCESS: { label: 'In Stock', cls: 'b-green', icon: '✓' },
  ...Object.fromEntries(Object.entries(AVAILABILITY_MAP).map(([k, v]) => [k, { label: v.label, cls: v.class, icon: v.icon }])),
};

export function ScraperStatusBadge({ status, size }: ScraperStatusBadgeProps) {
  const s = SCRAPE_STATUS[status] ?? { label: status || 'Unknown', cls: 'b-dim' };
  return <StatusBadge label={s.label} variant={s.cls.replace('b-', '') as StatusBadgeProps['variant']} icon={s.icon} size={size} />;
}
