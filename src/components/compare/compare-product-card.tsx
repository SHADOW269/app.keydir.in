'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { formatPrice, toNum } from '@/lib/utils';
import { voteOnProduct } from '@/lib/profile/actions';
import type { CompareProduct } from './compare-types';

interface Props {
  products: CompareProduct[];
  onRemove: (slug: string) => void;
}

export function CompareProductCards({ products, onRemove }: Props) {
  return (
    <>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onRemove={onRemove} />
      ))}
    </>
  );
}

function ProductCard({ product, onRemove }: { product: CompareProduct; onRemove: (slug: string) => void }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticVotes, setOptimisticVotes] = useOptimistic(
    { upvotes: product.upvotes, downvotes: product.downvotes, userVote: product.userVote },
    (state, action: { type: 'upvote' | 'downvote' }) => {
      if (state.userVote === action.type) {
        return {
          upvotes: action.type === 'upvote' ? state.upvotes - 1 : state.upvotes,
          downvotes: action.type === 'downvote' ? state.downvotes - 1 : state.downvotes,
          userVote: null,
        };
      }
      if (state.userVote) {
        return {
          upvotes: action.type === 'upvote' ? state.upvotes + 1 : state.upvotes - 1,
          downvotes: action.type === 'downvote' ? state.downvotes + 1 : state.downvotes - 1,
          userVote: action.type,
        };
      }
      return {
        upvotes: action.type === 'upvote' ? state.upvotes + 1 : state.upvotes,
        downvotes: action.type === 'downvote' ? state.downvotes + 1 : state.downvotes,
        userVote: action.type,
      };
    }
  );

  const prices = product.vendorProducts.map((vp) => toNum(vp.effectivePrice)).filter((p) => p > 0);
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length > 1 ? Math.max(...prices) : lowest;

  async function handleVote(type: 'upvote' | 'downvote') {
    setOptimisticVotes({ type });
    const result = await voteOnProduct(product.id, type);
    if (result.error === 'auth_required') {
      window.location.href = '/auth/login';
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="cmp-card">
      <button className="cmp-card-remove" onClick={() => onRemove(product.slug)} title="Remove">
        <X size={12} />
      </button>

      <div className="cmp-card-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>{product.name.charAt(0)}</span>
        )}
      </div>

      <div className="cmp-card-separator" />

      <div className="cmp-card-info">
        <h3 className="cmp-card-name">{product.name}</h3>

        <div className="cmp-card-price">
          {lowest !== null && (
            <>
              <span className="cmp-card-price-low">{formatPrice(lowest)}</span>
              {highest !== null && highest !== lowest && (
                <>
                  <span className="cmp-card-price-sep">→</span>
                  <span className="cmp-card-price-high">{formatPrice(highest)}</span>
                </>
              )}
            </>
          )}
        </div>

        <div className="cmp-card-vendor">
          LOWEST ACROSS {product.vendorProducts.length} VENDOR{product.vendorProducts.length !== 1 ? 'S' : ''}
        </div>
      </div>

      <div className="cmp-card-separator" />

      <div className="cmp-card-actions">
        <div className="cmp-card-votes">
          <button
            className={`cmp-card-vote ${optimisticVotes.userVote === 'upvote' ? 'up active' : ''}`}
            onClick={() => handleVote('upvote')}
          >▲ {optimisticVotes.upvotes}</button>
          <button
            className={`cmp-card-vote ${optimisticVotes.userVote === 'downvote' ? 'down active' : ''}`}
            onClick={() => handleVote('downvote')}
          >▼ {optimisticVotes.downvotes}</button>
        </div>

        <div className="cmp-card-separator" />

        <Link href={`/products/${product.slug}`} className="cmp-card-view">
          View Product
        </Link>
      </div>
    </div>
  );
}
