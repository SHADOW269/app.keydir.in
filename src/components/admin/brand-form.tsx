'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { createBrand, updateBrand } from '@/lib/admin/actions';

interface Brand {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  country: string;
}

export function BrandForm({ brand }: { brand?: Brand }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!brand;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateBrand(brand!.id, form)
      : await createBrand(form);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-body pt-28">
        <div className="sec-head">
          <h2 className="text-2xl">
            {isEdit ? 'EDIT' : 'ADD'} <em className="text-[var(--blue)]">BRAND</em>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="neo-card p-8 max-w-2xl">
          {error && <div className="badge b-red mb-4 block text-sm px-4 py-2">{error}</div>}

          <div className="admin-field">
            <label className="admin-label">Brand Name *</label>
            <input name="name" required defaultValue={brand?.name} className="admin-input" placeholder="e.g. Keychron" />
          </div>

          <div className="admin-field">
            <label className="admin-label">Website</label>
            <input name="website" type="url" defaultValue={brand?.website ?? ''} className="admin-input" placeholder="https://keychron.com" />
          </div>

          <div className="admin-field">
            <label className="admin-label">Country</label>
            <input name="country" defaultValue={brand?.country ?? 'IN'} className="admin-input" placeholder="IN" maxLength={2} />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? 'SAVING...' : isEdit ? 'UPDATE BRAND →' : 'CREATE BRAND →'}
            </button>
            <Link href="/admin/brands" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
