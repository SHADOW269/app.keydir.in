import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORIES } from '@/lib/admin/product-categories';
import { DashboardGrid, KpiCard, ChartCard, SectionHeader } from '@/components/admin/dashboard';
import { ProductBarChart } from '@/components/admin/dashboard/charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products — Admin' };

export default async function AdminProductsPage() {
  const counts = await prisma.product.groupBy({ by: ['productType'], _count: true });
  const totalProducts = counts.reduce((sum, c) => sum + c._count, 0);

  const chartData = PRODUCT_CATEGORIES.map((cat) => {
    const match = counts.find((c) => c.productType === cat.slug);
    return { name: cat.label, count: match?._count ?? 0 };
  });

  return (
    <div className="page-body">
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">PRODUCT <em className="text-[var(--yellow)]">MANAGEMENT</em></div>
          <div className="dash-page-desc">{totalProducts} total products across {PRODUCT_CATEGORIES.length} categories</div>
        </div>
      </div>

      <DashboardGrid>
        <SectionHeader title="Overview" span={12} />

        <KpiCard label="Total Products" value={totalProducts} icon="◆" color="var(--yellow)" span={4} />
        {PRODUCT_CATEGORIES.map((cat) => {
          const match = counts.find((c) => c.productType === cat.slug);
          return (
            <KpiCard key={cat.slug} label={cat.label} value={match?._count ?? 0} icon={cat.icon} color="var(--yellow)" span={2} />
          );
        })}

        <SectionHeader title="Distribution" span={12} />

        <ChartCard title="Products by Category" subtitle="Inventory breakdown" span={6} height={280}>
          <ProductBarChart data={chartData} />
        </ChartCard>

        <div className="flex flex-col gap-4" style={{ gridColumn: 'span 6' }}>
          {PRODUCT_CATEGORIES.map((cat) => {
            const match = counts.find((c) => c.productType === cat.slug);
            const count = match?._count ?? 0;
            const pct = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
            return (
              <Link key={cat.slug} href={`/admin/products/${cat.slug}`} className="dash-kpi" style={{ gridColumn: 'span 6' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="dash-kpi-label">{cat.icon} {cat.label}</div>
                    <div className="dash-kpi-value" style={{ fontSize: '1.4rem' }}>{count}</div>
                  </div>
                  <div className="text-right">
                    <div className="dash-kpi-trend positive">{pct}%</div>
                    <Link href={`/admin/products/${cat.slug}`} className="dash-kpi-label" style={{ color: 'var(--yellow)' }}>Manage →</Link>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <SectionHeader title="Quick Actions" span={12} />

        {PRODUCT_CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/admin/products/new/${cat.slug}`} className="dash-kpi" style={{ gridColumn: 'span 3' }}>
            <div className="dash-kpi-label" style={{ color: 'var(--yellow)' }}>+ Add {cat.singular}</div>
            <div className="dash-kpi-value" style={{ color: 'var(--yellow)', fontSize: '1.2rem' }}>{cat.icon} {cat.label}</div>
          </Link>
        ))}
      </DashboardGrid>
    </div>
  );
}
