'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

import { uploadFile } from '@/lib/utils';

import { EditorHeader } from './admin-header';
import { DangerZoneCard } from './danger-zone-card';
import { BannerBasicSection } from './banner-basic-section';
import { BannerConfigSection } from './banner-config-section';
import { BannerActionSection } from './banner-action-section';
import { BannerScheduleSection } from './banner-schedule-section';
import { BannerPreviewSection } from './banner-preview-section';
import { StickySaveBar } from './sticky-save-bar';
import { ConfirmDialog } from './confirm-dialog';
import { useToast } from './toast';

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
    try { const r = await uploadFile(f); set(r.url); } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
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
      <div className="pv-bar">
        <div className="pv-dots"><i /><i /><i /></div>
        <div className="pv-url">keydir.in</div>
      </div>
      <div className="pv-pg">
        <nav className="pv-nav">
          <span className="pv-logo">KEYDIR</span>
          {!m && <div className="pv-lnk"><span /><span /><span /><span /><span /></div>}
          <span className="pv-ham">☰</span>
        </nav>
        {type === 'hero' && (
          <div className="pv-banner">
            {img ? <img src={img} alt="" /> : <div className="pv-empty"><span>▬</span>{title || 'Banner'}</div>}
          </div>
        )}
        <div className="pv-body">
          <div className="pv-txt"><div /><div /></div>
          <div className="pv-grid"><div /><div /><div /></div>
          {type === 'inline' && (
            <div className="pv-banner pv-inline">
              {img ? <img src={img} alt="" /> : <div className="pv-empty pv-sm"><span>▦</span>{title || 'Inline'}</div>}
            </div>
          )}
          <div className="pv-grid"><div /><div /><div /></div>
        </div>
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
const STATUS = [
  { v: 'draft', l: 'Draft', c: 'var(--text-muted)' },
  { v: 'active', l: 'Active', c: 'var(--green)' },
  { v: 'paused', l: 'Paused', c: 'var(--orange)' },
  { v: 'expired', l: 'Expired', c: 'var(--red)' },
];

function getInitial(banner?: BannerData | null) {
  return {
    title: banner?.title || '',
    status: banner?.status || 'draft',
    prio: banner?.priority ?? 0,
    dts: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
    dte: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    btype: banner?.bannerType || 'hero',
    rule: banner?.displayRule || 'both',
    dimg: banner?.desktopImage || '',
    mimg: banner?.mobileImage || '',
    ltype: banner?.linkType || 'url',
    lurl: banner?.linkUrl || '',
    ntab: banner?.openNewTab ?? false,
    locs: new Set<string>((banner?.locations || []).map(l => l.location)),
  };
}

function isDirty(initial: ReturnType<typeof getInitial>, current: ReturnType<typeof getInitial>) {
  if (initial.title !== current.title) return true;
  if (initial.status !== current.status) return true;
  if (initial.prio !== current.prio) return true;
  if (initial.dts !== current.dts) return true;
  if (initial.dte !== current.dte) return true;
  if (initial.btype !== current.btype) return true;
  if (initial.rule !== current.rule) return true;
  if (initial.dimg !== current.dimg) return true;
  if (initial.mimg !== current.mimg) return true;
  if (initial.ltype !== current.ltype) return true;
  if (initial.lurl !== current.lurl) return true;
  if (initial.ntab !== current.ntab) return true;
  if (initial.locs.size !== current.locs.size) return true;
  for (const loc of initial.locs) { if (!current.locs.has(loc)) return true; }
  return false;
}

export function BannerForm({ banner, stats }: Props) {
  const edit = !!banner;
  const router = useRouter();
  const { addToast } = useToast();
  const [pend, setPend] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const init = useRef(getInitial(banner));

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

  const current = getInitial({ title, status, priority: prio, startDate: dts ? new Date(dts) : null, endDate: dte ? new Date(dte) : null, bannerType: btype, displayRule: rule, desktopImage: dimg || null, mobileImage: mimg || null, linkType: ltype, linkUrl: lurl || null, openNewTab: ntab, locations: [...locs].map(l => ({ location: l })) } as BannerData);
  const hasChanges = isDirty(init.current, current);

  const eff = status === 'active' && dte && new Date(dte) < new Date() ? 'expired' : status;
  const effD = STATUS.find(s => s.v === eff) || STATUS[0];
  const startAfterEnd = !!(dts && dte && new Date(dts) > new Date(dte));

  function tog(v: string) { setLocs(p => { const n = new Set(p); n.has(v) ? n.delete(v) : n.add(v); return n; }); }

  function resetForm() {
    const i = init.current;
    setTitle(i.title); setStatus(i.status); setPrio(i.prio);
    setDts(i.dts); setDte(i.dte); setBtype(i.btype); setRule(i.rule);
    setDimg(i.dimg); setMimg(i.mimg); setLtype(i.ltype); setLurl(i.lurl);
    setNtab(i.ntab); setLocs(new Set(i.locs));
  }

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
    if (r?.error) {
      setErr(r.error);
      addToast(r.error, 'error');
    } else {
      addToast(edit ? 'Banner updated' : 'Banner created', 'success');
      init.current = getInitial({ title, status, priority: prio, startDate: dts ? new Date(dts) : null, endDate: dte ? new Date(dte) : null, bannerType: btype, displayRule: rule, desktopImage: dimg || null, mobileImage: mimg || null, linkType: ltype, linkUrl: lurl || null, openNewTab: ntab, locations: [...locs].map(l => ({ location: l })) } as BannerData);
    }
    setPend(false);
  }

  async function del() {
    setShowDeleteConfirm(false);
    const { deleteBanner } = await import('@/lib/admin/banner-actions');
    await deleteBanner(banner!.id);
    addToast('Banner deleted', 'success');
    router.push('/admin/banners');
  }

  const ctr = stats && stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(2) : '0.00';
  const lastUpdated = stats?.updatedAt
    ? new Date(stats.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
      new Date(stats.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  return (
    <>
      <StickySaveBar
        hasChanges={hasChanges}
        isSaving={pend}
        onSave={() => { const form = document.getElementById('banner-editor') as HTMLFormElement; form?.requestSubmit(); }}
        onCancel={resetForm}
        onDelete={edit ? () => setShowDeleteConfirm(true) : undefined}
        isEdit={edit}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Banner"
        message="This will permanently delete this banner. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={del}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <form id="banner-editor" onSubmit={sub} className="ce">
        <EditorHeader
          title={edit ? title || 'Edit' : 'New Banner'}
          stats={edit ? [
            { label: 'Last updated', value: lastUpdated },
            { label: 'Clicks', value: stats?.clicks?.toLocaleString('en-IN') ?? '0' },
            { label: 'Views', value: stats?.views?.toLocaleString('en-IN') ?? '0' },
            { label: 'CTR', value: `${ctr}%` },
          ] : undefined}
          pending={pend}
          isEdit={edit}
          formId="banner-editor"
          onDelete={() => setShowDeleteConfirm(true)}
        />
        {err && <div className="ce-err">{err}</div>}

        <div className="ce-grid">
          <div className="ce-left">
            <BannerBasicSection
              title={title}
              onTitleChange={setTitle}
              status={status}
              onStatusChange={setStatus}
              prio={prio}
              onPrioChange={setPrio}
            />

            <BannerConfigSection
              btype={btype}
              onBtypeChange={setBtype}
              rule={rule}
              onRuleChange={setRule}
              locs={locs}
              onLocToggle={tog}
            />

            <BannerActionSection
              ltype={ltype}
              onLtypeChange={setLtype}
              lurl={lurl}
              onLurlChange={setLurl}
              ntab={ntab}
              onNtabChange={setNtab}
            />

            <BannerScheduleSection
              dts={dts}
              onDtsChange={setDts}
              dte={dte}
              onDteChange={setDte}
              effLabel={effD.l}
              effColor={effD.c}
              startAfterEnd={startAfterEnd}
            />

            {edit && (
              <DangerZoneCard
                description="This will permanently delete the banner."
                buttonLabel="Delete Banner"
                onAction={() => setShowDeleteConfirm(true)}
              />
            )}
          </div>

          <div className="ce-right">
            <BannerPreviewSection
              dev={dev}
              onDevChange={setDev}
              preview={<Prev img={dev === 'd' ? (dimg || null) : (mimg || null)} title={title} type={btype} dev={dev} />}
              desktopImg={<ImgCard label="Desktop Image" res="1920 × 500" url={dimg || null} set={setDimg} clr={() => setDimg('')} />}
              mobileImg={<ImgCard label="Mobile Image" res="1080 × 1350" url={mimg || null} set={setMimg} clr={() => setMimg('')} />}
              showDesktopWarn={rule !== 'mobile' && !dimg}
              showMobileWarn={rule !== 'desktop' && !mimg}
            />
          </div>
        </div>
      </form>
    </>
  );
}
