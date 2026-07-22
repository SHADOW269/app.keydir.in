'use client';

import { CollapsibleCard } from './collapsible-card';
import type { Product } from '@/lib/admin/spec-types';

interface Props {
  product?: Product;
  onFieldChange?: () => void;
}

export function ProductSeoSection({ product, onFieldChange }: Props) {
  return (
    <div id="pe-section-seo">
      <CollapsibleCard title="SEO" icon="🔍" id="pe-card-seo" defaultOpen={false}>
        <div className="pe-field pe-field--full">
          <label className="pe-label">Meta Title</label>
          <input name="metaTitle" defaultValue={product?.metaTitle ?? ''} className="pe-input" placeholder="SEO title — falls back to product name" maxLength={70} onChange={onFieldChange} />
          <span className="pe-hint">{(product?.metaTitle ?? '').length}/70 characters</span>
        </div>
        <div className="pe-field pe-field--full">
          <label className="pe-label">Meta Description</label>
          <div className="pe-textarea-wrap">
            <textarea name="metaDescription" defaultValue={product?.metaDescription ?? ''} className="pe-textarea pe-textarea--short" placeholder="SEO description — falls back to short description" maxLength={160} onInput={onFieldChange} />
          </div>
          <span className="pe-hint">{(product?.metaDescription ?? '').length}/160 characters</span>
        </div>
        <div className="pe-field pe-field--full">
          <label className="pe-label">OG Image URL</label>
          <input name="ogImage" defaultValue={product?.ogImage ?? ''} className="pe-input" placeholder="Open Graph image — falls back to product image" onChange={onFieldChange} />
        </div>
      </CollapsibleCard>
    </div>
  );
}
