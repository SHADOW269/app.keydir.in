interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  time: string;
  color?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  span?: number;
}

export function ActivityFeed({ items, title = 'Recent Activity', span = 4 }: ActivityFeedProps) {
  return (
    <div className="dash-panel" style={{ gridColumn: `span ${span}` }}>
      <div className="dash-panel-header">{title}</div>
      <div className="dash-panel-body dash-activity-list">
        {items.length === 0 ? (
          <div className="dash-empty-sm">No recent activity</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="dash-activity-item">
              <span className="dash-activity-icon" style={{ color: item.color || 'var(--text-muted)' }}>{item.icon}</span>
              <div className="dash-activity-content">
                <span className="dash-activity-text">{item.text}</span>
                <span className="dash-activity-time">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
