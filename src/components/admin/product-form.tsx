'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { createProduct, updateProduct, upsertSpecifications } from '@/lib/admin/actions';
import type { SpecFieldDef } from '@/types';

interface Brand { id: string; name: string; }
interface Category { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string | null;
  categoryId: string;
  image: string | null;
  description: string | null;
}
interface ExistingSpec {
  specFieldId: string;
  value: string;
}

interface Props {
  product?: Product;
  brands: Brand[];
  categories: Category[];
  specFields?: SpecFieldDef[];
  existingSpecs?: ExistingSpec[];
}

export function ProductForm({ product, brands, categories, specFields = [], existingSpecs = [] }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!product;

  const specValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of existingSpecs) map[s.specFieldId] = s.value;
    return map;
  }, [existingSpecs]);

  const groupedSpecs = useMemo(() => {
    const groups: Record<string, SpecFieldDef[]> = {};
    for (const f of specFields) {
      const g = f.group || 'General';
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    }
    return groups;
  }, [specFields]);

  const groupNames = Object.keys(groupedSpecs);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateProduct(product!.id, form)
      : await createProduct(form);

    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    if (isEdit && specFields.length > 0) {
      const specs = specFields.map((f) => ({
        specFieldId: f.id,
        value: (form.get(`spec_${f.id}`) as string) || '',
      }));
      await upsertSpecifications(product!.id, specs);
    }

    if (!isEdit) {
      window.location.href = '/admin/products';
      return;
    }

    window.location.reload();
  }

  return (
    <>
      <Navbar />
      <div className="page-body pt-28">
        <div className="sec-head">
          <h2 className="text-2xl">
            {isEdit ? 'EDIT' : 'ADD'} <em className="text-[var(--yellow)]">PRODUCT</em>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl">
          {error && (
            <div className="badge b-red mb-4 block text-sm px-4 py-2">{error}</div>
          )}

          <div className="neo-card p-8 mb-8">
            <div className="admin-field">
              <label className="admin-label">Product Name *</label>
              <input
                name="name"
                required
                defaultValue={product?.name}
                className="admin-input"
                placeholder="e.g. Rainy75"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="admin-field">
                <label className="admin-label">Brand</label>
                <select name="brandId" defaultValue={product?.brandId ?? ''} className="admin-input">
                  <option value="">— No Brand —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">Category *</label>
                <select name="categoryId" required defaultValue={product?.categoryId} className="admin-input">
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">Image URL</label>
              <input
                name="image"
                defaultValue={product?.image ?? ''}
                className="admin-input"
                placeholder="https://..."
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={product?.description ?? ''}
                className="admin-input"
                placeholder="Brief description..."
              />
            </div>
          </div>

          {isEdit && groupNames.length > 0 && (
            <div className="mb-8">
              <div className="sec-head mb-6">
                <h2 className="text-xl">
                  <em className="text-[var(--yellow)]">SPECIFICATIONS</em>
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                {groupNames.map((group) => (
                  <div key={group} className="neo-card overflow-hidden">
                    <div className="bg-[var(--surface-raised)] border-b-2 border-[var(--border)] px-5 py-3">
                      <h3 className="font-[family-name:var(--f-m)] text-xs font-extrabold uppercase tracking-[.12em] text-[var(--yellow)]">
                        {group}
                      </h3>
                    </div>
                    <div className="p-5">
                      {groupedSpecs[group].map((field) => (
                        <div key={field.id} className="admin-field">
                          <label className="admin-label">{field.name}</label>
                          {field.type === 'boolean' ? (
                            <select
                              name={`spec_${field.id}`}
                              defaultValue={specValues[field.id] || ''}
                              className="admin-input"
                            >
                              <option value="">—</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          ) : field.type === 'select' && field.options ? (
                            <select
                              name={`spec_${field.id}`}
                              defaultValue={specValues[field.id] || ''}
                              className="admin-input"
                            >
                              <option value="">—</option>
                              {JSON.parse(field.options).map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              name={`spec_${field.id}`}
                              defaultValue={specValues[field.id] || ''}
                              className="admin-input"
                              placeholder={field.name}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? 'SAVING...' : isEdit ? 'UPDATE PRODUCT →' : 'CREATE PRODUCT →'}
            </button>
            <Link href="/admin/products" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
