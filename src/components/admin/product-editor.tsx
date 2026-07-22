'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { DeletePasswordModal } from './delete-password-modal';
import { AdminHeader } from './admin-header';
import { StickySaveBar } from './sticky-save-bar';
import { ProductBasicSection } from './product-basic-section';
import { ProductImageSection } from './product-image-section';
import { ProductSeoSection } from './product-seo-section';
import { ProductMetadataSection } from './product-metadata-section';
import { useScrollSpy } from './hooks/use-scroll-spy';
import { useDeleteEntity } from './hooks/use-delete-entity';
import { createProduct, updateProduct, deleteProduct, upsertProductImages } from '@/lib/admin/actions';
import type { Brand, Product, ProductImage } from '@/lib/admin/spec-types';

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
  onFormSubmit?: (formData: FormData, productId?: string) => Promise<void>;
  renderForm?: () => React.ReactNode;
}

const SECTION_META: Record<string, { icon: string; label: string }> = {
  basic:     { icon: '📝', label: 'Basic Info' },
  images:    { icon: '🖼', label: 'Images' },
  specs:     { icon: '⚙', label: 'Specifications' },
  vendors:   { icon: '🏪', label: 'Vendor Information' },
  seo:       { icon: '🔍', label: 'SEO' },
  metadata:  { icon: '📋', label: 'Metadata' },
};

export function ProductEditor({
  product, brands, productType, productLabel, productIcon,
  images, onImagesChange, specContent, vendorContent, extraActions, onFormSubmit, renderForm,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const {
    showDeleteModal, setShowDeleteModal,
    deletePassword, setDeletePassword,
    deleteError, setDeleteError,
    deleting, handleDelete,
  } = useDeleteEntity(
    (id, password) => deleteProduct(id, password),
    product?.id ?? '',
    `/admin/products/${productType}`,
  );

  const sectionIds = Object.keys(SECTION_META).filter((id) => {
    if (id === 'specs' && !specContent) return false;
    if (id === 'vendors' && !vendorContent) return false;
    return true;
  });
  const { activeSection, scrollToSection } = useScrollSpy(sectionIds);

  const isEdit = !!product;
  const catLabel = productLabel.toUpperCase();

  useEffect(() => {
    if (!hasChanges) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasChanges]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set('productType', productType);

    let productId = product?.id;
    if (isEdit) {
      const result = await updateProduct(product!.id, form);
      if (result?.error) { setError(result.error); setPending(false); return; }
    } else {
      const result = await createProduct(form);
      if (result?.error) { setError(result.error); setPending(false); return; }
      productId = result.id;
    }

    if (productId) {
      await upsertProductImages(productId, images);
    }

    if (onFormSubmit) {
      await onFormSubmit(new FormData(formRef.current!), productId);
    }

    setHasChanges(false);
    if (!isEdit) { window.location.href = `/admin/products/${productType}`; return; }
    window.location.reload();
  }

  return (
    <>
      <Navbar />
      <div className="page-body pt-28">
        <AdminHeader
          breadcrumb={isEdit ? 'EDITING' : 'ADDING'}
          title={isEdit ? product!.name : `NEW ${catLabel}`}
          subtitle={isEdit ? `Editing ${product!.name}` : undefined}
          cancelHref={`/admin/products/${productType}`}
          isEdit={isEdit}
          onDelete={() => setShowDeleteModal(true)}
          pending={pending}
          pendingLabel="SAVING..."
          saveLabel={isEdit ? `SAVE ${catLabel}` : `CREATE ${catLabel}`}
          extraActions={extraActions}
          formId="pe-editor-form"
        />

        {error && <div className="pe-error">{error}</div>}

        <div className="pe-layout">
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

          <div className="pe-main">
            <form ref={formRef} id="pe-editor-form" onSubmit={handleSubmit} className="pe-form">
              <input type="hidden" name="image" value={images.find((i) => i.isPrimary)?.url ?? images[0]?.url ?? ''} />

              {renderForm ? (
                renderForm()
              ) : (<>
              <ProductBasicSection
                product={product}
                brands={brands}
                productLabel={productLabel}
                onFieldChange={() => !hasChanges && setHasChanges(true)}
              />

              <ProductImageSection
                images={images}
                onImagesChange={onImagesChange}
                onFieldChange={() => !hasChanges && setHasChanges(true)}
              />

              {specContent && (
                <div id="pe-section-specs">
                  {specContent}
                </div>
              )}

              {vendorContent && (
                <div id="pe-section-vendors">
                  {vendorContent}
                </div>
              )}

              <ProductSeoSection
                product={product}
                onFieldChange={() => !hasChanges && setHasChanges(true)}
              />

              <ProductMetadataSection product={product} productType={productType} />
              </>
              )}
            </form>
          </div>
        </div>

        <StickySaveBar
          visible={hasChanges}
          pending={pending}
          saveLabel={`SAVE ${catLabel}`}
          onDiscard={() => { setHasChanges(false); window.location.reload(); }}
          formId="pe-editor-form"
        />

        {showDeleteModal && (
          <DeletePasswordModal
            description={<>This will permanently delete <strong>{product?.name}</strong>. Enter password to confirm.</>}
            password={deletePassword}
            error={deleteError}
            pending={deleting}
            onPasswordChange={(val) => { setDeletePassword(val); setDeleteError(null); }}
            onConfirm={handleDelete}
            onCancel={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
          />
        )}
      </div>
    </>
  );
}
