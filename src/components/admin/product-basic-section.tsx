'use client';

import { CollapsibleCard } from './collapsible-card';
import type { Brand, Product } from '@/lib/admin/spec-types';

interface Props {
  product?: Product;
  brands: Brand[];
  productLabel: string;
  onFieldChange?: () => void;
}

export function ProductBasicSection({ product, brands, productLabel, onFieldChange }: Props) {
  return (
    <div id="pe-section-basic">
      <CollapsibleCard title="Basic Information" icon="📝" id="pe-card-basic">
        <div className="pe-field pe-field--full">
          <label className="pe-label">Product Name <span className="pe-required">*</span></label>
          <input name="name" required defaultValue={product?.name} className="pe-input" placeholder={`e.g. ${productLabel === 'Switch' ? 'Gateron Oil King, Cherry MX Brown' : 'Product name'}`} onChange={onFieldChange} />
        </div>
        <div className="pe-row-2">
          <div className="pe-field">
            <label className="pe-label">Brand</label>
            <select name="brandId" defaultValue={product?.brandId ?? ''} className="pe-select" onChange={onFieldChange}>
              <option value="">— No Brand —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="pe-field">
            <label className="pe-label">SKU</label>
            <input name="sku" defaultValue={product?.sku ?? ''} className="pe-input" placeholder="Internal SKU" onChange={onFieldChange} />
          </div>
        </div>
        <div className="pe-field pe-field--full">
          <label className="pe-label">Short Description</label>
          <input name="description" defaultValue={product?.description ?? ''} className="pe-input" placeholder="Brief description for cards and search results" maxLength={200} onChange={onFieldChange} />
        </div>
        <div className="pe-field pe-field--full">
          <label className="pe-label">Long Description</label>
          <div className="pe-textarea-wrap">
            <textarea name="longDescription" defaultValue={product?.longDescription ?? ''} className="pe-textarea" placeholder="Detailed description — specs, features, use case..." maxLength={2000} onInput={onFieldChange} />
          </div>
        </div>
        <div className="pe-row-2">
          <div className="pe-field">
            <label className="pe-label">Status</label>
            <select name="status" defaultValue={product?.status ?? 'active'} className="pe-select" onChange={onFieldChange}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="pe-field">
            <label className="pe-label">Release Date</label>
            <input type="date" name="releaseDate" defaultValue={product?.releaseDate ?? ''} className="pe-input" onChange={onFieldChange} />
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
