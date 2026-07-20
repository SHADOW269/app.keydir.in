import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { VendorDashboard } from '@/components/admin/vendor-dashboard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditVendorPage({ params }: Props) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) notFound();

  const [productCount, scrapeLogCount, recentLogs] = await Promise.all([
    prisma.vendorProduct.count({ where: { vendorId: id } }),
    prisma.scrapeLog.count({ where: { vendorId: id } }),
    prisma.scrapeLog.findMany({
      where: { vendorId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const successLogs = recentLogs.filter((l) => l.status === 'SUCCESS').length;
  const failedLogs = recentLogs.filter((l) => l.status === 'FAILED').length;
  const avgResponseTime = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((s, l) => s + (l.responseTimeMs || 0), 0) / recentLogs.length)
    : 0;
  const successRate = recentLogs.length > 0
    ? Math.round((successLogs / recentLogs.length) * 100)
    : null;

  return (
    <VendorDashboard
      vendor={{
        ...vendor,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      }}
      stats={{
        productCount,
        scrapeLogCount,
        successRate,
        avgResponseTime,
        successLogs,
        failedLogs,
        totalRecentLogs: recentLogs.length,
      }}
      recentLogs={recentLogs.map((l) => ({
        id: l.id,
        status: l.status,
        httpStatus: l.httpStatus,
        responseTimeMs: l.responseTimeMs,
        error: l.error,
        price: l.price,
        createdAt: l.createdAt.toISOString(),
      }))}
    />
  );
}
