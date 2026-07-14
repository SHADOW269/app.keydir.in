'use client';

import { useRouter } from 'next/navigation';

export function DeleteBannerButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this banner?')) return;
    const { deleteBanner } = await import('@/lib/admin/banner-actions');
    await deleteBanner(id);
    router.refresh();
  }

  return (
    <button type="button" className="btn-secondary btn-sm" onClick={handleDelete}>
      Delete
    </button>
  );
}
