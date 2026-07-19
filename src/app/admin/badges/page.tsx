import { prisma } from '@/lib/prisma';
import { AdminBadgeActions } from './admin-badge-actions';
import { DashboardGrid, KpiCard, SectionHeader } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Badges — Admin' };

export default async function AdminBadgesPage() {
  const [badges, totalAwarded] = await Promise.all([
    prisma.badge.findMany({
      include: { _count: { select: { userBadges: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.userBadge.count(),
  ]);

  const visibleBadges = badges.filter((b) => b.visible).length;
  const hiddenBadges = badges.length - visibleBadges;

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">BADGE <em className="text-[var(--yellow)]">MANAGEMENT</em></div>
          <div className="dash-page-desc">{badges.length} badges defined, {totalAwarded} total awards</div>
        </div>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Badges" value={badges.length} icon="◆" color="var(--yellow)" span={3} />
        <KpiCard label="Visible" value={visibleBadges} icon="●" color="var(--green)" span={3} />
        <KpiCard label="Hidden" value={hiddenBadges} icon="○" color="var(--text-muted)" span={3} />
        <KpiCard label="Total Awards" value={totalAwarded} icon="◆" color="var(--purple)" span={3} />

        <div style={{ gridColumn: 'span 12' }}>
          <AdminBadgeActions
            existingBadges={badges.map((b) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              description: b.description,
              bgColor: b.bgColor,
              textColor: b.textColor,
              borderColor: b.borderColor,
              icon: b.icon,
              visible: b.visible,
              sortOrder: b.sortOrder,
              userCount: b._count.userBadges,
            }))}
          />
        </div>
      </DashboardGrid>
    </div>
  );
}
