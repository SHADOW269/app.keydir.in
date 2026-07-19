import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORIES } from '@/lib/admin/product-categories';
import { DashboardGrid, KpiCard, SectionHeader } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings — Admin' };

export default async function AdminSettingsPage() {
  const [totalProducts, totalVendorProducts, totalVotes, enabledVendors, productTypeCounts] = await Promise.all([
    prisma.product.count(),
    prisma.vendorProduct.count(),
    prisma.vote.count(),
    prisma.vendor.findMany({ where: { enabled: true }, select: { name: true } }),
    prisma.product.groupBy({ by: ['productType'], _count: true }),
  ]);

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">ADMIN <em className="text-[var(--yellow)]">SETTINGS</em></div>
          <div className="dash-page-desc">Platform configuration and system info</div>
        </div>
      </div>

      <DashboardGrid>
        <SectionHeader title="Site Statistics" span={12} />

        <KpiCard label="Total Products" value={totalProducts} icon="◆" color="var(--yellow)" span={3} />
        <KpiCard label="Price Entries" value={totalVendorProducts} icon="◆" color="var(--green)" span={3} />
        <KpiCard label="Total Votes" value={totalVotes} icon="▲" color="var(--orange)" span={3} />
        <KpiCard label="Active Vendors" value={enabledVendors.length} icon="●" color="var(--cyan)" span={3} />

        <SectionHeader title="Products by Category" span={12} />

        {PRODUCT_CATEGORIES.map((cat) => {
          const match = productTypeCounts.find((pt) => pt.productType === cat.slug);
          const count = match?._count ?? 0;
          const pct = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
          return (
            <div key={cat.slug} className="dash-kpi" style={{ gridColumn: 'span 3' }}>
              <div className="dash-kpi-label">{cat.icon} {cat.label}</div>
              <div className="dash-kpi-value" style={{ fontSize: '1.4rem' }}>{count}</div>
              <div className="dash-kpi-trend positive">{pct}%</div>
            </div>
          );
        })}

        <SectionHeader title="Active Vendors" span={12} />

        <div className="dash-panel" style={{ gridColumn: 'span 6' }}>
          <div className="dash-panel-header">Enabled Vendors</div>
          <div className="dash-panel-body">
            {enabledVendors.length === 0 ? (
              <div className="dash-empty-sm">No active vendors</div>
            ) : (
              <div className="dash-activity-list">
                {enabledVendors.map((v) => (
                  <div key={v.name} className="dash-activity-item">
                    <span className="dash-activity-icon" style={{ color: 'var(--green)' }}>●</span>
                    <div className="dash-activity-content">
                      <span className="dash-activity-text">{v.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-panel" style={{ gridColumn: 'span 6' }}>
          <div className="dash-panel-header">Environment</div>
          <div className="dash-panel-body">
            <div className="dash-activity-list">
              <div className="dash-activity-item">
                <span className="dash-activity-icon" style={{ color: 'var(--cyan)' }}>◆</span>
                <div className="dash-activity-content">
                  <span className="dash-activity-text">Node.js</span>
                  <span className="dash-activity-time">{process.version}</span>
                </div>
              </div>
              <div className="dash-activity-item">
                <span className="dash-activity-icon" style={{ color: 'var(--green)' }}>●</span>
                <div className="dash-activity-content">
                  <span className="dash-activity-text">Database</span>
                  <span className="dash-activity-time">Supabase PostgreSQL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
