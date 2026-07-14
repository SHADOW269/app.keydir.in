'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { createCategory, updateCategory } from '@/lib/admin/actions';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export function CategoryForm({ category }: { category?: Category }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!category;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateCategory(category!.id, form)
      : await createCategory(form);
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
            {isEdit ? 'EDIT' : 'ADD'} <em className="text-[var(--pink)]">CATEGORY</em>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="neo-card p-8 max-w-2xl">
          {error && <div className="badge b-red mb-4 block text-sm px-4 py-2">{error}</div>}

          <div className="admin-field">
            <label className="admin-label">Category Name *</label>
            <input name="name" required defaultValue={category?.name} className="admin-input" placeholder="e.g. Keyboards" />
          </div>

          <div className="admin-field">
            <label className="admin-label">Icon (emoji)</label>
            <input name="icon" defaultValue={category?.icon ?? ''} className="admin-input" placeholder="e.g. ⌨" maxLength={4} />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? 'SAVING...' : isEdit ? 'UPDATE CATEGORY →' : 'CREATE CATEGORY →'}
            </button>
            <Link href="/admin/categories" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
