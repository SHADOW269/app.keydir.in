'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createBrand, updateBrand, deleteBrand } from '@/lib/admin/actions';
import { DeletePasswordModal } from './delete-password-modal';
import { EditorHeader } from './admin-header';
import { DangerZoneCard } from './danger-zone-card';
import { useDeleteEntity } from './hooks/use-delete-entity';
import { useFormSubmit } from './hooks/use-form-submit';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  country: string;
  description: string | null;
  status: string;
  color: string | null;
  updatedAt: Date | string;
}

interface Stats {
  productCount: number;
  lowestPrice: number | null;
  highestPrice: number | null;
  lastProductDate: string | null;
}

/* ── Card ── */
function Card({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="bc">
      <div className="bc-h">{t}</div>
      <div className="bc-b">{children}</div>
    </div>
  );
}

export function BrandForm({ brand, stats }: { brand?: Brand; stats?: Stats }) {
  const isEdit = !!brand;
  const router = useRouter();
  const { pending, error, setError, run } = useFormSubmit();

  const [name, setName] = useState(brand?.name || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [country, setCountry] = useState(brand?.country || 'IN');
  const desc = brand?.description || '';
  const [status, setStatus] = useState(brand?.status || 'active');
  const color = brand?.color || '';
  const logo = brand?.logo || '';

  const {
    showDeleteModal, setShowDeleteModal,
    deletePassword, setDeletePassword,
    deleteError, setDeleteError,
    deleting, handleDelete,
  } = useDeleteEntity(deleteBrand, brand?.id || '', '/admin/brands');

  const lastUpdated = brand?.updatedAt
    ? new Date(brand.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
      new Date(brand.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name required'); return; }
    const fd = new FormData();
    fd.set('name', name);
    fd.set('website', website);
    fd.set('country', country);
    fd.set('description', desc);
    fd.set('status', status);
    fd.set('color', color);
    fd.set('logo', logo);
    await run(() => isEdit ? updateBrand(brand!.id, fd) : createBrand(fd));
  }

  return (
    <form onSubmit={handleSubmit} className="ce">
      <EditorHeader
        title={isEdit ? (name || brand!.name) : 'Add Brand'}
        subtitle={!isEdit ? 'Create a new keyboard brand.' : undefined}
        stats={isEdit ? [
          { label: 'Last updated', value: lastUpdated },
          { label: 'Products', value: stats?.productCount ?? 0 },
          { label: 'Country', value: country },
        ] : undefined}
        pending={pending}
        cancelHref="/admin/brands"
        isEdit={isEdit}
        onDelete={() => setShowDeleteModal(true)}
        onSave={() => {}}
      />
      {error && <div className="ce-err">{error}</div>}

      <div className="ce-body">
        <Card t="Brand Information">
          <div className="ce-field">
            <label className="ce-lb">Brand Name</label>
            <input className="admin-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Keychron" />
          </div>
          <div className="ce-2c">
            <div className="ce-field">
              <label className="ce-lb">Website</label>
              <input className="admin-input ce-mono" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://keychron.com" />
            </div>
            <div className="ce-field">
              <label className="ce-lb">Country</label>
              <input className="admin-input ce-mono" value={country} onChange={e => setCountry(e.target.value)} placeholder="IN" maxLength={2} />
            </div>
          </div>
          <div className="ce-field">
            <label className="ce-lb">Brand Status</label>
            <div className="sp">
              <button type="button" onClick={() => setStatus('active')} className={`sp-b ${status === 'active' ? 'on' : ''}`} style={status === 'active' ? { borderColor: 'var(--green)', color: 'var(--green)' } : undefined}>
                <i className="sp-dot" style={{ background: 'var(--green)' }} />Active
              </button>
              <button type="button" onClick={() => setStatus('hidden')} className={`sp-b ${status === 'hidden' ? 'on' : ''}`} style={status === 'hidden' ? { borderColor: 'var(--text-dim)', color: 'var(--text-dim)' } : undefined}>
                <i className="sp-dot" style={{ background: 'var(--text-dim)' }} />Hidden
              </button>
            </div>
          </div>
        </Card>

        {isEdit && (
          <DangerZoneCard
            description="This permanently deletes the brand. Products will need reassignment."
            buttonLabel="Delete Brand"
            onAction={() => setShowDeleteModal(true)}
          />
        )}
      </div>

      {showDeleteModal && (
        <DeletePasswordModal
          description={<>This will permanently delete <strong>{brand?.name}</strong>. Products using this brand will have it unlinked.</>}
          password={deletePassword}
          error={deleteError}
          pending={deleting}
          onPasswordChange={(val) => { setDeletePassword(val); setDeleteError(null); }}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
        />
      )}
    </form>
  );
}
