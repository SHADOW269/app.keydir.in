'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { XP_VALUES, getRank, RANKS, RANK_SLUGS, RANK_BADGE_DEFAULTS, getBadgePriority } from '@/lib/reputation';
import type { ContributionType } from '@prisma/client';

// ═══ HELPERS ═══

async function getAdminProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) return null;
  return prisma.profile.findUnique({ where: { userId: user.id } });
}

async function ensureUserXP(profileId: string) {
  const existing = await prisma.userXP.findUnique({ where: { profileId } });
  if (existing) return existing;
  return prisma.userXP.create({ data: { profileId, xp: 0 } });
}

// ═══ SYSTEM BADGES ═══

const SYSTEM_BADGES = [
  { slug: 'community-member', name: 'Community Member', type: 'system', sortOrder: 0, icon: '', bgColor: '#FAFF00', textColor: '#111111', borderColor: '#111111' },
  ...RANKS.map((r, i) => ({
    slug: RANK_SLUGS[r.name],
    name: r.name,
    type: 'rank',
    sortOrder: 10 + i,
    ...RANK_BADGE_DEFAULTS[r.name],
  })),
];

let _badgesSeeded = false;

export async function ensureSystemBadges() {
  if (_badgesSeeded) return;
  for (const b of SYSTEM_BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        slug: b.slug,
        name: b.name,
        type: b.type,
        sortOrder: b.sortOrder,
        icon: b.icon || null,
        bgColor: b.bgColor,
        textColor: b.textColor,
        borderColor: b.borderColor,
      },
    });
  }
  _badgesSeeded = true;
}

export async function syncRankBadge(profileId: string) {
  const xp = await getProfileXP(profileId);
  const newRank = getRank(xp);
  const newRankSlug = RANK_SLUGS[newRank];

  const newBadge = await prisma.badge.findUnique({ where: { slug: newRankSlug } });
  if (!newBadge) return;

  const currentBadges = await prisma.userBadge.findMany({
    where: { profileId, badge: { type: 'rank' } },
    include: { badge: true },
  });

  for (const ub of currentBadges) {
    if (ub.badge.slug !== newRankSlug) {
      await prisma.userBadge.delete({ where: { id: ub.id } });
    }
  }

  const hasRank = currentBadges.some(ub => ub.badge.slug === newRankSlug);
  if (!hasRank) {
    await prisma.userBadge.create({ data: { profileId, badgeId: newBadge.id } });
  }
}

export async function syncCommunityMember(profileId: string) {
  const badge = await prisma.badge.findUnique({ where: { slug: 'community-member' } });
  if (!badge) return;
  const existing = await prisma.userBadge.findUnique({
    where: { profileId_badgeId: { profileId, badgeId: badge.id } },
  });
  if (!existing) {
    await prisma.userBadge.create({ data: { profileId, badgeId: badge.id } });
  }
}

// ═══ XP & RANK ═══

export async function getProfileXP(profileId: string) {
  const xp = await prisma.userXP.findUnique({ where: { profileId } });
  return xp?.xp || 0;
}

export async function getProfileRank(profileId: string) {
  const xp = await getProfileXP(profileId);
  return getRank(xp);
}

export async function getUserBadges(profileId: string) {
  await ensureSystemBadges();
  await syncRankBadge(profileId);
  await syncCommunityMember(profileId);

  const userBadges = await prisma.userBadge.findMany({
    where: { profileId },
    include: { badge: true },
  });

  return userBadges
    .filter(ub => ub.badge.visible)
    .sort((a, b) => getBadgePriority(a.badge.slug) - getBadgePriority(b.badge.slug));
}

export async function getProfileStats(username: string) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: {
      id: true,
      _count: { select: { wishlist: true, collection: true, votes: true } },
    },
  });
  if (!profile) return null;

  const [xp, contributions, badges] = await Promise.all([
    getProfileXP(profile.id),
    prisma.contribution.count({ where: { profileId: profile.id, status: 'APPROVED' } }),
    getUserBadges(profile.id),
  ]);

  return {
    xp,
    rank: getRank(xp),
    wishlistCount: profile._count.wishlist,
    collectionCount: profile._count.collection,
    voteCount: profile._count.votes,
    contributionCount: contributions,
    badges,
  };
}

export async function updateXP(profileId: string, amount: number, reason: string) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  const xp = await ensureUserXP(profileId);
  const newTotal = Math.max(0, xp.xp + amount);

  await prisma.userXP.update({ where: { profileId }, data: { xp: newTotal } });
  await prisma.activityLog.create({
    data: { profileId, action: 'admin_xp_adjust', details: `${amount > 0 ? '+' : ''}${amount} XP - ${reason}` },
  });

  await syncRankBadge(profileId);

  return { ok: true, newTotal, rank: getRank(newTotal) };
}

export async function setXP(profileId: string, amount: number) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  const xp = await ensureUserXP(profileId);
  const newTotal = Math.max(0, amount);

  await prisma.userXP.update({ where: { profileId }, data: { xp: newTotal } });
  await prisma.activityLog.create({
    data: { profileId, action: 'admin_xp_set', details: `Set XP to ${newTotal}` },
  });

  await syncRankBadge(profileId);

  return { ok: true, newTotal, rank: getRank(newTotal) };
}

// ═══ CONTRIBUTIONS ═══

export async function createContribution(data: {
  type: ContributionType;
  title: string;
  description?: string;
  xpOverride?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'auth_required' };

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return { error: 'auth_required' };

  const contribution = await prisma.contribution.create({
    data: {
      profileId: profile.id,
      type: data.type,
      title: data.title,
      description: data.description || null,
      xpAwarded: data.xpOverride ?? XP_VALUES[data.type],
      status: 'PENDING',
    },
  });

  return { ok: true, contributionId: contribution.id };
}

export async function approveContribution(contributionId: string, xpOverride?: number) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  const contribution = await prisma.contribution.findUnique({ where: { id: contributionId } });
  if (!contribution) return { error: 'not_found' };

  const xpToAward = xpOverride ?? contribution.xpAwarded;

  await prisma.contribution.update({
    where: { id: contributionId },
    data: {
      status: 'APPROVED',
      approvedById: admin.id,
      approvedAt: new Date(),
      xpAwarded: xpToAward,
    },
  });

  const xp = await ensureUserXP(contribution.profileId);
  const newTotal = xp.xp + xpToAward;

  await prisma.userXP.update({ where: { profileId: contribution.profileId }, data: { xp: newTotal } });
  await prisma.activityLog.create({
    data: {
      profileId: contribution.profileId,
      action: 'contribution_approved',
      details: `Approved "${contribution.title}" +${xpToAward} XP`,
    },
  });

  await syncRankBadge(contribution.profileId);

  revalidatePath('/admin/community');
  revalidatePath('/admin/users');
  return { ok: true, newTotal, rank: getRank(newTotal) };
}

export async function rejectContribution(contributionId: string) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  await prisma.contribution.update({
    where: { id: contributionId },
    data: { status: 'REJECTED', approvedById: admin.id, approvedAt: new Date() },
  });

  revalidatePath('/admin/community');
  return { ok: true };
}

export async function getPendingContributions() {
  return prisma.contribution.findMany({
    where: { status: 'PENDING' },
    include: { profile: { select: { username: true, displayName: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

// ═══ BADGES ═══

export async function getBadges() {
  return prisma.badge.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createBadge(data: {
  name: string;
  slug: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: string;
  visible?: boolean;
  sortOrder?: number;
}) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  const existing = await prisma.badge.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: 'slug_exists' };

  const badge = await prisma.badge.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      bgColor: data.bgColor || '#FAFF00',
      textColor: data.textColor || '#111111',
      borderColor: data.borderColor || '#111111',
      icon: data.icon || null,
      visible: data.visible ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  revalidatePath('/admin/badges');
  return { ok: true, badgeId: badge.id };
}

export async function updateBadge(badgeId: string, data: {
  name?: string;
  description?: string | null;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: string | null;
  visible?: boolean;
  sortOrder?: number;
}) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  await prisma.badge.update({ where: { id: badgeId }, data });
  revalidatePath('/admin/badges');
  return { ok: true };
}

export async function deleteBadge(badgeId: string) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  await prisma.userBadge.deleteMany({ where: { badgeId } });
  await prisma.badge.delete({ where: { id: badgeId } });
  revalidatePath('/admin/badges');
  return { ok: true };
}

export async function assignBadge(profileId: string, badgeId: string) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  const existing = await prisma.userBadge.findUnique({
    where: { profileId_badgeId: { profileId, badgeId } },
  });
  if (existing) return { error: 'already_assigned' };

  await prisma.userBadge.create({
    data: { profileId, badgeId, assignedById: admin.id },
  });

  await prisma.activityLog.create({
    data: { profileId, action: 'badge_assigned', details: `Badge assigned by ${admin.username}` },
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/badges');
  return { ok: true };
}

export async function removeBadgeFromUser(profileId: string, badgeId: string) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
  if (!badge) return { error: 'not_found' };
  if (badge.type === 'rank' || badge.type === 'system') return { error: 'cannot_remove_system_badge' };

  await prisma.userBadge.deleteMany({ where: { profileId, badgeId } });
  await prisma.activityLog.create({
    data: { profileId, action: 'badge_removed', details: `Badge removed by ${admin.username}` },
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/badges');
  return { ok: true };
}

// ═══ BANS ═══

export async function suspendUser(profileId: string, reason: string, durationDays?: number) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  await prisma.banHistory.create({
    data: {
      profileId,
      adminId: admin.id,
      reason,
      type: 'suspend',
      status: 'ACTIVE',
      expiresAt: durationDays ? new Date(Date.now() + durationDays * 86400000) : null,
    },
  });

  await prisma.activityLog.create({
    data: { profileId, action: 'suspended', details: `Suspended by ${admin.username}: ${reason}` },
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function banUser(profileId: string, reason: string) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  await prisma.banHistory.create({
    data: { profileId, adminId: admin.id, reason, type: 'ban', status: 'ACTIVE' },
  });

  await prisma.activityLog.create({
    data: { profileId, action: 'banned', details: `Banned by ${admin.username}: ${reason}` },
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function liftBan(banId: string) {
  const admin = await getAdminProfile();
  if (!admin) return { error: 'not_authorized' };

  await prisma.banHistory.update({
    where: { id: banId },
    data: { status: 'LIFTED', liftedAt: new Date() },
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function getActiveBan(profileId: string) {
  return prisma.banHistory.findFirst({
    where: { profileId, status: 'ACTIVE' },
    include: { admin: { select: { username: true } } },
  });
}

export async function getAllUsers() {
  return prisma.profile.findMany({
    include: {
      userXp: true,
      _count: { select: { contributions: true, userBadges: true, votes: true, collection: true, wishlist: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserActivityLog(profileId: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
