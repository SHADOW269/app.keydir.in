'use client';

import { CollapsibleCard } from './collapsible-card';
import type { ProductImage } from '@/lib/admin/spec-types';

interface Props {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onFieldChange?: () => void;
}

export function ProductImageSection({ images, onImagesChange, onFieldChange }: Props) {
  function handleSetPrimary(idx: number) {
    onImagesChange(images.map((im, j) => ({ ...im, isPrimary: j === idx })));
    onFieldChange?.();
  }

  function handleRemove(idx: number) {
    onImagesChange(images.filter((_, j) => j !== idx));
    onFieldChange?.();
  }

  function handleAdd() {
    const input = document.getElementById('pe-image-url-input') as HTMLInputElement;
    if (!input?.value) return;
    const newImg: ProductImage = { url: input.value, sortOrder: images.length, isPrimary: images.length === 0 };
    onImagesChange([...images, newImg]);
    input.value = '';
    onFieldChange?.();
  }

  return (
    <div id="pe-section-images">
      <CollapsibleCard title="Images" icon="🖼" id="pe-card-images">
        <div className="pe-images-section">
          <div className="pe-image-list">
            {images.map((img, i) => (
              <div key={img.id || i} className={`pe-image-thumb ${img.isPrimary ? 'pe-image-thumb--primary' : ''}`}>
                <img src={img.url} alt={img.alt || ''} />
                <div className="pe-image-actions">
                  {!img.isPrimary && (
                    <button type="button" className="pe-image-btn" onClick={() => handleSetPrimary(i)}>Primary</button>
                  )}
                  <button type="button" className="pe-image-btn pe-image-btn--danger" onClick={() => handleRemove(i)}>Remove</button>
                </div>
                {img.isPrimary && <span className="pe-image-primary-badge">PRIMARY</span>}
              </div>
            ))}
          </div>
          <div className="pe-image-add">
            <label className="pe-label">Add Image URL</label>
            <div className="pe-image-add-row">
              <input type="url" className="pe-input" placeholder="https://..." id="pe-image-url-input" />
              <button type="button" className="btn-secondary" onClick={handleAdd}>+ Add</button>
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
