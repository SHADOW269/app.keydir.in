import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DashboardGrid, KpiCard, ChartCard, SectionHeader } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vendors — Admin' };

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: { _count: { select: { vendorProducts: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const enabled = vendors.filter((v) => v.enabled).length;
  const disabled = vendors.length - enabled;
  const totalVendorProducts = vendors.reduce((sum, v) => sum + v._count.vendorProducts, 0);

  const chartData = vendors.slice(0, 10).map((v) => ({
    name: v.name.length > 12 ? v.name.slice(0, 12) + '…' : v.name,
    count: v._count.vendorProducts,
  }));

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">VENDOR <em className="text-[var(--green)]">MANAGEMENT</em></div>
          <div className="dash-page-desc">{vendors.length} vendors tracked</div>
        </div>
        <Link href="/admin/vendors/new" className="btn-primary btn-sm">+ ADD NEW</Link>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Vendors" value={vendors.length} icon="◇" color="var(--green)" span={3} />
        <KpiCard label="Active" value={enabled} icon="●" color="var(--green)" span={3} />
        <KpiCard label="Disabled" value={disabled} icon="○" color="var(--red)" span={3} />
        <KpiCard label="Price Entries" value={totalVendorProducts} icon="◆" color="var(--yellow)" span={3} />

        <SectionHeader title="Product Distribution" span={12} />

        <ChartCard title="Vendor Product Counts" subtitle="Top 10 vendors by product count" span={12} height={280}>
          {chartData.length > 0 ? (
            <div className="flex flex-col gap-3 p-4">
              {chartData.map((v) => {
                const maxCount = Math.max(...chartData.map((d) => d.count));
                const width = maxCount > 0 ? (v.count / maxCount) * 100 : 0;
                return (
                  <div key={v.name} className="flex items-center gap-4">
                    <span className="font-[family-name:var(--f-m)] text-xs text-[var(--text-muted)] w-28 text-right truncate">{v.name}</span>
                    <div className="flex-1 h-5 bg-[var(--surface)] relative">
                      <div className="h-full bg-[var(--green)] transition-all" style={{ width: `${width}%` }} />
                    </div>
                    <span className="font-[family-name:var(--f-m)] text-xs font-bold text-[var(--text)] w-10 text-right">{v.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty-sm">No vendors yet</div>
          )}
        </ChartCard>

        <SectionHeader title="All Vendors" span={12} />

        <div className="dash-panel" style={{ gridColumn: 'span 12' }}>
          <div className="dash-panel-header">Vendor Directory</div>
          <div className="dash-panel-body" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">Name</th>
                    <th className="dash-th">Website</th>
                    <th className="dash-th">Products</th>
                    <th className="dash-th">Status</th>
                    <th className="dash-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td className="dash-td font-bold">{v.name}</td>
                      <td className="dash-td">
                        <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-[var(--blue)] underline font-[family-name:var(--f-m)] text-xs">
                          {v.website}
                        </a>
                      </td>
                      <td className="dash-td">{v._count.vendorProducts}</td>
                      <td className="dash-td">
                        <span className={`badge ${v.enabled ? 'b-green' : 'b-red'}`}>
                          {v.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="dash-td">
                        <Link href={`/admin/vendors/${v.id}`} className="text-[var(--yellow)] hover:text-[var(--green)] font-[family-name:var(--f-m)] text-xs font-bold">
                          EDIT
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
