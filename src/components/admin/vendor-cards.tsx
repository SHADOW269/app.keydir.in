'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { useVendorEntries } from './hooks/use-vendor-entries';
import { useVendorCardActions } from './hooks/use-vendor-card-actions';
import { CouponCard } from './coupon-card';
import { VariantCard } from './variant-card';
import type { ExistingVendorProduct, VendorEntry } from './vendor-types';
import type { VendorOption } from '@/lib/admin/spec-types';
import { AVAILABILITY_KEYS, AVAILABILITY_MAP } from '@/lib/constants';

export interface VendorCardsHandle {
  getEntries: () => VendorEntry[];
}

interface Props {
  productId: string;
  vendors: VendorOption[];
  existingVendorProducts: ExistingVendorProduct[];
  onChange?: () => void;
}

export const VendorCards = forwardRef<VendorCardsHandle, Props>(({ productId, vendors, existingVendorProducts, onChange }, ref) => {
  const {
    entries, addEntry, removeEntry, updateEntry,
    addVariant, removeVariant, updateVariant,
    addCoupon, removeCoupon, updateCoupon, toggleCouponCollapsed,
    getEntries,
  } = useVendorEntries(existingVendorProducts, onChange);

  const { checking, scraping, updating, clearing, checkResult, handleCheck, handleScrape, handleUpdate, handleClearOverride } = useVendorCardActions(entries, productId, existingVendorProducts);

  useImperativeHandle(ref, () => ({ getEntries }));

  return (
    <div className="pe-vendor-card-wrap">
      {entries.map((entry, idx) => {
        const existing = entry.id ? existingVendorProducts.find((vp) => vp.id === entry.id) : null;
        const vendorName = vendors.find((v) => v.id === entry.vendorId)?.name || 'Select Vendor';
        const statusClass = existing?.scrapeStatus === 'SUCCESS' ? 'success' : existing?.scrapeStatus === 'FAILED' ? 'failed' : existing?.scrapeStatus === 'NEEDS_REVIEW' ? 'warning' : 'pending';
        return (
          <div key={idx} className="pe-vendor-card">
            <div className="pe-vendor-header">
              <div className="pe-vendor-header-left">
                <span className="pe-vendor-name">{vendorName}</span>
                {existing && (
                  <span className="pe-vendor-tracking on">✓ Tracking</span>
                )}
              </div>
              <button type="button" className="pe-vendor-remove" onClick={() => removeEntry(idx)}>Remove</button>
            </div>

            <div className="pe-vendor-body">
              <div className="pe-row-2">
                <div className="pe-field">
                  <label className="pe-label">Vendor *</label>
                  <select className="pe-select" value={entry.vendorId} onChange={(e) => updateEntry(idx, 'vendorId', e.target.value)}>
                    <option value="">Select vendor</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="pe-field">
                  <label className="pe-label">Stock Status</label>
                  <div className="pe-avail-group">
                    {AVAILABILITY_KEYS.map((opt) => (
                      <button key={opt} type="button" className={`pe-avail-btn ${entry.stockStatus === opt ? 'active' : ''}`} onClick={() => updateEntry(idx, 'stockStatus', opt)}>
                        {AVAILABILITY_MAP[opt].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pe-field pe-field--full">
                <label className="pe-label">Product URL *</label>
                <input type="url" className="pe-input" placeholder="https://..." value={entry.vendorUrl} onChange={(e) => updateEntry(idx, 'vendorUrl', e.target.value)} />
              </div>

              <div className="pe-field pe-field--full">
                <label className="pe-label">Affiliate Link</label>
                <input type="url" className="pe-input" placeholder="https://... (optional)" value={entry.affiliateLink} onChange={(e) => updateEntry(idx, 'affiliateLink', e.target.value)} />
              </div>

              <div className="pe-field pe-field--full">
                <label className="pe-label">💰 Price (₹)</label>
                <input type="number" className="pe-input" placeholder="0" step="1" value={entry.price || ''} onChange={(e) => updateEntry(idx, 'price', parseInt(e.target.value) || 0)} />
              </div>

              <div className="pe-field pe-field--full">
                <label className="pe-label">🚚 Shipping Type</label>
                <div className="pe-ship-group">
                  <button type="button" className={`pe-ship-btn ${entry.shippingIncluded ? 'active' : ''}`} onClick={() => { updateEntry(idx, 'shippingIncluded', true); updateEntry(idx, 'shippingCost', 0); }}>
                    {entry.shippingIncluded && <span className="pe-ship-check">✓</span>}
                    FREE SHIPPING
                  </button>
                  <button type="button" className={`pe-ship-btn ${!entry.shippingIncluded ? 'active' : ''}`} onClick={() => updateEntry(idx, 'shippingIncluded', false)}>
                    {!entry.shippingIncluded && <span className="pe-ship-check">✓</span>}
                    PAID SHIPPING
                  </button>
                </div>
              </div>

              <div className={`pe-ship-cost-wrap ${!entry.shippingIncluded ? 'open' : ''}`}>
                <div className="pe-field pe-field--full">
                  <label className="pe-label">Shipping Cost</label>
                  <div className="pe-input-wrap">
                    <span className="pe-input-prefix">₹</span>
                    <input type="number" className="pe-input pe-input--prefixed" placeholder="0" step="1" min="0" required={!entry.shippingIncluded} value={entry.shippingCost || ''} onChange={(e) => updateEntry(idx, 'shippingCost', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>

              {/* Coupons */}
              <div className="pe-field pe-field--full">
                <div className="pe-coupon-header">
                  <label className="pe-label pe-label--section">🏷️ Coupons</label>
                  <button type="button" className="pe-coupon-add-btn" onClick={() => addCoupon(idx)}>+ Add Coupon</button>
                </div>
                {entry.coupons.length === 0 ? (
                  <div className="pe-coupon-empty">No coupons — click "+ Add Coupon" to create one</div>
                ) : (
                  entry.coupons.map((coupon, cIdx) => (
                    <CouponCard
                      key={cIdx}
                      coupon={coupon}
                      onToggle={() => toggleCouponCollapsed(idx, cIdx)}
                      onRemove={() => removeCoupon(idx, cIdx)}
                      onUpdate={(field, value) => updateCoupon(idx, cIdx, field, value)}
                    />
                  ))
                )}
              </div>

              {existing && (
                <div className="pe-vendor-scraper-grid">
                  <div className="pe-vendor-status">
                    <span className={`pe-vendor-status-dot ${statusClass}`} />
                    <span className={`pe-vendor-status-text ${statusClass}`}>{existing.scrapeStatus || 'NOT CHECKED'}</span>
                  </div>
                  {existing.scraperVersion && (
                    <><span className="pe-vendor-scraper-label">Version</span><span className="pe-vendor-scraper-value">v{existing.scraperVersion}</span></>
                  )}
                  {existing.lastHttpStatus && (
                    <><span className="pe-vendor-scraper-label">HTTP</span><span className="pe-vendor-scraper-value">{existing.lastHttpStatus}</span></>
                  )}
                  {existing.lastChecked && (
                    <><span className="pe-vendor-scraper-label">Checked</span><span className="pe-vendor-scraper-value">{new Date(existing.lastChecked).toLocaleString()}</span></>
                  )}
                </div>
              )}

              {checkResult[idx] && (
                <div className={`pe-vendor-check-result ${checkResult[idx]!.ok ? 'ok' : 'err'}`}>
                  <span>{checkResult[idx]!.message}</span>
                  {checkResult[idx]!.scrapedPrice != null && (
                    <span>Scraped: ₹{checkResult[idx]!.scrapedPrice.toLocaleString()} ({checkResult[idx]!.scrapedAvailability || 'unknown'})</span>
                  )}
                </div>
              )}

              {/* Variants */}
              <div className="pe-variants-section">
                <div className="pe-variants-header">
                  <span className="pe-variants-label">Variants</span>
                  <button type="button" className="pe-add-variant-btn" onClick={() => addVariant(idx)}>+ Add Variant</button>
                </div>
                {entry.variants.length === 0 ? (
                  <div className="pe-vendor-new-hint">No variants — click "+ Add Variant" to create one</div>
                ) : (
                  entry.variants.map((variant, vIdx) => (
                    <VariantCard
                      key={vIdx}
                      variant={variant}
                      variantIndex={vIdx}
                      onRemove={() => removeVariant(idx, vIdx)}
                      onUpdate={(field, value) => updateVariant(idx, vIdx, field, value)}
                    />
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="pe-vendor-actions">
                {entry.id ? (
                  <>
                    <button type="button" className="btn-secondary btn-sm" disabled={checking[idx]} onClick={() => handleCheck(idx)}>
                      {checking[idx] ? 'Checking...' : 'CHECK NOW'}
                    </button>
                    <button type="button" className="btn-primary btn-sm" disabled={scraping[idx]} onClick={() => handleScrape(idx)}>
                      {scraping[idx] ? 'Scraping...' : 'SCRAPE'}
                    </button>
                    <button type="button" className="btn-primary btn-sm" disabled={updating[idx]} onClick={() => handleUpdate(idx)}>
                      {updating[idx] ? 'Updating...' : 'UPDATE'}
                    </button>
                    {existing?.manualOverride && (
                      <button type="button" className="btn-secondary btn-sm" disabled={clearing[idx]} onClick={() => handleClearOverride(idx)}>
                        {clearing[idx] ? 'Clearing...' : 'CLEAR OVERRIDE'}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="pe-vendor-new-hint">Save to enable actions</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <button type="button" className="pe-add-vendor" onClick={addEntry}>+ Add Vendor</button>
    </div>
  );
});

VendorCards.displayName = 'VendorCards';
