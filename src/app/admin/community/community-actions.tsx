'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetProductVotes } from '@/lib/admin/community-actions';

interface CommunityActionsProps {
  productId: string;
  productName: string;
}

export function CommunityActions({ productId, productName }: CommunityActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!confirm(`Reset all votes for "${productName}"?`)) return;
    setLoading(true);
    const result = await resetProductVotes(productId);
    if (result.error) {
      alert(result.error === 'auth_required' ? 'Please log in.' : 'Not authorized.');
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      className="btn-secondary text-xs py-1 px-3"
      onClick={handleReset}
      disabled={loading}
    >
      {loading ? '...' : 'Reset Votes'}
    </button>
  );
}
