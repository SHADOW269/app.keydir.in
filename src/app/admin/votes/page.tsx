import { prisma } from '@/lib/prisma';
import { DashboardGrid, KpiCard, ChartCard, SectionHeader } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votes — Admin' };

export default async function AdminVotesPage() {
  const [votes, upvotes, downvotes] = await Promise.all([
    prisma.vote.findMany({
      include: {
        profile: { select: { username: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.vote.count({ where: { type: 'upvote' } }),
    prisma.vote.count({ where: { type: 'downvote' } }),
  ]);

  const totalVotes = upvotes + downvotes;
  const upvoteRatio = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">VOTE <em className="text-[var(--orange)]">ANALYTICS</em></div>
          <div className="dash-page-desc">{totalVotes} total votes cast</div>
        </div>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Votes" value={totalVotes} icon="▲" color="var(--orange)" span={3} />
        <KpiCard label="Upvotes" value={upvotes} icon="▲" color="var(--green)" span={3} />
        <KpiCard label="Downvotes" value={downvotes} icon="▼" color="var(--red)" span={3} />
        <KpiCard label="Upvote Ratio" value={`${upvoteRatio}%`} icon="◆" color="var(--yellow)" span={3} />

        <SectionHeader title="Trends" span={12} />

        <ChartCard title="Vote Activity" subtitle="Recent votes" span={12} height={320}>
          <div className="dash-panel-body" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">User</th>
                    <th className="dash-th">Product</th>
                    <th className="dash-th">Vote</th>
                    <th className="dash-th">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((v) => (
                    <tr key={v.id}>
                      <td className="dash-td font-bold">{v.profile.username}</td>
                      <td className="dash-td">{v.product.name}</td>
                      <td className="dash-td">
                        <span className={`badge ${v.type === 'upvote' ? 'b-green' : 'b-red'}`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="dash-td text-[var(--text-dim)]">
                        {v.createdAt.toLocaleDateString('en-IN')}
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
