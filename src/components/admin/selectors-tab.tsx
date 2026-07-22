'use client';

import { CollapsibleCard } from './collapsible-card';

interface Vendor {
  priceSelector: string | null;
  priceAttribute: string;
  availabilitySelector: string | null;
  availabilityAttribute: string;
  titleSelector: string | null;
  titleAttribute: string;
  imageSelector: string | null;
  imageAttribute: string;
  productExistsSelector: string | null;
}

interface Props {
  vendor: Vendor;
  pending: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SelectorsTab({ vendor, pending, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit}>
      <CollapsibleCard title="CSS Selectors" icon="◎" id="vd-selectors">
        <div className="vd-selector-table">
          <div className="vd-selector-header">
            <span className="vd-sel-col-field">Field</span>
            <span className="vd-sel-col-selector">Selector</span>
            <span className="vd-sel-col-attr">Attribute</span>
            <span className="vd-sel-col-status">Status</span>
          </div>
          {[
            { name: 'priceSelector', label: 'Price', attr: 'priceAttribute', defaultSel: vendor.priceSelector ?? '', defaultAttr: vendor.priceAttribute, required: true },
            { name: 'availabilitySelector', label: 'Availability', attr: 'availabilityAttribute', defaultSel: vendor.availabilitySelector ?? '', defaultAttr: vendor.availabilityAttribute, required: false },
            { name: 'titleSelector', label: 'Title', attr: 'titleAttribute', defaultSel: vendor.titleSelector ?? '', defaultAttr: vendor.titleAttribute, required: false },
            { name: 'imageSelector', label: 'Image', attr: 'imageAttribute', defaultSel: vendor.imageSelector ?? '', defaultAttr: vendor.imageAttribute, required: false },
            { name: 'productExistsSelector', label: 'Exists', attr: null, defaultSel: vendor.productExistsSelector ?? '', defaultAttr: '', required: false },
          ].map((sel) => (
            <div key={sel.name} className="vd-selector-row">
              <span className="vd-sel-col-field">
                {sel.label}{sel.required && <span style={{ color: 'var(--red)' }}> *</span>}
              </span>
              <span className="vd-sel-col-selector">
                <input name={sel.name} defaultValue={sel.defaultSel} className="admin-input" style={{ fontSize: '0.7rem', fontFamily: 'var(--f-m)' }}
                  placeholder='.price, [data-price]' />
              </span>
              <span className="vd-sel-col-attr">
                {sel.attr ? (
                  <select name={sel.attr} defaultValue={sel.defaultAttr} className="admin-input" style={{ fontSize: '0.7rem' }}>
                    {sel.name === 'priceSelector' && (<><option value="text">Text</option><option value="content">Content</option><option value="data-price">data-price</option><option value="href">href</option></>)}
                    {sel.name === 'availabilitySelector' && (<><option value="text">Text</option><option value="class">Class</option><option value="data-status">data-status</option></>)}
                    {sel.name === 'titleSelector' && (<><option value="text">Text</option></>)}
                    {sel.name === 'imageSelector' && (<><option value="src">src</option><option value="data-src">data-src</option><option value="content">content</option></>)}
                  </select>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>—</span>
                )}
              </span>
              <span className="vd-sel-col-status">
                {sel.defaultSel ? (
                  <span className="vd-sel-badge vd-sel-badge--ok">CONFIGURED</span>
                ) : (
                  <span className="vd-sel-badge vd-sel-badge--empty">EMPTY</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      <div style={{ marginTop: 20 }}>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'SAVING...' : 'SAVE SELECTORS →'}
        </button>
      </div>
    </form>
  );
}
