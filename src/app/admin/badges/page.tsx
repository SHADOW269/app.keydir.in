import { prisma } from '@/lib/prisma';
import { AdminBadgeActions } from './admin-badge-actions';

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
  const rankCount = badges.filter((b) => b.type === 'rank').length;
  const communityCount = badges.filter((b) => b.type === 'community').length;

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">BADGE <em className="text-[var(--yellow)]">MANAGEMENT</em></div>
          <div className="dash-page-desc">{badges.length} badges defined, {totalAwarded} total awards</div>
        </div>
      </div>

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
          type: b.type,
          xpRequired: b.xpRequired,
          createdAt: b.createdAt?.toISOString(),
        }))}
        stats={{
          total: badges.length,
          visible: visibleBadges,
          hidden: hiddenBadges,
          totalAwards: totalAwarded,
          rankCount,
          communityCount,
        }}
      />
    </div>
  );
}
