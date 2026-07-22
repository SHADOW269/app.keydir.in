'use client';

import { CollapsibleCard } from './collapsible-card';
import type { Product } from '@/lib/admin/spec-types';

interface Props {
  product?: Product;
  productType: string;
}

export function ProductMetadataSection({ product, productType }: Props) {
  return (
    <div id="pe-section-metadata">
      <CollapsibleCard title="Metadata" icon="📋" id="pe-card-metadata" defaultOpen={false}>
        <div className="pe-row-2">
          <div className="pe-field">
            <label className="pe-label">Product ID</label>
            <input className="pe-input" value={product?.id ?? 'New'} disabled />
          </div>
          <div className="pe-field">
            <label className="pe-label">Slug</label>
            <input className="pe-input" value={product?.slug ?? 'Auto-generated'} disabled />
          </div>
        </div>
        <div className="pe-row-2">
          <div className="pe-field">
            <label className="pe-label">Product Type</label>
            <input className="pe-input" value={productType} disabled />
          </div>
          <div className="pe-field">
            <label className="pe-label">Created</label>
            <input className="pe-input" value={product?.createdAt ? new Date(product.createdAt as unknown as string).toLocaleDateString() : '—'} disabled />
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
