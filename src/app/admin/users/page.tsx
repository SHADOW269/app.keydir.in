import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getRank } from '@/lib/reputation';
import { DashboardGrid, KpiCard, ChartCard, SectionHeader } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users — Admin' };

export default async function AdminUsersPage() {
  const [users, totalVotes, totalBadges, totalContributions] = await Promise.all([
    prisma.profile.findMany({
      include: {
        userXp: true,
        _count: { select: { contributions: true, userBadges: true, votes: true, collection: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vote.count(),
    prisma.userBadge.count(),
    prisma.contribution.count(),
  ]);

  const rankCounts: Record<string, number> = {};
  for (const u of users) {
    const xp = u.userXp?.xp || 0;
    const rank = getRank(xp);
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  }

  const rankChartData = Object.entries(rankCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const topUsers = [...users]
    .sort((a, b) => (b.userXp?.xp || 0) - (a.userXp?.xp || 0))
    .slice(0, 8);

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">USER <em className="text-[var(--purple)]">MANAGEMENT</em></div>
          <div className="dash-page-desc">{users.length} registered users</div>
        </div>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Users" value={users.length} icon="◆" color="var(--purple)" span={3} />
        <KpiCard label="Total Votes" value={totalVotes} icon="▲" color="var(--green)" span={3} />
        <KpiCard label="Badges Awarded" value={totalBadges} icon="◆" color="var(--yellow)" span={3} />
        <KpiCard label="Contributions" value={totalContributions} icon="◆" color="var(--cyan)" span={3} />

        <SectionHeader title="Rank Distribution" span={12} />

        <ChartCard title="Users by Rank" subtitle="Experience level breakdown" span={6} height={280}>
          {rankChartData.length > 0 ? (
            <div className="flex flex-col gap-3 p-4">
              {rankChartData.map((r) => {
                const maxCount = Math.max(...rankChartData.map((d) => d.count));
                const width = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
                return (
                  <div key={r.name} className="flex items-center gap-4">
                    <span className="font-[family-name:var(--f-m)] text-xs text-[var(--text-muted)] w-28 text-right truncate">{r.name}</span>
                    <div className="flex-1 h-5 bg-[var(--surface)] relative">
                      <div className="h-full bg-[var(--purple)] transition-all" style={{ width: `${width}%` }} />
                    </div>
                    <span className="font-[family-name:var(--f-m)] text-xs font-bold text-[var(--text)] w-10 text-right">{r.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty-sm">No users yet</div>
          )}
        </ChartCard>

        <div className="dash-panel" style={{ gridColumn: 'span 6' }}>
          <div className="dash-panel-header">Top Contributors</div>
          <div className="dash-panel-body">
            {topUsers.length === 0 ? (
              <div className="dash-empty-sm">No users yet</div>
            ) : (
              <div className="dash-activity-list">
                {topUsers.map((u) => {
                  const xp = u.userXp?.xp || 0;
                  const rank = getRank(xp);
                  return (
                    <div key={u.id} className="dash-activity-item">
                      <span className="dash-activity-icon" style={{ color: 'var(--purple)' }}>◆</span>
                      <div className="dash-activity-content">
                        <span className="dash-activity-text">
                          <Link href={`/profile/${u.username}`} className="text-[var(--accent)] hover:underline">{u.displayName || u.username}</Link>
                          {' '}<span className="text-[var(--text-muted)]">· {rank}</span>
                        </span>
                        <span className="dash-activity-time">{xp} XP · {u._count.votes} votes · {u._count.contributions} contributions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <SectionHeader title="All Users" span={12} />

        <div className="dash-panel" style={{ gridColumn: 'span 12' }}>
          <div className="dash-panel-header">User Directory</div>
          <div className="dash-panel-body" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">Username</th>
                    <th className="dash-th">Display Name</th>
                    <th className="dash-th">Rank</th>
                    <th className="dash-th">XP</th>
                    <th className="dash-th">Badges</th>
                    <th className="dash-th">Votes</th>
                    <th className="dash-th">Collection</th>
                    <th className="dash-th">Contributions</th>
                    <th className="dash-th">Joined</th>
                    <th className="dash-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const xp = u.userXp?.xp || 0;
                    const rank = getRank(xp);
                    return (
                      <tr key={u.id}>
                        <td className="dash-td font-bold">
                          <Link href={`/profile/${u.username}`} className="text-[var(--accent)] hover:underline">{u.username}</Link>
                        </td>
                        <td className="dash-td text-[var(--text-muted)]">{u.displayName ?? '—'}</td>
                        <td className="dash-td">{rank}</td>
                        <td className="dash-td">{xp}</td>
                        <td className="dash-td">{u._count.userBadges}</td>
                        <td className="dash-td">{u._count.votes}</td>
                        <td className="dash-td">{u._count.collection}</td>
                        <td className="dash-td">{u._count.contributions}</td>
                        <td className="dash-td text-[var(--text-dim)]">{u.createdAt.toLocaleDateString('en-IN')}</td>
                        <td className="dash-td">
                          <Link href={`/admin/users/${u.username}`} className="text-[var(--yellow)] hover:text-[var(--green)] font-[family-name:var(--f-m)] text-xs font-bold">
                            EDIT
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
