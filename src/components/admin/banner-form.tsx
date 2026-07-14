'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';

const LOCATIONS = [
  { value: 'home', label: 'Home' },
  { value: 'keyboards', label: 'Keyboards' },
  { value: 'switches', label: 'Switches' },
  { value: 'keycaps', label: 'Keycaps' },
  { value: 'mouse', label: 'Mouse' },
  { value: 'vendors', label: 'Vendors' },
  { value: 'builders', label: 'Builders' },
  { value: 'brands', label: 'Brands' },
  { value: 'search', label: 'Search Results' },
  { value: 'guide', label: 'Guide' },
  { value: 'about', label: 'About' },
];

const LINK_TYPES = [
  { value: 'url', label: 'Open URL' },
  { value: 'internal', label: 'Internal Page' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'product', label: 'Keyboard' },
  { value: 'category', label: 'Category' },
];

interface BannerData {
  id: string;
  title: string;
  status: string;
  priority: number;
  startDate: Date | null;
  endDate: Date | null;
  desktopImage: string | null;
  mobileImage: string | null;
  linkType: string;
  linkUrl: string | null;
  openNewTab: boolean;
  displayRule: string;
  bannerType: string;
  locations: { location: string }[];
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

function ImageUpload({ label, currentUrl, onUploaded, aspect }: { label: string; currentUrl: string | null; onUploaded: (url: string) => void; aspect?: string }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    try {
      const url = await uploadFile(file);
      onUploaded(url);
      setPreview(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setPreview(null);
    onUploaded('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <input type="hidden" name={label.toLowerCase().replace(/\s+/g, '')} value={preview || ''} />
      {aspect && <div className="text-xs text-[var(--text-dim)] mb-2">{aspect}</div>}
      {preview ? (
        <div className="relative border border-[var(--border)]">
          <img src={preview} alt={label} className="w-full object-cover" style={{ maxHeight: 200 }} />
          <button type="button" onClick={handleClear} className="absolute top-2 right-2 bg-[var(--text)] text-[var(--bg)] w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-[var(--red)]">
            <X size={12} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-[var(--yellow)] transition-colors">
          <Upload size={20} className="text-[var(--text-muted)] mb-2" />
          <span className="text-xs font-bold uppercase text-[var(--text-muted)]">{uploading ? 'Uploading...' : 'Click to upload'}</span>
          <span className="text-[10px] text-[var(--text-dim)]">JPG, PNG, WebP, AVIF (max 5MB)</span>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        </label>
      )}
      {error && <div className="text-xs text-[var(--red)] mt-1">{error}</div>}
    </div>
  );
}

export function BannerForm({ banner }: { banner?: BannerData | null }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [desktopImage, setDesktopImage] = useState(banner?.desktopImage || '');
  const [mobileImage, setMobileImage] = useState(banner?.mobileImage || '');
  const [linkType, setLinkType] = useState(banner?.linkType || 'url');
  const isEdit = !!banner;
  const router = useRouter();

  const selectedLocations = new Set((banner?.locations || []).map((l) => l.location));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    form.set('desktopImage', desktopImage);
    form.set('mobileImage', mobileImage);

    const { createBanner, updateBanner } = await import('@/lib/admin/banner-actions');
    const result = isEdit
      ? await updateBanner(banner!.id, form)
      : await createBanner(form);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <>
      <div className="page-body pt-28">
        <div className="sec-head">
          <h2>{isEdit ? 'EDIT' : 'NEW'} <em className="text-[var(--yellow)]">BANNER</em></h2>
          <Link href="/admin/banners" className="btn-secondary btn-sm">← Back</Link>
        </div>

        <form onSubmit={handleSubmit} className="neo-card p-8 max-w-3xl">
          {error && <div className="badge b-red mb-4 block text-sm px-4 py-2">{error}</div>}

          <div className="grid grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="admin-field">
                <label className="admin-label">Banner Name *</label>
                <input name="title" required defaultValue={banner?.title} className="admin-input" placeholder="e.g. Summer Sale" />
              </div>

              <div className="admin-field">
                <label className="admin-label">Status</label>
                <select name="status" defaultValue={banner?.status || 'draft'} className="admin-input">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">Priority</label>
                <input name="priority" type="number" defaultValue={banner?.priority ?? 0} className="admin-input" min="0" />
                <div className="text-xs text-[var(--text-dim)] mt-1">Lower number shows first</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field">
                  <label className="admin-label">Start Date</label>
                  <input name="startDate" type="date" defaultValue={banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : ''} className="admin-input" />
                </div>
                <div className="admin-field">
                  <label className="admin-label">End Date</label>
                  <input name="endDate" type="date" defaultValue={banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''} className="admin-input" />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">Banner Type</label>
                <select name="bannerType" defaultValue={banner?.bannerType || 'hero'} className="admin-input">
                  <option value="hero">Hero Banner (full-width)</option>
                  <option value="inline">Inline Banner (between products)</option>
                  <option value="sidebar">Sidebar Banner</option>
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">Display On</label>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {LOCATIONS.map((loc) => (
                    <label key={loc.value} className="flex items-center gap-2 cursor-pointer py-1">
                      <input type="checkbox" name={`loc_${loc.value}`} defaultChecked={selectedLocations.has(loc.value)} className="accent-[var(--yellow)]" />
                      {loc.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <ImageUpload label="Desktop Image" currentUrl={banner?.desktopImage ?? null} onUploaded={setDesktopImage} aspect="Recommended: 1920×500 · JPG, PNG, WebP, AVIF" />

              <ImageUpload label="Mobile Image" currentUrl={banner?.mobileImage ?? null} onUploaded={setMobileImage} aspect="Optional · 1080×1080 or 1080×1350" />

              <div className="admin-field">
                <label className="admin-label">Display Rule</label>
                <select name="displayRule" defaultValue={banner?.displayRule || 'both'} className="admin-input">
                  <option value="both">Both (Desktop + Mobile)</option>
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Link action section */}
          <div className="border-t border-[var(--border)] pt-6 mt-6">
            <h3 className="text-sm font-bold mb-4 text-[var(--yellow)] uppercase tracking-wider">Click Action</h3>
            <p className="text-xs text-[var(--text-dim)] mb-4">The entire banner is clickable. Choose where it links to.</p>

            <div className="flex flex-wrap gap-3 mb-4">
              {LINK_TYPES.map((lt) => (
                <label key={lt.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="linkType" value={lt.value} checked={linkType === lt.value} onChange={() => setLinkType(lt.value)} className="accent-[var(--yellow)]" />
                  <span className="text-sm">{lt.label}</span>
                </label>
              ))}
            </div>

            <div className="admin-field">
              <label className="admin-label">
                {linkType === 'url' ? 'URL' :
                 linkType === 'internal' ? 'Internal Path' :
                 linkType === 'vendor' ? 'Vendor Slug' :
                 linkType === 'product' ? 'Product Slug' :
                 linkType === 'category' ? 'Category Slug' : 'URL'}
              </label>
              <input
                name="linkUrl"
                defaultValue={banner?.linkUrl ?? ''}
                className="admin-input font-mono text-xs"
                placeholder={
                  linkType === 'url' ? 'https://example.com' :
                  linkType === 'internal' ? '/keyboards' :
                  linkType === 'vendor' ? 'genesispc' :
                  linkType === 'product' ? 'rainy75' :
                  linkType === 'category' ? 'keyboards' : ''
                }
              />
              <div className="text-xs text-[var(--text-dim)] mt-1">
                {linkType === 'url' && 'Full URL including https://'}
                {linkType === 'internal' && 'Path like /keyboards or /vendors/genesispc'}
                {linkType === 'vendor' && 'Vendor slug (e.g. genesispc)'}
                {linkType === 'product' && 'Product slug (e.g. rainy75)'}
                {linkType === 'category' && 'Category slug (e.g. keyboards)'}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="openNewTab" defaultChecked={banner?.openNewTab ?? false} className="accent-[var(--yellow)]" />
                <span className="text-sm">Open in new tab</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border)]">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? 'Saving...' : isEdit ? 'Update Banner →' : 'Create Banner →'}
            </button>
            <Link href="/admin/banners" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  );
}
