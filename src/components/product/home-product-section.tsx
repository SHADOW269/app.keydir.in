import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { computeVoteStats, getCommunityBadge } from '@/lib/vote-utils';

export async function HomeProductSection() {
  const allProducts = await prisma.product.findMany({
    include: {
      brand: { select: { name: true } },
      votes: { select: { type: true } },
    },
  });

  const ranked = allProducts.map((p) => {
    const stats = computeVoteStats(p.votes);
    return { ...p, ...stats };
  }).filter((p) => p.total >= 5);

  const trending = [...ranked]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 6);

  const favorites = [...ranked]
    .filter((p) => p.approval !== null && p.approval >= 80)
    .sort((a, b) => (b.approval ?? 0) - (a.approval ?? 0))
    .slice(0, 6);

  if (trending.length === 0 && favorites.length === 0) return null;

  return (
    <div className="page-body">
      {trending.length > 0 && (
        <section style={{ padding: '80px 0 60px' }}>
          <div className="sec-head">
            <h2>TRENDING <em style={{ color: 'var(--yellow)' }}>NOW</em></h2>
            <div className="sec-tag" style={{ color: 'var(--yellow)' }}>TOP UPVOTED</div>
          </div>
          <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {trending.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="product-card neo-card overflow-hidden relative group"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product-image-wrap" style={{ height: '200px', background: 'var(--surface)' }}>
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill className="product-image object-contain p-6" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl opacity-20">⌨</div>
                  )}
                </div>
                <div className="product-body" style={{ padding: '20px' }}>
                  <div className="product-brand">{p.brand?.name ?? 'Unknown'}</div>
                  <h3 className="product-name" style={{ fontSize: '1rem' }}>{p.name}</h3>
                  <div className="product-vote-display" style={{ marginTop: '12px' }}>
                    <span className="font-bold text-lg" style={{ color: 'var(--green)' }}>▲ {p.upvotes}</span>
                    {p.downvotes > 0 && (
                      <span className="font-bold ml-3 opacity-60">▼ {p.downvotes}</span>
                    )}
                  </div>
                  {(() => {
                    const badge = getCommunityBadge(p.upvotes, p.approval);
                    if (!badge) return null;
                    return (
                      <span className={`badge ${badge.cls}`} style={{ marginTop: '10px', display: 'inline-block' }}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section style={{ padding: '0 0 80px' }}>
          <div className="sec-head">
            <h2>COMMUNITY <em style={{ color: 'var(--green)' }}>FAVORITES</em></h2>
            <div className="sec-tag" style={{ color: 'var(--green)' }}>TOP RATED</div>
          </div>
          <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {favorites.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="product-card neo-card overflow-hidden relative group"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product-image-wrap" style={{ height: '200px', background: 'var(--surface)' }}>
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill className="product-image object-contain p-6" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl opacity-20">⌨</div>
                  )}
                </div>
                <div className="product-body" style={{ padding: '20px' }}>
                  <div className="product-brand">{p.brand?.name ?? 'Unknown'}</div>
                  <h3 className="product-name" style={{ fontSize: '1rem' }}>{p.name}</h3>
                  <div className="product-vote-display" style={{ marginTop: '12px' }}>
                    <span className="font-bold text-lg" style={{ color: 'var(--green)' }}>▲ {p.upvotes}</span>
                    <span className="font-bold ml-4" style={{ color: 'var(--green)' }}>{p.approval}%</span>
                  </div>
                  <span className="badge b-blue" style={{ marginTop: '10px', display: 'inline-block' }}>
                    COMMUNITY FAVORITE
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
