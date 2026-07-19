import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DashboardGrid, KpiCard, ChartCard, SectionHeader } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Brands — Admin' };

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  const totalProducts = brands.reduce((sum, b) => sum + b._count.products, 0);
  const topBrands = [...brands].sort((a, b) => b._count.products - a._count.products).slice(0, 8);

  const chartData = topBrands.map((b) => ({
    name: b.name.length > 12 ? b.name.slice(0, 12) + '…' : b.name,
    count: b._count.products,
  }));

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">BRAND <em className="text-[var(--blue)]">MANAGEMENT</em></div>
          <div className="dash-page-desc">{brands.length} brands in catalog</div>
        </div>
        <Link href="/admin/brands/new" className="btn-primary btn-sm">+ ADD NEW</Link>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Brands" value={brands.length} icon="◆" color="var(--blue)" span={4} />
        <KpiCard label="Total Products" value={totalProducts} icon="◆" color="var(--yellow)" span={4} />
        <KpiCard label="Avg Products/Brand" value={brands.length > 0 ? Math.round(totalProducts / brands.length) : 0} icon="◆" color="var(--green)" span={4} />

        <SectionHeader title="Top Brands" span={12} />

        <ChartCard title="Brands by Product Count" subtitle="Top 8 brands" span={6} height={280}>
          {chartData.length > 0 ? (
            <div className="flex flex-col gap-3 p-4">
              {chartData.map((b) => {
                const maxCount = Math.max(...chartData.map((d) => d.count));
                const width = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
                return (
                  <div key={b.name} className="flex items-center gap-4">
                    <span className="font-[family-name:var(--f-m)] text-xs text-[var(--text-muted)] w-28 text-right truncate">{b.name}</span>
                    <div className="flex-1 h-5 bg-[var(--surface)] relative">
                      <div className="h-full bg-[var(--blue)] transition-all" style={{ width: `${width}%` }} />
                    </div>
                    <span className="font-[family-name:var(--f-m)] text-xs font-bold text-[var(--text)] w-10 text-right">{b.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty-sm">No brands yet</div>
          )}
        </ChartCard>

        <div className="dash-panel" style={{ gridColumn: 'span 6' }}>
          <div className="dash-panel-header">All Brands</div>
          <div className="dash-panel-body" style={{ padding: 0 }}>
            <div className="overflow-x-auto" style={{ maxHeight: 360 }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">Name</th>
                    <th className="dash-th">Slug</th>
                    <th className="dash-th">Products</th>
                    <th className="dash-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <tr key={b.id}>
                      <td className="dash-td font-bold">{b.name}</td>
                      <td className="dash-td text-[var(--text-dim)] font-[family-name:var(--f-m)] text-xs">{b.slug}</td>
                      <td className="dash-td">{b._count.products}</td>
                      <td className="dash-td">
                        <Link href={`/admin/brands/${b.id}`} className="text-[var(--yellow)] hover:text-[var(--green)] font-[family-name:var(--f-m)] text-xs font-bold">
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
