'use client';

import { useRouter } from 'next/navigation';
import { timeAgo } from '@/lib/utils';

interface Vendor {
  name: string;
  logo: string | null;
  website: string;
  enabled: boolean;
  scraperVersion: number;
}

interface Stats {
  productCount: number;
  successRate: number | null;
}

interface LogEntry {
  createdAt: string;
}

interface Props {
  vendor: Vendor;
  stats: Stats;
  lastLog: LogEntry | undefined;
  healthColor: string;
  healthLabel: string;
  pending: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function VendorHeader({ vendor, stats, lastLog, healthColor, healthLabel, pending, onSave, onCancel, onDelete }: Props) {
  const router = useRouter();
  return (
    <div className="vd-hd">
      <div className="vd-hd-l">
        {vendor.logo ? (
          <img src={vendor.logo} alt={vendor.name} className="vd-logo" />
        ) : (
          <div className="vd-logo-placeholder">{vendor.name.charAt(0)}</div>
        )}
        <div className="vd-hd-info">
          <span className="vd-hd-name">{vendor.name}</span>
          <span className="ce-hd-badge" style={{ borderColor: vendor.enabled ? 'var(--green)' : 'var(--text-muted)', color: vendor.enabled ? 'var(--green)' : 'var(--text-muted)' }}>
            {vendor.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <span className="vd-hd-url">{vendor.website}</span>
          <div className="vd-hd-meta">
            <span className="vd-hd-meta-item">Products: {stats.productCount}</span>
            <span className="vd-hd-meta-sep">·</span>
            <span className="vd-hd-meta-item">Last Scrape: {lastLog ? timeAgo(new Date(lastLog.createdAt)) : '—'}</span>
            <span className="vd-hd-meta-sep">·</span>
            <span className="vd-hd-meta-item" style={{ color: healthColor }}>Success: {stats.successRate !== null ? `${stats.successRate}%` : '—'}</span>
            <span className="vd-hd-meta-sep">·</span>
            <span className="vd-hd-meta-item">Version: v{vendor.scraperVersion}</span>
          </div>
        </div>
      </div>
      <div className="vd-hd-r">
        <button type="button" className="ce-toolbar-btn ce-toolbar-btn-primary" disabled={pending} onClick={() => document.querySelector<HTMLFormElement>('#vendor-form')?.requestSubmit()}>
          {pending ? 'Saving…' : 'SAVE'}
        </button>
        <button type="button" className="ce-toolbar-btn" onClick={() => router.push('/admin/vendors')}>
          CANCEL
        </button>
        <button type="button" className="ce-toolbar-btn ce-toolbar-btn-danger" onClick={onDelete}>
          DELETE
        </button>
      </div>
    </div>
  );
}
