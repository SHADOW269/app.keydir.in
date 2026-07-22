'use client';

interface BadgeInfo {
  name: string;
  icon: string | null;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface Props {
  rank: string;
  xp: number;
  xpMax: number;
  xpProgress: number;
  nextRank: { name: string } | null;
  sortedBadges: BadgeInfo[];
}

export function RankBadgesSection({ rank, xp, xpMax, xpProgress, nextRank, sortedBadges }: Props) {
  return (
    <div className="admin-section">
      <div className="admin-section-header">RANK & BADGES</div>
      <div className="admin-section-body">
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

        <div className="admin-info-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--sp-2)' }}>
          <span className="admin-info-label">Assigned Badges</span>
          {sortedBadges.length > 0 ? (
            <div className="admin-badges-wrap">
              {sortedBadges.map((b, i) => (
                <span
                  key={i}
                  className="admin-badge-pill assigned"
                  style={{ backgroundColor: b.bgColor, color: b.textColor, borderColor: b.borderColor }}
                >
                  {b.icon} {b.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="admin-info-value">No badges assigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
