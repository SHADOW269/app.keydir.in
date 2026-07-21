'use client';

import { useState, useCallback } from 'react';
import { uploadFile } from '@/lib/utils';
import type { ProductImage } from '@/lib/admin/spec-types';

export function useProductImages(initial: ProductImage[] = []) {
  const [images, setImages] = useState<ProductImage[]>(initial);

  const addImage = useCallback((url: string) => {
    setImages((prev) => [...prev, { url, sortOrder: prev.length, isPrimary: prev.length === 0 }]);
  }, []);

  const removeImage = useCallback((idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const setPrimary = useCallback((idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === idx })));
  }, []);

  const uploadImage = useCallback((file: File) => {
    uploadFile(file, 'products')
      .then((url) => addImage(url))
      .catch(() => {});
  }, [addImage]);

  return { images, setImages, addImage, removeImage, setPrimary, uploadImage };
}
