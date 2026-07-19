import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

export async function BestDeals() {
  const deals = await prisma.vendorProduct.findMany({
    orderBy: { totalPrice: 'asc' },
    take: 10,
    where: { stockStatus: { in: ['in_stock', 'preorder'] } },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          brand: { select: { name: true } },
        },
      },
      vendor: { select: { name: true } },
    },
  });

  if (deals.length === 0) return null;

  return (
    <section style={{ padding: '0 0 80px' }}>
      <div className="sec-head">
        <h2>BEST <em style={{ color: 'var(--yellow)' }}>DEALS</em></h2>
        <div className="sec-tag" style={{ color: 'var(--yellow)' }}>LOWEST PRICES</div>
      </div>
      <p style={{ fontFamily: 'var(--f-m)', fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '480px' }}>
        Lowest prices from verified Indian vendors.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {deals.map((deal) => {
          const price = Number(deal.totalPrice);
          const hasDiscount = deal.shippingIncluded || Number(deal.shippingCost) === 0;
          return (
            <Link
              key={deal.id}
              href={`/products/${deal.product.slug}`}
              className="neo-card overflow-hidden group"
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: '140px', background: 'var(--surface)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {deal.product.image ? (
                  <Image src={deal.product.image} alt={deal.product.name} fill style={{ objectFit: 'contain', padding: '16px' }} />
                ) : (
                  <span style={{ fontSize: '2rem', opacity: 0.15 }}>⌨</span>
                )}
                {hasDiscount && (
                  <span className="badge b-green" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '.65rem' }}>
                    FREE SHIP
                  </span>
                )}
              </div>
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {deal.vendor.name}
                </div>
                <div style={{ fontFamily: 'var(--f-d)', fontSize: '.9rem', fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                  {deal.product.name}
                </div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: '1rem', fontWeight: 800, color: 'var(--green)' }}>
                  ₹{price.toLocaleString('en-IN')}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/keyboards" className="btn-primary">VIEW ALL DEALS →</Link>
      </div>
    </section>
  );
}
