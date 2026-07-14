'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { voteOnProduct } from '@/lib/profile/actions';

interface VoteWidgetProps {
  productId: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'upvote' | 'downvote' | null;
  compact?: boolean;
}

export function VoteWidget({
  productId,
  upvotes: initialUp,
  downvotes: initialDown,
  userVote: initialVote = null,
  compact = false,
}: VoteWidgetProps) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initialUp);
  const [downvotes, setDownvotes] = useState(initialDown);
  const [userVote, setUserVote] = useState(initialVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(type: 'upvote' | 'downvote') {
    if (loading) return;
    setLoading(true);

    const prevUp = upvotes;
    const prevDown = downvotes;
    const prevVote = userVote;

    if (userVote === type) {
      if (type === 'upvote') setUpvotes((u) => u - 1);
      else setDownvotes((d) => d - 1);
      setUserVote(null);
    } else if (userVote) {
      if (type === 'upvote') {
        setUpvotes((u) => u + 1);
        setDownvotes((d) => d - 1);
      } else {
        setUpvotes((u) => u - 1);
        setDownvotes((d) => d + 1);
      }
      setUserVote(type);
    } else {
      if (type === 'upvote') setUpvotes((u) => u + 1);
      else setDownvotes((d) => d + 1);
      setUserVote(type);
    }

    const result = await voteOnProduct(productId, type);

    if (result.error) {
      setUpvotes(prevUp);
      setDownvotes(prevDown);
      setUserVote(prevVote);
      if (result.error === 'auth_required') {
        window.location.href = '/auth/login';
      }
    }

    setLoading(false);
    router.refresh();
  }

  if (compact) {
    return (
      <div className="vote-widget vote-widget-compact">
        <button
          className={`vote-btn up ${userVote === 'upvote' ? 'active' : ''}`}
          onClick={() => handleVote('upvote')}
          disabled={loading}
          aria-label="Upvote"
        >
          ▲ {upvotes}
        </button>
        <button
          className={`vote-btn down ${userVote === 'downvote' ? 'active' : ''}`}
          onClick={() => handleVote('downvote')}
          disabled={loading}
          aria-label="Downvote"
        >
          ▼ {downvotes}
        </button>
      </div>
    );
  }

  return (
    <div className="vote-widget">
      <button
        className={`vote-btn up ${userVote === 'upvote' ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={loading}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="vote-count">{upvotes}</span>
      <span className="vote-count">{downvotes}</span>
      <button
        className={`vote-btn down ${userVote === 'downvote' ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={loading}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
