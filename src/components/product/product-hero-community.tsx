'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { voteOnProduct } from '@/lib/profile/actions';
import { SaveButtons } from './save-buttons';
import { CompareButton } from './compare-button';

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  productPrice: number | null;
  productCategory: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'upvote' | 'downvote' | null;
  inCollection: boolean;
  showVoting?: boolean;
  showCompare?: boolean;
}

export function ProductHeroCommunity({
  productId,
  productSlug,
  productName,
  productImage,
  productPrice,
  productCategory,
  upvotes: initUp,
  downvotes: initDown,
  userVote: initVote = null,
  inCollection,
  showVoting = true,
  showCompare = false,
}: Props) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initUp);
  const [downvotes, setDownvotes] = useState(initDown);
  const [userVote, setUserVote] = useState(initVote);
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
      if (type === 'upvote') { setUpvotes((u) => u + 1); setDownvotes((d) => d - 1); }
      else { setUpvotes((u) => u - 1); setDownvotes((d) => d + 1); }
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
      if (result.error === 'auth_required') window.location.href = '/auth/login';
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="product-hero-community">
      {showVoting && (
        <>
          <span className="product-hero-community-label">COMMUNITY</span>

          <div className="product-hero-vote-cards">
            <button
              className={`product-hero-vote-card up ${userVote === 'upvote' ? 'active' : ''}`}
              onClick={() => handleVote('upvote')}
              disabled={loading}
            >
              <div className="product-hero-vote-row">
                <span className="product-hero-vote-arrow">▲</span>
                <span className="product-hero-vote-number">{upvotes}</span>
              </div>
              <span className="product-hero-vote-label">UPVOTES</span>
            </button>

            <button
              className={`product-hero-vote-card down ${userVote === 'downvote' ? 'active' : ''}`}
              onClick={() => handleVote('downvote')}
              disabled={loading}
            >
              <div className="product-hero-vote-row">
                <span className="product-hero-vote-arrow">▼</span>
                <span className="product-hero-vote-number">{downvotes}</span>
              </div>
              <span className="product-hero-vote-label">DOWNVOTES</span>
            </button>
          </div>
        </>
      )}

      <div className="product-hero-collection">
        <SaveButtons productId={productId} inCollection={inCollection} />
        {showCompare && (
          <CompareButton
            slug={productSlug}
            name={productName}
            image={productImage}
            price={productPrice}
            category={productCategory}
          />
        )}
      </div>
    </div>
  );
}
