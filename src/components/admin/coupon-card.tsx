'use client';

import type { CouponEntry } from './vendor-types';
import { formatCouponDiscount } from '@/lib/utils';

interface Props {
  coupon: CouponEntry;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (field: keyof CouponEntry, value: unknown) => void;
}

export function CouponCard({ coupon, onToggle, onRemove, onUpdate }: Props) {
  return (
    <div className={`pe-coupon-card ${coupon.collapsed ? 'collapsed' : ''}`}>
      <div className="pe-coupon-card-header" onClick={onToggle}>
        <div className="pe-coupon-card-title">
          <span className="pe-coupon-chevron">{coupon.collapsed ? '▸' : '▾'}</span>
          <span className="pe-coupon-card-code">{coupon.code || 'Untitled Coupon'}</span>
          <span className={`pe-coupon-type-badge ${coupon.discountType}`}>
            {formatCouponDiscount(coupon)}
          </span>
          {!coupon.enabled && <span className="pe-coupon-disabled-badge">DISABLED</span>}
        </div>
        <button type="button" className="pe-coupon-remove-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }}>Remove</button>
      </div>
      <div className="pe-coupon-card-body">
        <div className="pe-row-2">
          <div className="pe-field">
            <label className="pe-label">Coupon Code *</label>
            <input type="text" className="pe-input" placeholder="e.g. SAVE10" value={coupon.code} onChange={(e) => onUpdate('code', e.target.value)} />
          </div>
          <div className="pe-field">
            <label className="pe-label">Discount Type</label>
            <div className="pe-avail-group">
              {(['percentage', 'flat', 'free_shipping'] as const).map((opt) => (
                <button key={opt} type="button" className={`pe-avail-btn ${coupon.discountType === opt ? 'active' : ''}`} onClick={() => onUpdate('discountType', opt)}>
                  {opt === 'percentage' ? '%' : opt === 'flat' ? '₹' : '🚚'} {opt === 'free_shipping' ? 'Free Ship.' : opt === 'percentage' ? 'Percentage' : 'Flat Amount'}
                </button>
              ))}
            </div>
          </div>
        </div>
        {coupon.discountType !== 'free_shipping' && (
          <div className="pe-field pe-field--full">
            <label className="pe-label">Discount Value *</label>
            <div className="pe-input-wrap">
              <span className="pe-input-prefix">{coupon.discountType === 'flat' ? '₹' : '%'}</span>
              <input type="number" className="pe-input pe-input--prefixed" placeholder="0" step="1" min="0" value={coupon.discountValue || ''} onChange={(e) => onUpdate('discountValue', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        )}
        <div className="pe-row-2">
          <div className="pe-field">
            <label className="pe-label">Minimum Order Amount (optional)</label>
            <div className="pe-input-wrap">
              <span className="pe-input-prefix">₹</span>
              <input type="number" className="pe-input pe-input--prefixed" placeholder="0" step="1" min="0" value={coupon.minimumOrderAmount || ''} onChange={(e) => onUpdate('minimumOrderAmount', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="pe-field">
            <label className="pe-label">Expiry Date (optional)</label>
            <input type="date" className="pe-input" value={coupon.expiryDate} onChange={(e) => onUpdate('expiryDate', e.target.value)} />
          </div>
        </div>
        <div className="pe-field pe-field--full">
          <label className="pe-label">Coupon URL (optional)</label>
          <input type="url" className="pe-input" placeholder="https://... (link to promotion)" value={coupon.couponUrl} onChange={(e) => onUpdate('couponUrl', e.target.value)} />
        </div>
        <div className="pe-field pe-field--full">
          <label className="pe-label">Description / Notes (optional)</label>
          <input type="text" className="pe-input" placeholder="e.g. 10% off on orders above ₹999" value={coupon.description} onChange={(e) => onUpdate('description', e.target.value)} />
        </div>
        <div className="pe-coupon-enabled-row">
          <span className="pe-coupon-enabled-label">Enabled</span>
          <button type="button" className={`pe-coupon-toggle ${coupon.enabled ? 'on' : ''}`} onClick={() => onUpdate('enabled', !coupon.enabled)}>
            <span className="pe-coupon-toggle-thumb" />
          </button>
        </div>
      </div>
    </div>
  );
}
