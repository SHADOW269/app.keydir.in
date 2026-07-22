'use client';
/* eslint-disable @next/next/no-img-element -- Admin-only product image management preview; next/image adds no practical benefit here */

import { useRef, useState } from 'react';
import { CollapsibleCard } from './collapsible-card';
import { uploadFile } from '@/lib/utils';
import type { ProductImage } from '@/lib/admin/spec-types';

interface Props {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onFieldChange?: () => void;
}

export function ProductImageSection({ images, onImagesChange, onFieldChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function handleSetPrimary(idx: number) {
    onImagesChange(images.map((im, j) => ({ ...im, isPrimary: j === idx })));
    onFieldChange?.();
  }

  function handleRemove(idx: number) {
    const img = images[idx];
    if (img.publicId) {
      fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: img.publicId }),
      });
    }
    onImagesChange(images.filter((_, j) => j !== idx));
    onFieldChange?.();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file, 'products');
      const newImg: ProductImage = {
        url: result.url,
        publicId: result.publicId,
        sortOrder: images.length,
        isPrimary: images.length === 0,
      };
      onImagesChange([...images, newImg]);
      onFieldChange?.();
    } catch {
      // upload failed silently
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            <label className="pe-label">Choose Image</label>
            <div className="pe-image-add-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="pe-input"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading && <span className="pe-label" style={{ marginLeft: 8 }}>Uploading...</span>}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
