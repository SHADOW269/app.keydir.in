import { prisma } from '@/lib/prisma';
import { CommunityActions } from './community-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Community — Admin' };

export default async function AdminCommunityPage() {
  const productsWithVotes = await prisma.product.findMany({
    where: {
      votes: { some: {} },
    },
    include: {
      brand: { select: { name: true } },
      votes: { select: { type: true } },
      _count: { select: { vendorProducts: true } },
    },
    orderBy: { votes: { _count: 'desc' } },
    take: 50,
  });

  const stats = productsWithVotes.map((p) => {
    const upvotes = p.votes.filter((v) => v.type === 'upvote').length;
    const downvotes = p.votes.filter((v) => v.type === 'downvote').length;
    const total = upvotes + downvotes;
    const approval = total >= 10 ? Math.round((upvotes / total) * 100) : null;

    let badge: string | null = null;
    if (total < 10) badge = 'NEW LISTING';
    else if (approval !== null) {
      if (approval > 90 && total >= 100) badge = 'HIGHLY RECOMMENDED';
      else if (approval > 80) badge = 'COMMUNITY FAVORITE';
      else if (approval < 60) badge = 'MIXED FEEDBACK';
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand?.name ?? 'Unknown',
      upvotes,
      downvotes,
      total,
      approval,
      badge,
      vendorCount: p._count.vendorProducts,
    };
  });

  const totalVotes = stats.reduce((sum, s) => sum + s.total, 0);
  const highlyRecommended = stats.filter((s) => s.badge === 'HIGHLY RECOMMENDED').length;
  const communityFavorites = stats.filter((s) => s.badge === 'COMMUNITY FAVORITE').length;
  const mixedFeedback = stats.filter((s) => s.badge === 'MIXED FEEDBACK').length;

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>COMMUNITY <em className="text-[var(--green)]">DASHBOARD</em></h2>
        <div className="sec-tag text-[var(--green)]">VOTE ANALYTICS</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Votes', value: totalVotes, color: 'var(--yellow)' },
          { label: 'Highly Recommended', value: highlyRecommended, color: 'var(--green)' },
          { label: 'Community Favorites', value: communityFavorites, color: 'var(--blue)' },
          { label: 'Mixed Feedback', value: mixedFeedback, color: 'var(--orange)' },
        ].map((stat) => (
          <div key={stat.label} className="neo-card p-6">
            <span
              className="block font-[family-name:var(--f-m)] text-4xl font-extrabold leading-none"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
            <span className="block font-[family-name:var(--f-m)] text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mt-2">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="sec-head">
        <h2>PRODUCT <em className="text-[var(--yellow)]">VOTE STATS</em></h2>
        <div className="sec-tag text-[var(--yellow)]">{stats.length} PRODUCTS</div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>▲ Up</th>
              <th>▼ Down</th>
              <th>Total</th>
              <th>Approval</th>
              <th>Badge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.id}>
                <td className="font-bold">{s.name}</td>
                <td className="text-[var(--text-dim)]">{s.brand}</td>
                <td className="text-[var(--green)] font-bold">{s.upvotes}</td>
                <td className="text-[var(--text-dim)] font-bold">{s.downvotes}</td>
                <td className="font-bold">{s.total}</td>
                <td>
                  {s.approval !== null ? (
                    <span className={`font-bold ${s.approval >= 80 ? 'text-[var(--green)]' : s.approval < 60 ? 'text-[var(--orange)]' : 'text-[var(--text)]'}`}>
                      {s.approval}%
                    </span>
                  ) : (
                    <span className="text-[var(--text-dim)]">—</span>
                  )}
                </td>
                <td>
                  {s.badge && (
                    <span className={`badge ${
                      s.badge === 'HIGHLY RECOMMENDED' ? 'b-green' :
                      s.badge === 'COMMUNITY FAVORITE' ? 'b-blue' :
                      s.badge === 'MIXED FEEDBACK' ? 'b-orange' : 'b-gray'
                    }`}>
                      {s.badge}
                    </span>
                  )}
                </td>
                <td>
                  <CommunityActions productId={s.id} productName={s.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
