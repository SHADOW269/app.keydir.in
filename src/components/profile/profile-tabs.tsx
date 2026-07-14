'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { removeFromCollection } from '@/lib/profile/actions';
import { formatPrice } from '@/lib/utils';

interface CollectionItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    brand: { name: string } | null;
    category: { name: string; slug: string };
    vendorProducts: { totalPrice: number | { toNumber(): number } }[];
  };
  createdAt: Date;
}

interface VoteItem {
  id: string;
  type: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    brand: { name: string } | null;
    category: { name: string; slug: string };
    vendorProducts: { totalPrice: number | { toNumber(): number } }[];
  };
  createdAt: Date;
}

interface ProfileTabsProps {
  activeTab: string;
  profileUsername: string;
  isOwner: boolean;
  collection: CollectionItem[];
  votes: VoteItem[];
  voteCredits: number;
  memberSince: number;
  rank: string;
  reputation: number;
  profile: {
    displayName: string | null;
    bio: string | null;
    github: string | null;
    discord: string | null;
    reddit: string | null;
    monkeytype: string | null;
    website: string | null;
  };
}

function priceNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber(): number }).toNumber();
  return 0;
}

const TABS = [
  { id: 'collection', label: 'COLLECTION' },
  { id: 'contributions', label: 'CONTRIBUTIONS' },
  { id: 'profile', label: 'PROFILE' },
  { id: 'activity', label: 'ACTIVITY' },
] as const;

export function ProfileTabs({
  activeTab,
  profileUsername,
  isOwner,
  collection,
  votes,
  voteCredits,
  memberSince,
  rank,
  reputation,
  profile,
}: ProfileTabsProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  const current = TABS.find((t) => t.id === activeTab)?.id || 'collection';

  function switchTab(id: string) {
    router.push(`/profile/${profileUsername}?tab=${id}`);
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    await removeFromCollection(id);
    router.refresh();
  }

  return (
    <div className="profile-tabs">
      <div className="profile-tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`profile-tab ${current === t.id ? 'active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="profile-tab-content">
        {/* ═══ PROFILE TAB ═══ */}
        {current === 'profile' && (
          <div className="profile-info-grid">
            <div className="profile-info-card">
              <div className="profile-info-card-header">ABOUT</div>
              <div className="profile-info-card-body">
                <div className="profile-info-row">
                  <span className="profile-info-label">Username</span>
                  <span className="profile-info-value">{profileUsername}</span>
                </div>
                {profile.displayName && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Display Name</span>
                    <span className="profile-info-value">{profile.displayName}</span>
                  </div>
                )}
                <div className="profile-info-row">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">{memberSince}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Role</span>
                  <span className="profile-info-value">Community Member</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Rank</span>
                  <span className="profile-info-value">{rank}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Reputation</span>
                  <span className="profile-info-value">{reputation} XP</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Vote Credits</span>
                  <span className="profile-info-value">{voteCredits}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Collection</span>
                  <span className="profile-info-value">{collection.length} items</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ COLLECTION TAB ═══ */}
        {current === 'collection' && (
          <>
            {collection.length === 0 ? (
              <div className="profile-empty">
                <p className="profile-empty-text">No products in your collection yet.</p>
                <p className="profile-empty-sub">
                  Browse our catalog and add keyboards, switches, keycaps, and mice to your collection.
                </p>
                <div className="profile-empty-links">
                  <Link href="/keyboards">Keyboards</Link>
                  <Link href="/switches">Switches</Link>
                  <Link href="/keycaps">Keycaps</Link>
                  <Link href="/mouse">Mouse</Link>
                </div>
              </div>
            ) : (
              <div className="profile-grid">
                {collection.map((item) => {
                  const price = item.product.vendorProducts[0]?.totalPrice;
                  return (
                    <div key={item.id} className="profile-product-card">
                      <Link href={`/products/${item.product.slug}`} className="profile-product-link">
                        {item.product.image ? (
                          <div
                            className="profile-product-img"
                            style={{ backgroundImage: `url(${item.product.image})` }}
                          />
                        ) : (
                          <div className="profile-product-img profile-product-placeholder">
                            {item.product.name.charAt(0)}
                          </div>
                        )}
                        <div className="profile-product-info">
                          <div className="profile-product-brand">
                            {item.product.brand?.name ?? 'Unknown'}
                          </div>
                          <div className="profile-product-name">{item.product.name}</div>
                          {price != null && (
                            <div className="profile-product-price">{formatPrice(priceNum(price))}</div>
                          )}
                        </div>
                      </Link>
                      {isOwner && (
                        <button
                          className="profile-product-remove"
                          onClick={() => handleRemove(item.id)}
                          disabled={removing === item.id}
                        >
                          {removing === item.id ? '...' : '\u00d7'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ CONTRIBUTIONS TAB ═══ */}
        {current === 'contributions' && (
          <div className="profile-empty">
            <p className="profile-empty-text">No contributions yet.</p>
            <p className="profile-empty-sub">
              Help improve KeyDir by:
            </p>
            <div className="profile-empty-links">
              <Link href="/keyboards">Adding Products</Link>
              <Link href="/keyboards">Updating Prices</Link>
              <Link href="/keyboards">Editing Specs</Link>
              <Link href="/keyboards">Reporting Vendors</Link>
            </div>
          </div>
        )}

        {/* ═══ ACTIVITY TAB ═══ */}
        {current === 'activity' && (
          <>
            {votes.length === 0 ? (
              <div className="profile-empty">
                <p className="profile-empty-text">No activity yet.</p>
                <p className="profile-empty-sub">
                  Upvote or downvote products to see your voting history here.
                </p>
              </div>
            ) : (
              <div className="profile-activity">
                {votes.map((vote) => (
                  <div key={vote.id} className="profile-activity-item">
                    <span className={`profile-activity-icon ${vote.type === 'upvote' ? 'up' : 'down'}`}>
                      {vote.type === 'upvote' ? '\u25b2' : '\u25bc'}
                    </span>
                    <div className="profile-activity-info">
                      <Link href={`/products/${vote.product.slug}`} className="profile-activity-link">
                        {vote.product.brand?.name ? `${vote.product.brand.name} ` : ''}
                        {vote.product.name}
                      </Link>
                      <span className="profile-activity-action">
                        {vote.type === 'upvote' ? 'Upvoted' : 'Downvoted'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
