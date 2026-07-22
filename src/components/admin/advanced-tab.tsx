'use client';

import { CollapsibleCard } from './collapsible-card';

interface Vendor {
  scraperVersion: number;
  customHeaders: string | null;
}

interface Props {
  vendor: Vendor;
}

export function AdvancedTab({ vendor }: Props) {
  return (
    <>
      <CollapsibleCard title="Vendor Metadata" icon="⚙" id="vd-advanced-meta">
        <div className="vd-form-grid">
          <div className="admin-field">
            <label className="admin-label">Version</label>
            <input className="admin-input" value={`v${vendor.scraperVersion}`} readOnly />
          </div>
          <div className="admin-field">
            <label className="admin-label">Environment</label>
            <input className="admin-input" value="production" readOnly />
          </div>
          <div className="admin-field">
            <label className="admin-label">Worker Assignment</label>
            <input className="admin-input" defaultValue="default" />
          </div>
          <div className="admin-field">
            <label className="admin-label">Priority</label>
            <input name="priority" type="number" defaultValue={5} className="admin-input" min={1} max={10} />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Custom Headers" icon="≡" id="vd-advanced-headers" defaultOpen={false}>
        <div className="admin-field">
          <label className="admin-label">Headers (JSON)</label>
          <textarea name="customHeaders" rows={5} defaultValue={vendor.customHeaders ?? ''} className="admin-input"
            style={{ fontFamily: 'var(--f-m)', fontSize: '0.7rem' }} placeholder='{"Authorization": "..."}' />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="JSON Configuration" icon="◇" id="vd-advanced-json" defaultOpen={false}>
        <div className="admin-field">
          <label className="admin-label">Full Configuration (JSON)</label>
          <textarea readOnly rows={10} className="admin-input" style={{ fontFamily: 'var(--f-m)', fontSize: '0.65rem', resize: 'vertical' }}
            value={JSON.stringify(vendor, null, 2)} />
        </div>
        <div className="vd-btn-row" style={{ marginTop: 12 }}>
          <button type="button" className="btn-secondary btn-sm">IMPORT</button>
          <button type="button" className="btn-secondary btn-sm">EXPORT</button>
          <button type="button" className="btn-secondary btn-sm">BACKUP</button>
          <button type="button" className="btn-secondary btn-sm">RESTORE</button>
        </div>
      </CollapsibleCard>
    </>
  );
}
