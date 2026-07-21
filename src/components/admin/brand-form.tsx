'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createBrand, updateBrand, deleteBrand } from '@/lib/admin/actions';

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

/* ══════════════════════════════════════════
   BrandForm
   ══════════════════════════════════════════ */
export function BrandForm({ brand, stats }: { brand?: Brand; stats?: Stats }) {
  const isEdit = !!brand;
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(brand?.name || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [country, setCountry] = useState(brand?.country || 'IN');
  const desc = brand?.description || '';
  const [status, setStatus] = useState(brand?.status || 'active');
  const color = brand?.color || '';
  const logo = brand?.logo || '';

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const lastUpdated = brand?.updatedAt
    ? new Date(brand.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
      new Date(brand.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name required'); return; }
    setPending(true); setError(null);
    const fd = new FormData();
    fd.set('name', name);
    fd.set('website', website);
    fd.set('country', country);
    fd.set('description', desc);
    fd.set('status', status);
    fd.set('color', color);
    fd.set('logo', logo);
    const result = isEdit
      ? await updateBrand(brand!.id, fd)
      : await createBrand(fd);
    if (result?.error) { setError(result.error); setPending(false); }
  }

  async function handleDelete() {
    if (!brand?.id) return;
    setDeleting(true); setDeleteError(null);
    const result = await deleteBrand(brand.id, deletePassword);
    if (result?.error) { setDeleteError(result.error); setDeleting(false); return; }
    router.push('/admin/brands');
  }

  return (
    <form onSubmit={handleSubmit} className="ce">
      {/* HEADER */}
      <header className="ce-hd">
        <div className="ce-hd-l">
          <div className="ce-hd-title-row">
            <span className="ce-name">{isEdit ? (name || brand!.name) : 'Add Brand'}</span>
          </div>
          {isEdit ? (
            <div className="ce-hd-stats">
              <span className="ce-hd-stat">Last updated <strong>{lastUpdated}</strong></span>
              <span className="ce-hd-stat-sep">•</span>
              <span className="ce-hd-stat">Products <strong>{stats?.productCount ?? 0}</strong></span>
              <span className="ce-hd-stat-sep">•</span>
              <span className="ce-hd-stat">Country <strong>{country}</strong></span>
            </div>
          ) : (
            <div className="ce-hd-subtitle">Create a new keyboard brand.</div>
          )}
        </div>
        <div className="ce-hd-r">
          <button type="button" onClick={() => router.push('/admin/brands')} className="ce-toolbar-btn">Cancel</button>
          <button type="submit" disabled={pending} className="ce-toolbar-btn ce-toolbar-btn-primary">{pending ? 'Saving…' : isEdit ? 'SAVE' : 'CREATE'}</button>
          {isEdit && <button type="button" onClick={() => setShowDeleteModal(true)} className="ce-toolbar-btn ce-toolbar-btn-danger">DELETE</button>}
        </div>
      </header>
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
          <div className="ce-danger">
            <div className="ce-danger-inner">
              <div className="ce-danger-text">
                <span className="ce-danger-title">Danger Zone</span>
                <span className="ce-danger-desc">This permanently deletes the brand. Products will need reassignment.</span>
              </div>
              <button type="button" onClick={() => setShowDeleteModal(true)} className="ce-toolbar-btn ce-toolbar-btn-danger">Delete Brand</button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="ce-modal-mask">
          <div className="ce-modal">
            <div className="ce-modal-title">Confirm Deletion</div>
            <p className="ce-modal-text">This will permanently delete <strong>{brand?.name}</strong>. Products using this brand will have it unlinked.</p>
            <input type="password" placeholder="Enter password" value={deletePassword} onChange={e => { setDeletePassword(e.target.value); setDeleteError(null); }}
              onKeyDown={e => { if (e.key === 'Enter') handleDelete(); }} className="admin-input" autoFocus />
            {deleteError && <div className="ce-er">{deleteError}</div>}
            <div className="ce-modal-btns">
              <button onClick={handleDelete} disabled={!deletePassword || deleting} className="ce-toolbar-btn ce-toolbar-btn-danger">{deleting ? 'Deleting…' : 'DELETE'}</button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }} className="ce-toolbar-btn">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
