export const metadata = { title: 'Admin — KeyDir' };

export default function AdminPage() {
  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">OPERATIONS <em className="text-[var(--yellow)]">CENTER</em></div>
          <div className="dash-page-desc">Real-time platform metrics and system health</div>
        </div>
        <div className="dash-page-meta">
          <span className="dash-live-dot" />LIVE
        </div>
      </div>
    </div>
  );
}
