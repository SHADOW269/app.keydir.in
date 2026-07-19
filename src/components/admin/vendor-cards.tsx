'use client';

import { useState, useTransition, forwardRef, useImperativeHandle } from 'react';
import { deleteVendorProduct, checkVendorProduct, scrapeVendorProduct, updateVendorStatus, clearManualOverride } from '@/lib/admin/actions';

interface VendorOption { id: string; name: string; }

interface ExistingVendorProduct {
  id: string; vendorId: string; vendorUrl: string; shippingCost: number;
  affiliateLink: string | null; price: number; stockStatus: string;
  lastCheckedAt: Date | null; lastChecked?: Date | null;
  manualUpdatedAt: Date | null; lastManualUpdate?: Date | null;
  source: string; availability: string; scrapeStatus: string;
  scrapeError: string | null; lastSuccessfulAt: Date | null;
  scraperVersion: string | null; lastHttpStatus: number | null;
  responseTimeMs: number | null; manualOverride: boolean;
  updatedBy: string | null;
  variants?: ExistingVariant[];
}

interface ExistingVariant {
  id: string; name: string; color: string[] | null; switches: string[] | null; keycaps: string[] | null;
  price: number; stockStatus: string; variantUrl: string | null; sku: string | null; isDefault: boolean;
}

interface VariantEntry {
  id?: string; name: string; color: string[]; switches: string[]; keycaps: string[];
  price: number; stockStatus: string; variantUrl: string; sku: string; isDefault: boolean;
}

interface VendorEntry {
  id?: string; vendorId: string; vendorUrl: string; shippingCost: number;
  affiliateLink: string; price: number; stockStatus: string;
  variants: VariantEntry[];
}

export interface VendorCardsHandle {
  getEntries: () => VendorEntry[];
}

interface Props {
  productId: string;
  vendors: VendorOption[];
  existingVendorProducts: ExistingVendorProduct[];
  onChange?: () => void;
}

function TagInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) { onChange([...value, trimmed]); setInput(''); }
  };
  return (
    <div className="pe-tag-wrap">
      <label className="pe-label">{label}</label>
      <div className="pe-tag-chips">
        {value.map((tag) => (
          <span key={tag} className="pe-tag-chip">
            {tag}
            <button type="button" className="pe-tag-remove" onClick={() => onChange(value.filter((t) => t !== tag))}>×</button>
          </span>
        ))}
        <input
          type="text"
          className="pe-tag-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={placeholder || `+ Add ${label}`}
        />
      </div>
    </div>
  );
}

export const VendorCards = forwardRef<VendorCardsHandle, Props>(({ productId, vendors, existingVendorProducts, onChange }, ref) => {
  const [entries, setEntries] = useState<VendorEntry[]>(() =>
    existingVendorProducts.map((vp) => ({
      id: vp.id,
      vendorId: vp.vendorId,
      vendorUrl: vp.vendorUrl,
      shippingCost: vp.shippingCost,
      affiliateLink: vp.affiliateLink || '',
      price: vp.price,
      stockStatus: vp.stockStatus,
      variants: (vp.variants ?? []).map((v) => ({
        id: v.id, name: v.name, color: v.color ?? [], switches: v.switches ?? [], keycaps: v.keycaps ?? [],
        price: v.price, stockStatus: v.stockStatus, variantUrl: v.variantUrl ?? '', sku: v.sku ?? '', isDefault: v.isDefault,
      })),
    }))
  );
  const [checking, setChecking] = useState<Record<number, boolean>>({});
  const [scraping, setScraping] = useState<Record<number, boolean>>({});
  const [updating, setUpdating] = useState<Record<number, boolean>>({});
  const [clearing, setClearing] = useState<Record<number, boolean>>({});
  const [checkResult, setCheckResult] = useState<Record<number, { ok: boolean; message: string; scrapedPrice?: number; scrapedAvailability?: string; scraperVersion?: string } | null>>({});

  useImperativeHandle(ref, () => ({
    getEntries: () => entries,
  }));

  const markChange = () => onChange?.();

  const addEntry = () => {
    setEntries((p) => [...p, { vendorId: '', vendorUrl: '', shippingCost: 0, affiliateLink: '', price: 0, stockStatus: 'in_stock', variants: [] }]);
    markChange();
  };

  const removeEntry = (idx: number) => {
    const entry = entries[idx];
    if (entry.id) {
      deleteVendorProduct(entry.id);
    }
    setEntries((p) => p.filter((_, i) => i !== idx));
    markChange();
  };

  const updateEntry = (idx: number, field: keyof VendorEntry, value: string | number) => {
    setEntries((p) => p.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    markChange();
  };

  const addVariant = (vendorIdx: number) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: [...e.variants, { name: '', color: [], switches: [], keycaps: [], price: 0, stockStatus: 'in_stock', variantUrl: '', sku: '', isDefault: e.variants.length === 0 }],
    } : e));
    markChange();
  };

  const removeVariant = (vendorIdx: number, variantIdx: number) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: e.variants.filter((_, vi) => vi !== variantIdx),
    } : e));
    markChange();
  };

  const updateVariant = (vendorIdx: number, variantIdx: number, field: keyof VariantEntry, value: unknown) => {
    setEntries((p) => p.map((e, i) => i === vendorIdx ? {
      ...e, variants: e.variants.map((v, vi) => vi === variantIdx ? { ...v, [field]: value } : v),
    } : e));
    markChange();
  };

  const handleCheck = async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setChecking((p) => ({ ...p, [idx]: true }));
    setCheckResult((p) => ({ ...p, [idx]: null }));
    try {
      const result = await checkVendorProduct(entry.id);
      if ('error' in result) {
        setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: String(result.error || 'Check failed') } }));
      } else {
        setCheckResult((p) => ({ ...p, [idx]: {
          ok: true,
          message: String(result.message || 'OK'),
          scrapedPrice: result.scrapedPrice ?? undefined,
          scrapedAvailability: result.scrapedAvailability,
          scraperVersion: result.scraperVersion,
        } }));
      }
    } catch {
      setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Network error' } }));
    }
    setChecking((p) => ({ ...p, [idx]: false }));
  };

  const handleScrape = async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setScraping((p) => ({ ...p, [idx]: true }));
    setCheckResult((p) => ({ ...p, [idx]: null }));
    try {
      const result = await scrapeVendorProduct(entry.id);
      if (result?.error) {
        setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: String(result.error) } }));
      } else {
        setCheckResult((p) => ({ ...p, [idx]: {
          ok: true,
          message: `Scraped: ₹${result.price?.toLocaleString()} (${result.availability})`,
          scrapedPrice: result.price,
          scrapedAvailability: result.availability,
        } }));
        window.location.reload();
      }
    } catch {
      setCheckResult((p) => ({ ...p, [idx]: { ok: false, message: 'Network error' } }));
    }
    setScraping((p) => ({ ...p, [idx]: false }));
  };

  const handleUpdate = async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setUpdating((p) => ({ ...p, [idx]: true }));
    const fd = new FormData();
    fd.set('vendorProductId', entry.id);
    fd.set('price', String(entry.price || 0));
    fd.set('stockStatus', entry.stockStatus || 'in_stock');
    fd.set('shippingCost', String(entry.shippingCost || 0));
    fd.set('shippingIncluded', entry.shippingCost === 0 ? 'on' : '');
    await updateVendorStatus(fd);
    window.location.reload();
    setUpdating((p) => ({ ...p, [idx]: false }));
  };

  const handleClearOverride = async (idx: number) => {
    const entry = entries[idx];
    if (!entry.id) return;
    setClearing((p) => ({ ...p, [idx]: true }));
    await clearManualOverride(entry.id);
    window.location.reload();
    setClearing((p) => ({ ...p, [idx]: false }));
  };

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
                    {(['in_stock', 'preorder', 'group_buy', 'coming_soon', 'out_of_stock'] as const).map((opt) => (
                      <button key={opt} type="button" className={`pe-avail-btn ${entry.stockStatus === opt ? 'active' : ''}`} onClick={() => updateEntry(idx, 'stockStatus', opt)}>
                        {opt === 'in_stock' ? 'In Stock' : opt === 'preorder' ? 'Pre-Order' : opt === 'group_buy' ? 'Group Buy' : opt === 'coming_soon' ? 'Coming Soon' : 'Out of Stock'}
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

              <div className="pe-row-2">
                <div className="pe-field">
                  <label className="pe-label">💰 Price (₹)</label>
                  <input type="number" className="pe-input" placeholder="0" step="1" value={entry.price || ''} onChange={(e) => updateEntry(idx, 'price', parseInt(e.target.value) || 0)} />
                </div>
                <div className="pe-field">
                  <label className="pe-label">📦 Shipping (₹)</label>
                  <input type="number" className="pe-input" placeholder="0" step="1" value={entry.shippingCost || ''} onChange={(e) => updateEntry(idx, 'shippingCost', parseInt(e.target.value) || 0)} />
                </div>
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
                    <div key={vIdx} className="pe-variant-card">
                      <div className="pe-variant-header">
                        <span className="pe-variant-num">Variant #{vIdx + 1}{variant.isDefault ? ' (Default)' : ''}</span>
                        <button type="button" className="pe-variant-remove" onClick={() => removeVariant(idx, vIdx)}>Remove</button>
                      </div>
                      <div className="pe-variant-grid">
                        <div className="pe-field">
                          <label className="pe-label">Variant Name</label>
                          <input type="text" className="pe-input" placeholder="e.g. Black / Linear" value={variant.name} onChange={(e) => updateVariant(idx, vIdx, 'name', e.target.value)} />
                        </div>
                        <div className="pe-field">
                          <label className="pe-label">SKU (optional)</label>
                          <input type="text" className="pe-input" placeholder="SKU" value={variant.sku} onChange={(e) => updateVariant(idx, vIdx, 'sku', e.target.value)} />
                        </div>
                        <TagInput label="Color" value={variant.color} onChange={(v) => updateVariant(idx, vIdx, 'color', v)} placeholder="+ Add Color" />
                        <TagInput label="Switches" value={variant.switches} onChange={(v) => updateVariant(idx, vIdx, 'switches', v)} placeholder="+ Add Switch" />
                        <TagInput label="Keycaps" value={variant.keycaps} onChange={(v) => updateVariant(idx, vIdx, 'keycaps', v)} placeholder="+ Add Keycap" />
                      </div>
                      <div className="pe-variant-price-row">
                        <div className="pe-field">
                          <label className="pe-label">💰 Price (₹)</label>
                          <input type="number" className="pe-input" placeholder="0" step="1" value={variant.price || ''} onChange={(e) => updateVariant(idx, vIdx, 'price', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="pe-field">
                          <label className="pe-label">📦 Availability</label>
                          <div className="pe-avail-group">
                            {(['in_stock', 'preorder', 'out_of_stock'] as const).map((opt) => (
                              <button key={opt} type="button" className={`pe-avail-btn ${variant.stockStatus === opt ? 'active' : ''}`} onClick={() => updateVariant(idx, vIdx, 'stockStatus', opt)}>
                                {opt === 'in_stock' ? 'In Stock' : opt === 'preorder' ? 'Pre-Order' : 'Out of Stock'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="pe-field">
                          <label className="pe-label">🌐 Variant URL</label>
                          <input type="url" className="pe-input" placeholder="https://... (falls back to main URL)" value={variant.variantUrl} onChange={(e) => updateVariant(idx, vIdx, 'variantUrl', e.target.value)} />
                        </div>
                      </div>
                      <div className="pe-variant-default-toggle">
                        <label>
                          <input type="checkbox" checked={variant.isDefault} onChange={(e) => updateVariant(idx, vIdx, 'isDefault', e.target.checked)} />
                          Default variant
                        </label>
                      </div>
                    </div>
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
