'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';

import { createBrand, updateBrand, deleteBrand } from '@/lib/admin/actions';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isEdit = !!brand;
  const router = useRouter();

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

  async function handleDelete() {
    if (!brand?.id) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteBrand(brand.id, deletePassword);
    if (result?.error) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }
    router.push('/admin/brands');
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
            {isEdit && (
              <button type="button" disabled={pending} onClick={() => setShowDeleteModal(true)} className="btn-secondary" style={{ color: 'var(--red)', marginLeft: 'auto' }}>
                DELETE BRAND
              </button>
            )}
          </div>
        </form>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="neo-card max-w-sm w-full p-6">
            <h3 className="font-[family-name:var(--f-m)] text-sm font-bold uppercase tracking-[.12em] text-[var(--accent)] mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-[var(--text-dim)] mb-4">
              This will permanently delete <strong className="text-[var(--text)]">{brand?.name}</strong>. Products using this brand will have it unlinked. Enter password to confirm.
            </p>
            <input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(); }}
              className="admin-input w-full mb-1"
              autoFocus
            />
            {deleteError && <p className="text-xs text-red-400 mb-3">{deleteError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={handleDelete} disabled={!deletePassword || deleting} className="btn-danger flex-1">
                {deleting ? 'DELETING...' : 'DELETE'}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }} className="btn-secondary flex-1">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
