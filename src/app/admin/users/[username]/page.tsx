import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getRank, getNextRank, RANKS, CONTRIBUTION_TYPE_LABELS, getBadgePriority } from '@/lib/reputation';
import { AdminUserActions } from './admin-user-actions';
import { Identicon } from '@/components/profile/identicon';
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
        take: 20,
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
  const assignedBadgeIds = new Set(profile.userBadges.map((ub) => ub.badgeId));

  const sortedBadges = profile.userBadges
    .filter(ub => ub.badge.visible)
    .sort((a, b) => getBadgePriority(a.badge.slug) - getBadgePriority(b.badge.slug));

  return (
    <div className="page-body">
      <div className="sec-head">
        <Link href="/admin/users" className="text-[var(--text-muted)] text-sm hover:underline">← ALL USERS</Link>
      </div>

      {/* ═══ Top Bar ═══ */}
      <div className="admin-user-top">
        <div className="admin-user-top-left">
          <div className="admin-user-avatar">
            <Identicon username={profile.username} size={56} memberNumber={42} />
          </div>
          <div className="admin-user-identity">
            <h2>{profile.displayName || profile.username}</h2>
            <div className="admin-user-identity-sub">@{profile.username}</div>
          </div>
        </div>
        <div className="admin-user-top-right">
          <span className={`admin-user-status ${rank === 'Newbie' ? 'active' : 'active'}`}>
            {rank}
          </span>
          <span className="admin-user-status active">{xp} XP</span>
        </div>
      </div>

      {/* ═══ Two Column Grid ═══ */}
      <div className="admin-user-grid">
        {/* LEFT: Profile */}
        <div className="admin-section">
          <div className="admin-section-header">PROFILE</div>
          <div className="admin-section-body">
            <div className="admin-info-row">
              <span className="admin-info-label">Username</span>
              <span className="admin-info-value">{profile.username}</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Display Name</span>
              <span className="admin-info-value">{profile.displayName || '—'}</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">User ID</span>
              <span className="admin-info-value" style={{ fontSize: '.65rem', fontFamily: 'var(--f-m)' }}>
                {profile.userId}
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Joined</span>
              <span className="admin-info-value">{profile.createdAt.toLocaleDateString('en-IN')}</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Votes</span>
              <span className="admin-info-value">{profile._count.votes}</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Collection</span>
              <span className="admin-info-value">{profile._count.collection}</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Wishlist</span>
              <span className="admin-info-value">{profile._count.wishlist}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Community */}
        <div className="admin-section">
          <div className="admin-section-header">COMMUNITY</div>
          <div className="admin-section-body">
            {/* XP Progress */}
            <div className="admin-xp-section">
              <div className="admin-xp-header">
                <span className="admin-xp-rank">{rank}</span>
                <span className="admin-xp-count">{xp} XP</span>
              </div>
              <div className="admin-xp-bar">
                <div className="admin-xp-fill" style={{ width: `${xpProgress}%` }} />
              </div>
              <div className="admin-xp-next">
                <span>{xp} / {xpMax} XP</span>
                {nextRank && <span>Next: {nextRank.name}</span>}
              </div>
            </div>

            {/* Badges */}
            <div className="admin-info-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--sp-2)' }}>
              <span className="admin-info-label">Badges</span>
              {sortedBadges.length > 0 ? (
                <div className="admin-badges-wrap">
                  {sortedBadges.map((ub) => (
                    <span
                      key={ub.badge.id}
                      className="admin-badge-pill assigned"
                      style={{
                        backgroundColor: ub.badge.bgColor,
                        color: ub.badge.textColor,
                        borderColor: ub.badge.borderColor,
                      }}
                    >
                      {ub.badge.icon} {ub.badge.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="admin-info-value">No badges assigned</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Actions ═══ */}
      <AdminUserActions
        profileId={profile.id}
        username={profile.username}
        currentXP={xp}
        assignedBadgeIds={Array.from(assignedBadgeIds)}
        allBadges={allBadges.map((b) => ({ id: b.id, name: b.name, slug: b.slug, type: b.type }))}
      />

      {/* ═══ Recent Contributions ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">RECENT CONTRIBUTIONS</div>
        <div className="admin-form-panel-body">
          {profile.contributions.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Contribution</th>
                  <th>Type</th>
                  <th>XP</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profile.contributions.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {c.createdAt.toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 'var(--fw-bold)' }}>{c.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{CONTRIBUTION_TYPE_LABELS[c.type]}</td>
                    <td style={{ color: 'var(--yellow)', fontWeight: 'var(--fw-bold)' }}>+{c.xpAwarded}</td>
                    <td>
                      <span className={`admin-badge-pill ${c.status === 'APPROVED' ? 'assigned' : ''}`} style={{
                        fontSize: '.6rem',
                        minHeight: '22px',
                        padding: '2px 8px',
                        ...(c.status === 'APPROVED' ? { backgroundColor: 'var(--green)', color: '#111', borderColor: 'var(--green)' } :
                          c.status === 'REJECTED' ? { color: 'var(--red)', borderColor: 'var(--red)' } :
                          { color: 'var(--orange)', borderColor: 'var(--orange)' }),
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontFamily: 'var(--f-m)', fontSize: 'var(--fs-status-body)', color: 'var(--text-dim)', textAlign: 'center', padding: 'var(--sp-6)' }}>
              No contributions yet.
            </p>
          )}
        </div>
      </div>

      {/* ═══ Ban History ═══ */}
      <div className="admin-form-panel">
        <div className="admin-form-panel-header">BAN HISTORY</div>
        <div className="admin-form-panel-body">
          {profile.bans.length > 0 ? (
            profile.bans.map((b) => (
              <div key={b.id} className="admin-ban-card">
                <div className="admin-ban-card-header">
                  <span className="admin-ban-type">{b.type}</span>
                  <span className={`admin-ban-status ${b.status === 'ACTIVE' ? 'active' : 'lifted'}`}>
                    {b.status}
                  </span>
                </div>
                <div className="admin-ban-reason">{b.reason}</div>
                <div className="admin-ban-meta">
                  By {b.admin.username} &middot; {b.createdAt.toLocaleDateString('en-IN')}
                  {b.expiresAt && <> &middot; Expires {b.expiresAt.toLocaleDateString('en-IN')}</>}
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontFamily: 'var(--f-m)', fontSize: 'var(--fs-status-body)', color: 'var(--text-dim)', textAlign: 'center', padding: 'var(--sp-6)' }}>
              No bans on record.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
