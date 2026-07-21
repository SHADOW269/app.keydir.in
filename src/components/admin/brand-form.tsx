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
  const [pend, setPend] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState(brand?.name || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [country, setCountry] = useState(brand?.country || 'IN');
  const [desc] = useState(brand?.description || '');
  const [status, setStatus] = useState(brand?.status || 'active');
  const [color] = useState(brand?.color || '');
  const [logo] = useState(brand?.logo || '');

  const [showDel, setShowDel] = useState(false);
  const [delPw, setDelPw] = useState('');
  const [delErr, setDelErr] = useState<string | null>(null);
  const [delting, setDelting] = useState(false);

  const lastUpdated = brand?.updatedAt
    ? new Date(brand.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
      new Date(brand.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  async function sub(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr('Name required'); return; }
    setPend(true); setErr(null);
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
    if (result?.error) { setErr(result.error); setPend(false); }
  }

  async function del() {
    if (!brand?.id) return;
    setDelting(true); setDelErr(null);
    const result = await deleteBrand(brand.id, delPw);
    if (result?.error) { setDelErr(result.error); setDelting(false); return; }
    router.push('/admin/brands');
  }

  return (
    <form onSubmit={sub} className="ce">
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
          <button type="submit" disabled={pend} className="ce-toolbar-btn ce-toolbar-btn-primary">{pend ? 'Saving…' : isEdit ? 'SAVE' : 'CREATE'}</button>
          {isEdit && <button type="button" onClick={() => setShowDel(true)} className="ce-toolbar-btn ce-toolbar-btn-danger">DELETE</button>}
        </div>
      </header>
      {err && <div className="ce-err">{err}</div>}

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
              <button type="button" onClick={() => setShowDel(true)} className="ce-toolbar-btn ce-toolbar-btn-danger">Delete Brand</button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDel && (
        <div className="ce-modal-mask">
          <div className="ce-modal">
            <div className="ce-modal-title">Confirm Deletion</div>
            <p className="ce-modal-text">This will permanently delete <strong>{brand?.name}</strong>. Products using this brand will have it unlinked.</p>
            <input type="password" placeholder="Enter password" value={delPw} onChange={e => { setDelPw(e.target.value); setDelErr(null); }}
              onKeyDown={e => { if (e.key === 'Enter') del(); }} className="admin-input" autoFocus />
            {delErr && <div className="ce-er">{delErr}</div>}
            <div className="ce-modal-btns">
              <button onClick={del} disabled={!delPw || delting} className="ce-toolbar-btn ce-toolbar-btn-danger">{delting ? 'Deleting…' : 'DELETE'}</button>
              <button onClick={() => { setShowDel(false); setDelPw(''); setDelErr(null); }} className="ce-toolbar-btn">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
