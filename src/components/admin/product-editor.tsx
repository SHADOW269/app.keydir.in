'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { useRouter } from 'next/navigation';
import { CollapsibleCard } from './collapsible-card';
import { createProduct, updateProduct, deleteProduct } from '@/lib/admin/actions';

interface Brand { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string | null;
  productType: string;
  image: string | null;
  description: string | null;
  longDescription?: string | null;
  sku?: string | null;
  tags?: string[] | null;
  releaseDate?: string | null;
  status?: string;
  featured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  createdAt?: string | Date;
}
interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface Props {
  product?: Product;
  brands: Brand[];
  productType: string;
  productLabel: string;
  productIcon: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  specContent?: React.ReactNode;
  vendorContent?: React.ReactNode;
  extraActions?: React.ReactNode;
  onFormSubmit?: (formData: FormData) => Promise<void>;
}

const SECTION_META: Record<string, { icon: string; label: string }> = {
  basic:     { icon: '📝', label: 'Basic Info' },
  images:    { icon: '🖼', label: 'Images' },
  specs:     { icon: '⚙', label: 'Specifications' },
  vendors:   { icon: '🏪', label: 'Vendors' },
  seo:       { icon: '🔍', label: 'SEO' },
  metadata:  { icon: '📋', label: 'Metadata' },
};

export function ProductEditor({
  product, brands, productType, productLabel, productIcon,
  images, onImagesChange, specContent, vendorContent, extraActions, onFormSubmit,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const isEdit = !!product;
  const catLabel = productLabel.toUpperCase();

  // Before unload
  useEffect(() => {
    if (!hasChanges) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasChanges]);

  // Scroll tracking
  useEffect(() => {
    const sectionEls = Object.keys(SECTION_META)
      .map((id) => document.getElementById(`pe-section-${id}`))
      .filter(Boolean) as HTMLElement[];
    if (!sectionEls.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id.replace('pe-section-', ''));
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(`pe-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set('productType', productType);

    if (isEdit) {
      const result = await updateProduct(product!.id, form);
      if (result?.error) { setError(result.error); setPending(false); return; }
    } else {
      const result = await createProduct(form);
      if (result?.error) { setError(result.error); setPending(false); return; }
    }

    if (onFormSubmit) {
      await onFormSubmit(new FormData(formRef.current!));
    }

    setHasChanges(false);
    if (!isEdit) { window.location.href = `/admin/products/${productType}`; return; }
    window.location.reload();
  }

  async function handleDelete() {
    if (!product?.id) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteProduct(product.id, deletePassword);
    if (result?.error) { setDeleteError(result.error); setDeleting(false); return; }
    router.push(`/admin/products/${productType}`);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Navbar />
      <div className="page-body pt-28">
        {/* Header */}
        <div className="pe-header">
          <div className="pe-header-left">
            <div className="pe-breadcrumb">
              <span>KEYBOARD DATABASE</span>
              <span className="pe-bc-sep">/</span>
              <span>{isEdit ? 'EDITING' : 'ADDING'}</span>
            </div>
            <h1 className="pe-title">
              {isEdit ? product!.name : `NEW ${catLabel}`}
              {isEdit && <em> {catLabel}</em>}
            </h1>
            {isEdit && <div className="pe-subtitle">Editing {product!.name}</div>}
          </div>
          <div className="pe-header-actions">
            <Link href={`/admin/products/${productType}`} className="btn-secondary">CANCEL</Link>
            {isEdit && (
              <button type="button" onClick={() => setShowDeleteModal(true)} className="btn-danger">DELETE</button>
            )}
            {extraActions}
            <button type="submit" form="pe-editor-form" disabled={pending} className="btn-primary">
              {pending ? 'SAVING...' : isEdit ? `SAVE ${catLabel}` : `CREATE ${catLabel}`}
            </button>
          </div>
        </div>

        {error && <div className="pe-error">{error}</div>}

        {/* Two-column layout */}
        <div className="pe-layout">
          {/* Sidebar */}
          <nav className="pe-sidebar">
            <div className="pe-sidebar-inner">
              {Object.entries(SECTION_META)
                .filter(([id]) => {
                  if (id === 'specs' && !specContent) return false;
                  if (id === 'vendors' && !vendorContent) return false;
                  return true;
                })
                .map(([id, meta]) => (
                <button
                  key={id}
                  type="button"
                  className={`pe-nav-item ${activeSection === id ? 'pe-nav-item--active' : ''}`}
                  onClick={() => scrollToSection(id)}
                >
                  <span className="pe-nav-icon">{meta.icon}</span>
                  <span className="pe-nav-label">{meta.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main content */}
          <div className="pe-main">
            <form ref={formRef} id="pe-editor-form" onSubmit={handleSubmit} className="pe-form">

              {/* Basic Info */}
              <div id="pe-section-basic">
                <CollapsibleCard title="Basic Information" icon="📝" id="pe-card-basic">
                  <div className="pe-field pe-field--full">
                    <label className="pe-label">Product Name <span className="pe-required">*</span></label>
                    <input name="name" required defaultValue={product?.name} className="pe-input" placeholder={`e.g. ${productLabel === 'Switch' ? 'Gateron Oil King, Cherry MX Brown' : 'Product name'}`} onChange={() => !hasChanges && setHasChanges(true)} />
                  </div>
                  <div className="pe-row-2">
                    <div className="pe-field">
                      <label className="pe-label">Brand</label>
                      <select name="brandId" defaultValue={product?.brandId ?? ''} className="pe-select" onChange={() => !hasChanges && setHasChanges(true)}>
                        <option value="">— No Brand —</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="pe-field">
                      <label className="pe-label">SKU</label>
                      <input name="sku" defaultValue={product?.sku ?? ''} className="pe-input" placeholder="Internal SKU" onChange={() => !hasChanges && setHasChanges(true)} />
                    </div>
                  </div>
                  <div className="pe-field pe-field--full">
                    <label className="pe-label">Short Description</label>
                    <input name="description" defaultValue={product?.description ?? ''} className="pe-input" placeholder="Brief description for cards and search results" maxLength={200} onChange={() => !hasChanges && setHasChanges(true)} />
                  </div>
                  <div className="pe-field pe-field--full">
                    <label className="pe-label">Long Description</label>
                    <div className="pe-textarea-wrap">
                      <textarea name="longDescription" defaultValue={product?.longDescription ?? ''} className="pe-textarea" placeholder="Detailed description — specs, features, use case..." maxLength={2000} onInput={(e) => { if (!hasChanges) setHasChanges(true); }} />
                    </div>
                  </div>
                  <div className="pe-row-2">
                    <div className="pe-field">
                      <label className="pe-label">Status</label>
                      <select name="status" defaultValue={product?.status ?? 'active'} className="pe-select" onChange={() => !hasChanges && setHasChanges(true)}>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="pe-field">
                      <label className="pe-label">Release Date</label>
                      <input type="date" name="releaseDate" defaultValue={product?.releaseDate ?? ''} className="pe-input" onChange={() => !hasChanges && setHasChanges(true)} />
                    </div>
                  </div>
                </CollapsibleCard>
              </div>

              {/* Images */}
              <div id="pe-section-images">
                <CollapsibleCard title="Images" icon="🖼" id="pe-card-images">
                  <div className="pe-images-section">
                    <div className="pe-image-list">
                      {images.map((img, i) => (
                        <div key={img.id || i} className={`pe-image-thumb ${img.isPrimary ? 'pe-image-thumb--primary' : ''}`}>
                          <img src={img.url} alt={img.alt || ''} />
                          <div className="pe-image-actions">
                            {!img.isPrimary && (
                              <button type="button" className="pe-image-btn" onClick={() => {
                                const next = images.map((im, j) => ({ ...im, isPrimary: j === i }));
                                onImagesChange(next);
                                setHasChanges(true);
                              }}>Primary</button>
                            )}
                            <button type="button" className="pe-image-btn pe-image-btn--danger" onClick={() => {
                              onImagesChange(images.filter((_, j) => j !== i));
                              setHasChanges(true);
                            }}>Remove</button>
                          </div>
                          {img.isPrimary && <span className="pe-image-primary-badge">PRIMARY</span>}
                        </div>
                      ))}
                    </div>
                    <div className="pe-image-add">
                      <label className="pe-label">Add Image URL</label>
                      <div className="pe-image-add-row">
                        <input type="url" className="pe-input" placeholder="https://..." id="pe-image-url-input" />
                        <button type="button" className="btn-secondary" onClick={() => {
                          const input = document.getElementById('pe-image-url-input') as HTMLInputElement;
                          if (!input?.value) return;
                          const newImg: ProductImage = { url: input.value, sortOrder: images.length, isPrimary: images.length === 0 };
                          onImagesChange([...images, newImg]);
                          input.value = '';
                          setHasChanges(true);
                        }}>+ Add</button>
                      </div>
                    </div>
                  </div>
                </CollapsibleCard>
              </div>

              {/* Specifications — product-type specific */}
              {specContent && (
                <div id="pe-section-specs">
                  {specContent}
                </div>
              )}

              {/* Vendors — product-type specific */}
              {vendorContent && (
                <div id="pe-section-vendors">
                  {vendorContent}
                </div>
              )}

              {/* SEO */}
              <div id="pe-section-seo">
                <CollapsibleCard title="SEO" icon="🔍" id="pe-card-seo" defaultOpen={false}>
                  <div className="pe-field pe-field--full">
                    <label className="pe-label">Meta Title</label>
                    <input name="metaTitle" defaultValue={product?.metaTitle ?? ''} className="pe-input" placeholder="SEO title — falls back to product name" maxLength={70} onChange={() => !hasChanges && setHasChanges(true)} />
                    <span className="pe-hint">{(product?.metaTitle ?? '').length}/70 characters</span>
                  </div>
                  <div className="pe-field pe-field--full">
                    <label className="pe-label">Meta Description</label>
                    <div className="pe-textarea-wrap">
                      <textarea name="metaDescription" defaultValue={product?.metaDescription ?? ''} className="pe-textarea pe-textarea--short" placeholder="SEO description — falls back to short description" maxLength={160} onInput={() => !hasChanges && setHasChanges(true)} />
                    </div>
                    <span className="pe-hint">{(product?.metaDescription ?? '').length}/160 characters</span>
                  </div>
                  <div className="pe-field pe-field--full">
                    <label className="pe-label">OG Image URL</label>
                    <input name="ogImage" defaultValue={product?.ogImage ?? ''} className="pe-input" placeholder="Open Graph image — falls back to product image" onChange={() => !hasChanges && setHasChanges(true)} />
                  </div>
                </CollapsibleCard>
              </div>

              {/* Metadata */}
              <div id="pe-section-metadata">
                <CollapsibleCard title="Metadata" icon="📋" id="pe-card-metadata" defaultOpen={false}>
                  <div className="pe-row-2">
                    <div className="pe-field">
                      <label className="pe-label">Product ID</label>
                      <input className="pe-input" value={product?.id ?? 'New'} disabled />
                    </div>
                    <div className="pe-field">
                      <label className="pe-label">Slug</label>
                      <input className="pe-input" value={product?.slug ?? 'Auto-generated'} disabled />
                    </div>
                  </div>
                  <div className="pe-row-2">
                    <div className="pe-field">
                      <label className="pe-label">Product Type</label>
                      <input className="pe-input" value={productType} disabled />
                    </div>
                    <div className="pe-field">
                      <label className="pe-label">Created</label>
                      <input className="pe-input" value={product?.createdAt ? new Date(product.createdAt as unknown as string).toLocaleDateString() : '—'} disabled />
                    </div>
                  </div>
                </CollapsibleCard>
              </div>

            </form>
          </div>
        </div>

        {/* Sticky save bar */}
        <div className={`pe-save-bar ${hasChanges ? 'visible' : ''}`}>
          <div className="pe-save-bar-label">
            <span className="pe-save-bar-dot" />
            Unsaved Changes
          </div>
          <div className="pe-save-bar-actions">
            <button type="button" onClick={() => { setHasChanges(false); window.location.reload(); }} className="btn-secondary">CANCEL</button>
            <button type="submit" form="pe-editor-form" disabled={pending} className="btn-primary">
              {pending ? 'SAVING...' : `SAVE ${catLabel}`}
            </button>
          </div>
        </div>

        {/* Delete modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="neo-card max-w-sm w-full p-6">
              <h3 className="pe-modal-title">Confirm Deletion</h3>
              <p className="pe-modal-text">This will permanently delete <strong>{product?.name}</strong>. Enter password to confirm.</p>
              <input type="password" placeholder="Enter password" value={deletePassword} onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(); }} className="pe-input" autoFocus />
              {deleteError && <p className="pe-modal-error">{deleteError}</p>}
              <div className="pe-modal-actions">
                <button onClick={handleDelete} disabled={!deletePassword || deleting} className="btn-danger flex-1">{deleting ? 'DELETING...' : 'DELETE'}</button>
                <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }} className="btn-secondary flex-1">CANCEL</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
