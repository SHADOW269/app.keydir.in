'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ══════════════════════════════════════════
   Constants
   ══════════════════════════════════════════ */
const PAGES = [
  { v: 'home', l: 'Home' }, { v: 'keyboards', l: 'Keyboards' },
  { v: 'switches', l: 'Switches' }, { v: 'keycaps', l: 'Keycaps' },
  { v: 'mouse', l: 'Mouse' },
];

const ACTIONS = [
  { v: 'url', l: 'URL' }, { v: 'internal', l: 'Page' },
  { v: 'vendor', l: 'Vendor' }, { v: 'product', l: 'Product' },
  { v: 'category', l: 'Category' },
];

const TYPES = [
  { v: 'hero', l: 'Hero Banner', d: 'Full-width homepage banner', i: '▬' },
  { v: 'inline', l: 'Inline Banner', d: 'Between content rows', i: '▦' },
  { v: 'sidebar', l: 'Sidebar Banner', d: 'Sidebar placement', i: '▐' },
];

const STATUS = [
  { v: 'draft', l: 'Draft', c: 'var(--text-muted)' },
  { v: 'active', l: 'Active', c: 'var(--green)' },
  { v: 'paused', l: 'Paused', c: 'var(--orange)' },
  { v: 'expired', l: 'Expired', c: 'var(--red)' },
];

const RULES = [
  { v: 'desktop', l: 'Desktop' }, { v: 'mobile', l: 'Mobile' }, { v: 'both', l: 'Both' },
];

/* ══════════════════════════════════════════
   Types
   ══════════════════════════════════════════ */
interface BannerData {
  id: string; title: string; status: string; priority: number;
  startDate: Date | null; endDate: Date | null;
  desktopImage: string | null; mobileImage: string | null;
  linkType: string; linkUrl: string | null; openNewTab: boolean;
  displayRule: string; bannerType: string;
  locations: { location: string }[];
}
interface Props { banner?: BannerData | null; stats?: { clicks: number; views: number; updatedAt: Date | string } }

async function up(file: File): Promise<string> {
  const fd = new FormData(); fd.append('file', file);
  const r = await fetch('/api/upload', { method: 'POST', body: fd });
  const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Upload failed'); return d.url;
}

/* ══════════════════════════════════════════
   Card
   ══════════════════════════════════════════ */
function Card({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="bc">
      <div className="bc-h">{t}</div>
      <div className="bc-b">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Seg
   ══════════════════════════════════════════ */
function Seg({ items, val, set }: { items: { v: string; l: string }[]; val: string; set: (v: string) => void }) {
  return (
    <div className="sg">
      {items.map(i => (
        <button key={i.v} type="button" onClick={() => set(i.v)}
          className={`sg-b ${val === i.v ? 'on' : ''}`}>{i.l}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   Chips
   ══════════════════════════════════════════ */
function Chips({ items, sel, tog }: { items: { v: string; l: string }[]; sel: Set<string>; tog: (v: string) => void }) {
  return (
    <div className="ck">
      {items.map(i => (
        <button key={i.v} type="button" onClick={() => tog(i.v)}
          className={`ck-b ${sel.has(i.v) ? 'on' : ''}`}>{i.l}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   ImgCard
   ══════════════════════════════════════════ */
function ImgCard({ label, res, url, set, clr }: {
  label: string; res: string; url: string | null; set: (u: string) => void; clr: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ov, setOv] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const go = useCallback(async (f: File) => {
    setBusy(true); setErr(null);
    try { set(await up(f)); } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setBusy(false); }
  }, [set]);

  return (
    <div className="iu">
      <div className="iu-hd"><span className="iu-lb">{label}</span><span className="iu-rs">{res}</span></div>
      {url ? (
        <div className="iu-prev">
          <img src={url} alt={label} />
          <div className="iu-bar">
            <button type="button" onClick={() => ref.current?.click()} className="iu-btn">Replace</button>
            <button type="button" onClick={() => { clr(); if (ref.current) ref.current.value = ''; }}
              className="iu-btn iu-rm">Remove</button>
          </div>
          <input ref={ref} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) go(f); }} className="hidden" />
        </div>
      ) : (
        <label className={`iu-drop ${ov ? 'ov' : ''}`}
          onDragOver={e => { e.preventDefault(); setOv(true); }}
          onDragLeave={() => setOv(false)}
          onDrop={e => { e.preventDefault(); setOv(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) go(f); }}>
          <span className="iu-ico">{busy ? '↻' : '↑'}</span>
          <span className="iu-tx">{busy ? 'Uploading…' : 'Drop image here or click to browse'}</span>
          <span className="iu-fm">PNG, JPG, WebP, AVIF — Max 5MB</span>
          <input ref={ref} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) go(f); }} className="hidden" />
        </label>
      )}
      {err && <div className="iu-er">{err}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   Preview — miniature KeyDir page
   ══════════════════════════════════════════ */
function Prev({ img, title, type, dev }: { img: string | null; title: string; type: string; dev: 'd' | 'm' }) {
  const m = dev === 'm';
  return (
    <div className={`pv ${m ? 'pv-m' : 'pv-d'}`}>
      {/* Chrome */}
      <div className="pv-bar">
        <div className="pv-dots"><i /><i /><i /></div>
        <div className="pv-url">keydir.in</div>
      </div>
      {/* Page */}
      <div className="pv-pg">
        <nav className="pv-nav">
          <span className="pv-logo">KEYDIR</span>
          {!m && <div className="pv-lnk"><span /><span /><span /><span /><span /></div>}
          <span className="pv-ham">☰</span>
        </nav>
        {/* Hero */}
        {type === 'hero' && (
          <div className="pv-banner">
            {img ? <img src={img} alt="" /> : <div className="pv-empty"><span>▬</span>{title || 'Banner'}</div>}
          </div>
        )}
        {/* Content */}
        <div className="pv-body">
          <div className="pv-txt"><div /><div /></div>
          <div className="pv-grid"><div /><div /><div /></div>
          {/* Inline */}
          {type === 'inline' && (
            <div className="pv-banner pv-inline">
              {img ? <img src={img} alt="" /> : <div className="pv-empty pv-sm"><span>▦</span>{title || 'Inline'}</div>}
            </div>
          )}
          <div className="pv-grid"><div /><div /><div /></div>
        </div>
        {/* Sidebar */}
        {type === 'sidebar' && (
          <div className="pv-sb">{img ? <img src={img} alt="" /> : <div className="pv-empty pv-sm"><span>▐</span>{title || 'Side'}</div>}</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   BannerForm
   ══════════════════════════════════════════ */
export function BannerForm({ banner, stats }: Props) {
  const edit = !!banner;
  const router = useRouter();
  const [pend, setPend] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState(banner?.title || '');
  const [status, setStatus] = useState(banner?.status || 'draft');
  const [prio, setPrio] = useState(banner?.priority ?? 0);
  const [dts, setDts] = useState(banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '');
  const [dte, setDte] = useState(banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '');
  const [btype, setBtype] = useState(banner?.bannerType || 'hero');
  const [rule, setRule] = useState(banner?.displayRule || 'both');
  const [dimg, setDimg] = useState(banner?.desktopImage || '');
  const [mimg, setMimg] = useState(banner?.mobileImage || '');
  const [ltype, setLtype] = useState(banner?.linkType || 'url');
  const [lurl, setLurl] = useState(banner?.linkUrl || '');
  const [ntab, setNtab] = useState(banner?.openNewTab ?? false);

  const [locs, setLocs] = useState<Set<string>>(new Set((banner?.locations || []).map(l => l.location)));
  const [dev, setDev] = useState<'d' | 'm'>('d');

  const eff = status === 'active' && dte && new Date(dte) < new Date() ? 'expired' : status;
  const effD = STATUS.find(s => s.v === eff) || STATUS[0];

  function tog(v: string) { setLocs(p => { const n = new Set(p); n.has(v) ? n.delete(v) : n.add(v); return n; }); }

  async function sub(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setErr('Name required'); return; }
    if (locs.size === 0) { setErr('Select a location'); return; }
    setPend(true); setErr(null);
    const fd = new FormData();
    fd.set('title', title); fd.set('status', status); fd.set('priority', String(prio));
    fd.set('startDate', dts); fd.set('endDate', dte); fd.set('bannerType', btype);
    fd.set('displayRule', rule); fd.set('desktopImage', dimg); fd.set('mobileImage', mimg);
    fd.set('linkType', ltype); fd.set('linkUrl', lurl);
    fd.set('openNewTab', ltype === 'url' || ntab ? 'on' : '');
    locs.forEach(l => fd.set(`loc_${l}`, 'on'));
    const { createBanner, updateBanner } = await import('@/lib/admin/banner-actions');
    const r = edit ? await updateBanner(banner!.id, fd) : await createBanner(fd);
    if (r?.error) { setErr(r.error); setPend(false); }
  }

  async function del() {
    if (!confirm('Delete?')) return;
    const { deleteBanner } = await import('@/lib/admin/banner-actions');
    await deleteBanner(banner!.id);
    router.push('/admin/banners');
  }

  const effStatus = status === 'active' && dte && new Date(dte) < new Date() ? 'expired' : status;
  const statusColor = effStatus === 'active' ? 'var(--green)' : effStatus === 'paused' ? 'var(--orange)' : effStatus === 'expired' ? 'var(--red)' : 'var(--text-muted)';
  const statusLabel = effStatus === 'active' ? 'LIVE' : effStatus.charAt(0).toUpperCase() + effStatus.slice(1);
  const ctr = stats && stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(2) : '0.00';
  const lastUpdated = stats?.updatedAt
    ? new Date(stats.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
      new Date(stats.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  return (
    <form onSubmit={sub} className="ce">
      {/* HEADER */}
      <header className="ce-hd">
        <div className="ce-hd-l">
          <div className="ce-hd-title-row">
            <span className="ce-name">{edit ? title || 'Edit' : 'New Banner'}</span>
            {edit && <span className="ce-hd-badge" style={{ borderColor: statusColor, color: statusColor }}>{statusLabel}</span>}
          </div>
          {edit && (
            <div className="ce-hd-stats">
              <span className="ce-hd-stat">Last updated <strong>{lastUpdated}</strong></span>
              <span className="ce-hd-stat-sep">•</span>
              <span className="ce-hd-stat">Clicks <strong>{stats?.clicks?.toLocaleString('en-IN') ?? '0'}</strong></span>
              <span className="ce-hd-stat-sep">•</span>
              <span className="ce-hd-stat">Views <strong>{stats?.views?.toLocaleString('en-IN') ?? '0'}</strong></span>
              <span className="ce-hd-stat-sep">•</span>
              <span className="ce-hd-stat">CTR <strong>{ctr}%</strong></span>
            </div>
          )}
        </div>
        <div className="ce-hd-r">
          <button type="submit" disabled={pend} className="ce-toolbar-btn ce-toolbar-btn-primary">{pend ? 'Saving…' : edit ? 'SAVE' : 'CREATE'}</button>
          {edit && <button type="button" onClick={del} className="ce-toolbar-btn ce-toolbar-btn-danger">DELETE</button>}
        </div>
      </header>
      {err && <div className="ce-err">{err}</div>}

      {/* TWO-COLUMN */}
      <div className="ce-grid">

        {/* ── LEFT ── */}
        <div className="ce-left">

          <Card t="Basic Information">
            <div className="ce-field">
              <label className="ce-lb">Banner Name</label>
              <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Sale 2026" />
            </div>
            <div className="ce-2c">
              <div className="ce-field">
                <label className="ce-lb">Status</label>
                <div className="sp">
                  {STATUS.map(s => (
                    <button key={s.v} type="button" onClick={() => setStatus(s.v)}
                      className={`sp-b ${status === s.v ? 'on' : ''}`}
                      style={status === s.v ? { borderColor: s.c, color: s.c } : undefined}>
                      <i className="sp-dot" style={{ background: s.c }} />{s.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ce-field">
                <label className="ce-lb">Priority</label>
                <input className="admin-input" type="number" min={0} value={prio} onChange={e => setPrio(parseInt(e.target.value) || 0)} />
                <span className="ce-hi">Lower number = shown first</span>
              </div>
            </div>
          </Card>

          <Card t="Configuration">
            <div className="ce-field">
              <label className="ce-lb">Banner Type</label>
              <div className="sc">
                {TYPES.map(t => (
                  <button key={t.v} type="button" onClick={() => setBtype(t.v)}
                    className={`sc-b ${btype === t.v ? 'on' : ''}`}>
                    <span className="sc-ic">{t.i}</span>
                    <span className="sc-body">
                      <span className="sc-nm">{t.l}</span>
                      <span className="sc-ds">{t.d}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="ce-field">
              <label className="ce-lb">Display Rule</label>
              <Seg items={RULES} val={rule} set={setRule} />
            </div>
            <div className="ce-field">
              <label className="ce-lb">Display Locations</label>
              <Chips items={PAGES} sel={locs} tog={tog} />
              {locs.size === 0 && <span className="ce-warn">Select at least one location</span>}
            </div>
          </Card>

          <Card t="Click Action">
            <div className="ce-field">
              <label className="ce-lb">Destination</label>
              <Seg items={ACTIONS} val={ltype} set={setLtype} />
            </div>
            <div className="ce-field">
              <label className="ce-lb">
                {ltype === 'url' ? 'URL' : ltype === 'internal' ? 'Path' : `${ltype[0].toUpperCase() + ltype.slice(1)} Slug`}
              </label>
              <input className="admin-input ce-mono" value={lurl} onChange={e => setLurl(e.target.value)}
                placeholder={ltype === 'url' ? 'https://example.com' : ltype === 'internal' ? '/keyboards' : 'slug'} />
            </div>
            <div className="ce-field">
              <label className="ce-cb">
                <input type="checkbox" checked={ntab} onChange={e => setNtab(e.target.checked)} disabled={ltype === 'url'} />
                Open in new tab
                {ltype === 'url' && <span className="ce-hi"> (auto for external)</span>}
              </label>
            </div>
          </Card>

          <Card t="Schedule">
            <div className="ce-2c">
              <div className="ce-field">
                <label className="ce-lb">Start Date</label>
                <input className="admin-input" type="date" value={dts} onChange={e => setDts(e.target.value)} />
              </div>
              <div className="ce-field">
                <label className="ce-lb">End Date</label>
                <input className="admin-input" type="date" value={dte} onChange={e => setDte(e.target.value)} />
              </div>
            </div>
            <div className="ce-eff">
              <span className="ce-eff-l">Effective Status:</span>
              <span className="ce-eff-v" style={{ color: effD.c }}>{effD.l}</span>
              {dts && dte && new Date(dts) > new Date(dte) && <span className="ce-warn">Start after end</span>}
            </div>
          </Card>
        </div>

        {/* ── RIGHT ── */}
        <div className="ce-right">
          <Card t="Live Preview">
            <div className="pv-tabs">
              <button type="button" onClick={() => setDev('d')} className={`pv-tab ${dev === 'd' ? 'on' : ''}`}>Desktop</button>
              <button type="button" onClick={() => setDev('m')} className={`pv-tab ${dev === 'm' ? 'on' : ''}`}>Mobile</button>
            </div>
            <Prev img={dev === 'd' ? (dimg || null) : (mimg || null)} title={title} type={btype} dev={dev} />
            <div className="pv-sep" />
            <div className="pv-img-hd">Images</div>
            <ImgCard label="Desktop Image" res="1920 × 500" url={dimg || null} set={setDimg} clr={() => setDimg('')} />
            <ImgCard label="Mobile Image" res="1080 × 1350" url={mimg || null} set={setMimg} clr={() => setMimg('')} />
            {rule !== 'mobile' && !dimg && <span className="ce-warn">Desktop image needed</span>}
            {rule !== 'desktop' && !mimg && <span className="ce-warn">Mobile image needed</span>}
          </Card>
        </div>
      </div>
    </form>
  );
}
