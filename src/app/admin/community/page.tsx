import { prisma } from '@/lib/prisma';
import { CommunityActions } from './community-actions';
import { DashboardGrid, KpiCard, ChartCard, SectionHeader } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Community — Admin' };

export default async function AdminCommunityPage() {
  const productsWithVotes = await prisma.product.findMany({
    where: { votes: { some: {} } },
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
      id: p.id, name: p.name, slug: p.slug, brand: p.brand?.name ?? 'Unknown',
      upvotes, downvotes, total, approval, badge, vendorCount: p._count.vendorProducts,
    };
  });

  const totalVotes = stats.reduce((sum, s) => sum + s.total, 0);
  const highlyRecommended = stats.filter((s) => s.badge === 'HIGHLY RECOMMENDED').length;
  const communityFavorites = stats.filter((s) => s.badge === 'COMMUNITY FAVORITE').length;
  const mixedFeedback = stats.filter((s) => s.badge === 'MIXED FEEDBACK').length;

  const badgeChartData = [
    { name: 'Highly Recommended', count: highlyRecommended },
    { name: 'Community Favorite', count: communityFavorites },
    { name: 'Mixed Feedback', count: mixedFeedback },
  ].filter((d) => d.count > 0);

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">COMMUNITY <em className="text-[var(--green)]">DASHBOARD</em></div>
          <div className="dash-page-desc">Vote analytics and community sentiment</div>
        </div>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Votes" value={totalVotes} icon="▲" color="var(--yellow)" span={3} />
        <KpiCard label="Highly Recommended" value={highlyRecommended} icon="◆" color="var(--green)" span={3} />
        <KpiCard label="Community Favorites" value={communityFavorites} icon="◆" color="var(--blue)" span={3} />
        <KpiCard label="Mixed Feedback" value={mixedFeedback} icon="◆" color="var(--orange)" span={3} />

        <SectionHeader title="Product Vote Stats" span={12} />

        <ChartCard title="Community Ratings" subtitle={`${stats.length} products voted on`} span={12} height={400}>
          <div className="dash-panel-body" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">Product</th>
                    <th className="dash-th">Brand</th>
                    <th className="dash-th">▲ Up</th>
                    <th className="dash-th">▼ Down</th>
                    <th className="dash-th">Total</th>
                    <th className="dash-th">Approval</th>
                    <th className="dash-th">Badge</th>
                    <th className="dash-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.id}>
                      <td className="dash-td font-bold">{s.name}</td>
                      <td className="dash-td text-[var(--text-dim)]">{s.brand}</td>
                      <td className="dash-td text-[var(--green)] font-bold">{s.upvotes}</td>
                      <td className="dash-td text-[var(--text-dim)] font-bold">{s.downvotes}</td>
                      <td className="dash-td font-bold">{s.total}</td>
                      <td className="dash-td">
                        {s.approval !== null ? (
                          <span className={`font-bold ${s.approval >= 80 ? 'text-[var(--green)]' : s.approval < 60 ? 'text-[var(--orange)]' : 'text-[var(--text)]'}`}>
                            {s.approval}%
                          </span>
                        ) : (
                          <span className="text-[var(--text-dim)]">—</span>
                        )}
                      </td>
                      <td className="dash-td">
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
                      <td className="dash-td">
                        <CommunityActions productId={s.id} productName={s.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ChartCard>
      </DashboardGrid>
    </div>
  );
}
