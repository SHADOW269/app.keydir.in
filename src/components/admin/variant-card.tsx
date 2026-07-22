'use client';

import type { VariantEntry } from './vendor-types';
import { AVAILABILITY_KEYS, AVAILABILITY_MAP } from '@/lib/constants';
import { TagInput } from './form-primitives';

interface Props {
  variant: VariantEntry;
  variantIndex: number;
  onRemove: () => void;
  onUpdate: (field: keyof VariantEntry, value: unknown) => void;
}

export function VariantCard({ variant, variantIndex, onRemove, onUpdate }: Props) {
  return (
    <div className="pe-variant-card">
      <div className="pe-variant-header">
        <span className="pe-variant-num">Variant #{variantIndex + 1}{variant.isDefault ? ' (Default)' : ''}</span>
        <button type="button" className="pe-variant-remove" onClick={onRemove}>Remove</button>
      </div>
      <div className="pe-variant-grid">
        <div className="pe-field">
          <label className="pe-label">Variant Name</label>
          <input type="text" className="pe-input" placeholder="e.g. Black / Linear" value={variant.name} onChange={(e) => onUpdate('name', e.target.value)} />
        </div>
        <div className="pe-field">
          <label className="pe-label">SKU (optional)</label>
          <input type="text" className="pe-input" placeholder="SKU" value={variant.sku} onChange={(e) => onUpdate('sku', e.target.value)} />
        </div>
        <TagInput label="Color" value={variant.color} onChange={(v) => onUpdate('color', v)} placeholder="+ Add Color" classPrefix="pe" />
        <TagInput label="Switches" value={variant.switches} onChange={(v) => onUpdate('switches', v)} placeholder="+ Add Switch" classPrefix="pe" />
        <TagInput label="Keycaps" value={variant.keycaps} onChange={(v) => onUpdate('keycaps', v)} placeholder="+ Add Keycap" classPrefix="pe" />
      </div>
      <div className="pe-variant-price-row">
        <div className="pe-field">
          <label className="pe-label">💰 Price (₹)</label>
          <input type="number" className="pe-input" placeholder="0" step="1" value={variant.price || ''} onChange={(e) => onUpdate('price', parseInt(e.target.value) || 0)} />
        </div>
        <div className="pe-field">
          <label className="pe-label">📦 Availability</label>
          <div className="pe-avail-group">
            {AVAILABILITY_KEYS.filter((k) => k === 'in_stock' || k === 'preorder' || k === 'out_of_stock').map((opt) => (
              <button key={opt} type="button" className={`pe-avail-btn ${variant.stockStatus === opt ? 'active' : ''}`} onClick={() => onUpdate('stockStatus', opt)}>
                {AVAILABILITY_MAP[opt].label}
              </button>
            ))}
          </div>
        </div>
        <div className="pe-field">
          <label className="pe-label">🌐 Variant URL</label>
          <input type="url" className="pe-input" placeholder="https://... (falls back to main URL)" value={variant.variantUrl} onChange={(e) => onUpdate('variantUrl', e.target.value)} />
        </div>
      </div>
      <div className="pe-variant-default-toggle">
        <label>
          <input type="checkbox" checked={variant.isDefault} onChange={(e) => onUpdate('isDefault', e.target.checked)} />
          Default variant
        </label>
      </div>
    </div>
  );
}
