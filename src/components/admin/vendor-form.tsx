'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

import { createVendor, updateVendor, deleteVendor, updateVendorScraperConfig } from '@/lib/admin/vendor-actions';
import { DeletePasswordModal } from './delete-password-modal';
import { useDeleteEntity } from './hooks/use-delete-entity';
import { useScraperTest } from './hooks/use-scraper-test';
import { useFormSubmit } from './hooks/use-form-submit';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  website: string;
  affiliateLink: string | null;
  shippingPolicy: string | null;
  chartColor: string | null;
  enabled: boolean;
  scraperEnabled?: boolean;
  scraperEngine?: string;
  priceSelector?: string | null;
  availabilitySelector?: string | null;
  titleSelector?: string | null;
  imageSelector?: string | null;
  productExistsSelector?: string | null;
  priceAttribute?: string;
  availabilityAttribute?: string;
  customHeaders?: string | null;
  cloudflareProtected?: boolean;
  useJavaScriptRendering?: boolean;
  customScraper?: string | null;
  scraperNotes?: string | null;
  scraperVersion?: number;
}

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const { pending, error, setError, run } = useFormSubmit();
  const {
    showDeleteModal, setShowDeleteModal,
    deletePassword, setDeletePassword,
    deleteError, setDeleteError,
    deleting, handleDelete,
  } = useDeleteEntity(deleteVendor, vendor?.id || '', '/admin/vendors');
  const { testUrl, setTestUrl, testResult, testing, handleTest } = useScraperTest(vendor?.id || '');
  const [configSaved, setConfigSaved] = useState(false);
  const [chartColor, setChartColor] = useState(vendor?.chartColor ?? '#22C55E');
  const isEdit = !!vendor;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await run(() => isEdit ? updateVendor(vendor!.id, form) : createVendor(form));
  }

  async function handleSaveScraperConfig(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setConfigSaved(false);
    const form = new FormData(e.currentTarget);
    const ok = await run(() => updateVendorScraperConfig(vendor!.id, form));
    if (ok) setConfigSaved(true);
  }

  return (
    <>
      <Navbar />
      <div className="page-body pt-28">
        <div className="sec-head">
          <h2 className="text-2xl">
            {isEdit ? 'EDIT' : 'ADD'} <em className="text-[var(--green)]">VENDOR</em>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="neo-card p-8 max-w-2xl">
          {error && <div className="badge b-red mb-4 block text-sm px-4 py-2">{error}</div>}

          <div className="admin-field">
            <label className="admin-label">Vendor Name *</label>
            <input name="name" required defaultValue={vendor?.name} className="admin-input" placeholder="e.g. Meckeys" />
          </div>

          <div className="admin-field">
            <label className="admin-label">Website *</label>
            <input name="website" required type="url" defaultValue={vendor?.website} className="admin-input" placeholder="https://meckeys.com" />
          </div>

          <div className="admin-field">
            <label className="admin-label">Affiliate Link</label>
            <input name="affiliateLink" defaultValue={vendor?.affiliateLink ?? ''} className="admin-input" placeholder="https://..." />
          </div>

          <div className="admin-field">
            <label className="admin-label">Shipping Policy</label>
            <textarea name="shippingPolicy" rows={2} defaultValue={vendor?.shippingPolicy ?? ''} className="admin-input" placeholder="Free shipping above ₹2000, flat ₹99 below..." />
          </div>

          <div className="admin-field">
            <label className="admin-label">Chart Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={chartColor}
                className="w-10 h-10 cursor-pointer border-0 bg-transparent p-0"
                onChange={(e) => setChartColor(e.target.value)}
              />
              <input
                type="text"
                name="chartColor"
                value={chartColor}
                className="admin-input font-mono text-sm"
                placeholder="#22C55E"
                pattern="^#[0-9a-fA-F]{6}$"
                maxLength={7}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) setChartColor(v);
                }}
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="filter-option">
              <input type="checkbox" name="enabled" defaultChecked={vendor?.enabled ?? true} />
              <span className="admin-label" style={{ margin: 0 }}>Enabled</span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? 'SAVING...' : isEdit ? 'UPDATE VENDOR →' : 'CREATE VENDOR →'}
            </button>
            <Link href="/admin/vendors" className="btn-secondary">Cancel</Link>
            {isEdit && (
              <button type="button" disabled={pending} onClick={() => setShowDeleteModal(true)} className="btn-secondary" style={{ color: 'var(--red)', marginLeft: 'auto' }}>
                DELETE VENDOR
              </button>
            )}
          </div>
        </form>

        {/* Scraper Configuration — edit only */}
        {isEdit && (
          <form onSubmit={handleSaveScraperConfig} className="neo-card p-8 max-w-2xl mt-6">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-6">
              <h2>SCRAPER <em className="text-[var(--cyan)]">CONFIGURATION</em></h2>
              {vendor.scraperVersion && vendor.scraperVersion > 0 && (
                <span className="badge b-green text-xs font-mono">v{vendor.scraperVersion}</span>
              )}
            </div>

            <div className="admin-field">
              <label className="filter-option">
                <input type="checkbox" name="scraperEnabled" defaultChecked={vendor.scraperEnabled ?? false} />
                <span className="admin-label" style={{ margin: 0 }}>Enable Scraper</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="admin-field">
                <label className="admin-label">Engine</label>
                <select name="scraperEngine" defaultValue={vendor.scraperEngine || 'cheerio'} className="admin-input">
                  <option value="cheerio">Cheerio (fast, no JS)</option>
                  <option value="playwright">Playwright (JS rendering)</option>
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">Custom Scraper</label>
                <input name="customScraper" defaultValue={vendor.customScraper ?? ''} className="admin-input" placeholder="e.g. meckeys (leave empty for generic)" />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">Price CSS Selector *</label>
              <input name="priceSelector" defaultValue={vendor.priceSelector ?? ''} className="admin-input font-mono text-sm" placeholder='e.g. .price, [data-price], meta[property="product:price:amount"]' />
              <p className="text-xs text-[var(--text-dim)] mt-1">Comma-separated. First match wins.</p>
            </div>

            <div className="admin-field">
              <label className="admin-label">Availability CSS Selector</label>
              <input name="availabilitySelector" defaultValue={vendor.availabilitySelector ?? ''} className="admin-input font-mono text-sm" placeholder='e.g. .stock-status, .availability' />
            </div>

            <div className="admin-field">
              <label className="admin-label">Product Title Selector</label>
              <input name="titleSelector" defaultValue={vendor.titleSelector ?? ''} className="admin-input font-mono text-sm" placeholder='e.g. h1.product-title' />
            </div>

            <div className="admin-field">
              <label className="admin-label">Product Image Selector</label>
              <input name="imageSelector" defaultValue={vendor.imageSelector ?? ''} className="admin-input font-mono text-sm" placeholder='e.g. .product-image img' />
            </div>

            <div className="admin-field">
              <label className="admin-label">Product Exists Selector</label>
              <input name="productExistsSelector" defaultValue={vendor.productExistsSelector ?? ''} className="admin-input font-mono text-sm" placeholder='e.g. .add-to-cart (if missing, product is 404)' />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="admin-field">
                <label className="admin-label">Price Attribute</label>
                <select name="priceAttribute" defaultValue={vendor.priceAttribute || 'text'} className="admin-input">
                  <option value="text">Text Content</option>
                  <option value="content">Content (meta)</option>
                  <option value="data-price">data-price</option>
                  <option value="href">href</option>
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">Availability Attribute</label>
                <select name="availabilityAttribute" defaultValue={vendor.availabilityAttribute || 'text'} className="admin-input">
                  <option value="text">Text Content</option>
                  <option value="class">Class</option>
                  <option value="data-status">data-status</option>
                </select>
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">Custom Headers (JSON)</label>
              <textarea name="customHeaders" rows={3} defaultValue={vendor.customHeaders ?? ''} className="admin-input font-mono text-xs" placeholder='{"Accept-Language": "en-IN", "Cookie": "..."}' />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="admin-field">
                <label className="filter-option">
                  <input type="checkbox" name="cloudflareProtected" defaultChecked={vendor.cloudflareProtected ?? false} />
                  <span className="admin-label" style={{ margin: 0 }}>Cloudflare Protected</span>
                </label>
              </div>

              <div className="admin-field">
                <label className="filter-option">
                  <input type="checkbox" name="useJavaScriptRendering" defaultChecked={vendor.useJavaScriptRendering ?? false} />
                  <span className="admin-label" style={{ margin: 0 }}>Use JavaScript Rendering</span>
                </label>
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">Notes</label>
              <textarea name="scraperNotes" rows={2} defaultValue={vendor.scraperNotes ?? ''} className="admin-input" placeholder="Internal notes about this vendor's scraper..." />
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={pending} className="btn-primary">
                {pending ? 'SAVING...' : 'SAVE SCRAPER CONFIG →'}
              </button>
              {configSaved && <span className="text-[var(--green)] text-sm self-center">Saved!</span>}
            </div>
          </form>
        )}

        {/* Test Scraper — edit only */}
        {isEdit && (
          <div className="neo-card p-8 max-w-2xl mt-6">
            <div className="sec-head border-b-[3px] border-[var(--border)] pb-3 mb-6">
              <h2>TEST <em className="text-[var(--purple)]">SCRAPER</em></h2>
            </div>

            <div className="admin-field">
              <label className="admin-label">Test URL</label>
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="admin-input"
                placeholder="https://example.com/product/keyboard"
              />
            </div>

            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !testUrl}
              className="btn-secondary"
            >
              {testing ? 'TESTING...' : 'TEST SCRAPER'}
            </button>

            {testResult && (
              <div className="mt-4 p-4 rounded-lg bg-black/20 font-mono text-sm space-y-1">
                <div>
                  <span className="text-[var(--text-dim)]">Success: </span>
                  <span className={testResult.success ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
                    {String(testResult.success)}
                  </span>
                </div>
                {testResult.price != null && (
                  <div>
                    <span className="text-[var(--text-dim)]">Price: </span>
                    <span className="text-[var(--cyan)]">₹{Number(testResult.price).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {testResult.availability && (
                  <div>
                    <span className="text-[var(--text-dim)]">Availability: </span>
                    <span>{String(testResult.availability)}</span>
                  </div>
                )}
                {testResult.title && (
                  <div>
                    <span className="text-[var(--text-dim)]">Title: </span>
                    <span>{String(testResult.title)}</span>
                  </div>
                )}
                {testResult.image && (
                  <div>
                    <span className="text-[var(--text-dim)]">Image: </span>
                    <span className="break-all">{String(testResult.image).substring(0, 80)}...</span>
                  </div>
                )}
                {testResult.error && (
                  <div>
                    <span className="text-[var(--text-dim)]">Error: </span>
                    <span className="text-[var(--red)]">{String(testResult.error)}</span>
                  </div>
                )}
                {testResult.httpStatus && (
                  <div>
                    <span className="text-[var(--text-dim)]">HTTP: </span>
                    <span>{String(testResult.httpStatus)}</span>
                  </div>
                )}
                {testResult.responseTimeMs != null && (
                  <div>
                    <span className="text-[var(--text-dim)]">Response Time: </span>
                    <span>{String(testResult.responseTimeMs)}ms</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeletePasswordModal
          description={<>This will permanently delete <strong>{vendor?.name}</strong> and all its product listings. Enter password to confirm.</>}
          password={deletePassword}
          error={deleteError}
          pending={deleting}
          onPasswordChange={(val) => { setDeletePassword(val); setDeleteError(null); }}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
        />
      )}
    </>
  );
}
