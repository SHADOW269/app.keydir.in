'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { createVendor, updateVendor } from '@/lib/admin/actions';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  website: string;
  affiliateLink: string | null;
  shippingPolicy: string | null;
  enabled: boolean;
}

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!vendor;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateVendor(vendor!.id, form)
      : await createVendor(form);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
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
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
