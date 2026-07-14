import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings — Admin' };

export default async function AdminSettingsPage() {
  const [
    totalProducts,
    totalVendorProducts,
    totalVotes,
    enabledVendors,
    categoriesWithCounts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.vendorProduct.count(),
    prisma.vote.count(),
    prisma.vendor.findMany({ where: { enabled: true }, select: { name: true } }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>ADMIN <em className="text-[var(--yellow)]">SETTINGS</em></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Site Stats */}
        <div className="neo-card p-6">
          <h3 className="font-[family-name:var(--f-m)] text-sm font-bold uppercase tracking-widest text-[var(--text-dim)] mb-4 border-b-2 border-[var(--border)] pb-2">
            SITE STATISTICS
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between font-[family-name:var(--f-m)] text-sm">
              <span className="text-[var(--text-muted)]">Total Products</span>
              <span className="font-bold">{totalProducts}</span>
            </div>
            <div className="flex justify-between font-[family-name:var(--f-m)] text-sm">
              <span className="text-[var(--text-muted)]">Price Entries</span>
              <span className="font-bold">{totalVendorProducts}</span>
            </div>
            <div className="flex justify-between font-[family-name:var(--f-m)] text-sm">
              <span className="text-[var(--text-muted)]">Total Votes</span>
              <span className="font-bold">{totalVotes}</span>
            </div>
          </div>
        </div>

        {/* Active Vendors */}
        <div className="neo-card p-6">
          <h3 className="font-[family-name:var(--f-m)] text-sm font-bold uppercase tracking-widest text-[var(--text-dim)] mb-4 border-b-2 border-[var(--border)] pb-2">
            ACTIVE VENDORS
          </h3>
          {enabledVendors.length === 0 ? (
            <div className="font-[family-name:var(--f-m)] text-sm text-[var(--text-dim)]">No active vendors</div>
          ) : (
            <div className="space-y-2">
              {enabledVendors.map((v) => (
                <div key={v.name} className="font-[family-name:var(--f-m)] text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--green)] rounded-full" />
                  {v.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="neo-card p-6 lg:col-span-2">
          <h3 className="font-[family-name:var(--f-m)] text-sm font-bold uppercase tracking-widest text-[var(--text-dim)] mb-4 border-b-2 border-[var(--border)] pb-2">
            PRODUCTS BY CATEGORY
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoriesWithCounts.map((c) => (
              <div key={c.id} className="stat-box">
                <span className="stat-num">{c._count.products}</span>
                <span className="stat-label">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="neo-card p-6 max-w-2xl">
        <h3 className="font-[family-name:var(--f-m)] text-sm font-bold uppercase tracking-widest text-[var(--text-dim)] mb-4 border-b-2 border-[var(--border)] pb-2">
          ENVIRONMENT
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between font-[family-name:var(--f-m)] text-sm">
            <span className="text-[var(--text-muted)]">Node.js</span>
            <span className="font-bold">{process.version}</span>
          </div>
          <div className="flex justify-between font-[family-name:var(--f-m)] text-sm">
            <span className="text-[var(--text-muted)]">Database</span>
            <span className="font-bold">Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
