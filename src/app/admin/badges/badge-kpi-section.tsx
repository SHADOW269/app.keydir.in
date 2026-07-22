'use client';

interface Stats {
  total: number;
  visible: number;
  hidden: number;
  totalAwards: number;
  rankCount: number;
  communityCount: number;
}

export function BadgeKpiSection({ stats }: { stats: Stats }) {
  return (
    <div className="dash-grid" style={{ marginBottom: 16 }}>
      <div className="dash-kpi" style={{ gridColumn: 'span 2' }}>
        <div className="dash-kpi-header">
          <span className="dash-kpi-label">Total Badges</span>
          <span className="dash-kpi-icon" style={{ color: 'var(--yellow)' }}>◆</span>
        </div>
        <div className="dash-kpi-value" style={{ color: 'var(--yellow)' }}>{stats.total}</div>
      </div>
      <div className="dash-kpi" style={{ gridColumn: 'span 2' }}>
        <div className="dash-kpi-header">
          <span className="dash-kpi-label">Visible</span>
          <span className="dash-kpi-icon" style={{ color: 'var(--green)' }}>●</span>
        </div>
        <div className="dash-kpi-value" style={{ color: 'var(--green)' }}>{stats.visible}</div>
      </div>
      <div className="dash-kpi" style={{ gridColumn: 'span 2' }}>
        <div className="dash-kpi-header">
          <span className="dash-kpi-label">Hidden</span>
          <span className="dash-kpi-icon" style={{ color: 'var(--text-muted)' }}>○</span>
        </div>
        <div className="dash-kpi-value" style={{ color: 'var(--text-muted)' }}>{stats.hidden}</div>
      </div>
      <div className="dash-kpi" style={{ gridColumn: 'span 2' }}>
        <div className="dash-kpi-header">
          <span className="dash-kpi-label">Total Awards</span>
          <span className="dash-kpi-icon" style={{ color: 'var(--purple)' }}>◆</span>
        </div>
        <div className="dash-kpi-value" style={{ color: 'var(--purple)' }}>{stats.totalAwards}</div>
      </div>
      <div className="dash-kpi" style={{ gridColumn: 'span 2' }}>
        <div className="dash-kpi-header">
          <span className="dash-kpi-label">Rank</span>
          <span className="dash-kpi-icon" style={{ color: 'var(--yellow)' }}>◆</span>
        </div>
        <div className="dash-kpi-value" style={{ color: 'var(--yellow)' }}>{stats.rankCount}</div>
      </div>
      <div className="dash-kpi" style={{ gridColumn: 'span 2' }}>
        <div className="dash-kpi-header">
          <span className="dash-kpi-label">Community</span>
          <span className="dash-kpi-icon" style={{ color: 'var(--green)' }}>◆</span>
        </div>
        <div className="dash-kpi-value" style={{ color: 'var(--green)' }}>{stats.communityCount}</div>
      </div>
    </div>
  );
}
