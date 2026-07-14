'use client';

import { deleteBanner, toggleBanner, duplicateBanner } from '@/lib/admin/banner-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function BannerActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleBanner(id, status === 'active' ? 'draft' : 'active');
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('Delete this banner?')) return;
    setLoading(true);
    await deleteBanner(id);
    router.refresh();
  }

  async function handleDuplicate() {
    setLoading(true);
    await duplicateBanner(id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleToggle} disabled={loading} className={`badge cursor-pointer ${status === 'active' ? 'b-green' : 'b-red'}`}>
        {status === 'active' ? 'Active' : 'Draft'}
      </button>
      <button onClick={handleDuplicate} disabled={loading} className="text-xs text-[var(--text-muted)] hover:text-[var(--yellow)]">
        Duplicate
      </button>
      <button onClick={handleDelete} disabled={loading} className="text-xs text-[var(--text-muted)] hover:text-[var(--red)]">
        Delete
      </button>
    </div>
  );
}
