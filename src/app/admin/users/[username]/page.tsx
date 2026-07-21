import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getRank, getNextRank, RANKS, getBadgePriority } from '@/lib/reputation';
import { AdminUserActions } from './admin-user-actions';
import { ensureSystemBadges } from '@/lib/reputation/actions';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return { title: `Edit User: ${username} — Admin` };
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      userXp: true,
      userBadges: { include: { badge: true } },
      contributions: {
        orderBy: { createdAt: 'desc' },
        include: { approvedBy: { select: { username: true } } },
      },
      bans: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { admin: { select: { username: true } } },
      },
      _count: { select: { votes: true, collection: true, wishlist: true } },
    },
  });

  if (!profile) notFound();

  const xp = profile.userXp?.xp || 0;
  const rank = getRank(xp);
  const nextRank = getNextRank(xp);

  const currentRankDef = RANKS.find(r => r.name === rank);
  const xpMin = currentRankDef?.min || 0;
  const xpMax = currentRankDef?.max === Infinity ? xp + 1 : (currentRankDef?.max || 50);
  const xpProgress = Math.min(100, ((xp - xpMin) / (xpMax - xpMin)) * 100);

  await ensureSystemBadges();
  const allBadges = await prisma.badge.findMany({ orderBy: { sortOrder: 'asc' } });
  const communityBadges = allBadges.filter(b => b.type === 'community');

  const currentCommunityBadge = profile.userBadges
    .filter(ub => ub.badge.type === 'community')
    .sort((a, b) => getBadgePriority(a.badge.slug) - getBadgePriority(b.badge.slug))[0];

  const sortedBadges = profile.userBadges
    .filter(ub => ub.badge.visible)
    .sort((a, b) => getBadgePriority(a.badge.slug) - getBadgePriority(b.badge.slug));

  const activityLog = await prisma.activityLog.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const lastActive = profile.updatedAt || profile.createdAt;

  return (
    <div className="page-body">
      <AdminUserActions
        profileId={profile.id}
        username={profile.username}
        displayName={profile.displayName}
        rank={rank}
        xp={xp}
        xpMax={xpMax}
        xpProgress={xpProgress}
        nextRank={nextRank ? { name: nextRank.name } : null}
        currentCommunityBadgeId={currentCommunityBadge?.badgeId || null}
        currentCommunityBadge={currentCommunityBadge ? {
          name: currentCommunityBadge.badge.name,
          icon: currentCommunityBadge.badge.icon,
          bgColor: currentCommunityBadge.badge.bgColor,
          textColor: currentCommunityBadge.badge.textColor,
          borderColor: currentCommunityBadge.badge.borderColor,
        } : null}
        communityBadges={communityBadges.map(b => ({ id: b.id, name: b.name, icon: b.icon, bgColor: b.bgColor, textColor: b.textColor, borderColor: b.borderColor }))}
        sortedBadges={sortedBadges.map(ub => ({
          name: ub.badge.name,
          icon: ub.badge.icon,
          bgColor: ub.badge.bgColor,
          textColor: ub.badge.textColor,
          borderColor: ub.badge.borderColor,
        }))}
        votes={profile._count.votes}
        collection={profile._count.collection}
        wishlist={profile._count.wishlist}
        contributions={profile.contributions.map(c => ({
          id: c.id,
          type: c.type,
          title: c.title,
          description: c.description,
          xpAwarded: c.xpAwarded,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
          approvedBy: c.approvedBy?.username || null,
        }))}
        bans={profile.bans.map(b => ({
          id: b.id,
          type: b.type,
          reason: b.reason,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          expiresAt: b.expiresAt?.toISOString() || null,
          admin: b.admin.username,
        }))}
        activityLog={activityLog.map(log => ({
          id: log.id,
          action: log.action,
          details: log.details,
          createdAt: log.createdAt.toISOString(),
        }))}
        lastActiveDate={lastActive.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        joinedDate={profile.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      />
    </div>
  );
}
