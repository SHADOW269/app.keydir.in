import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votes — Admin' };

export default async function AdminVotesPage() {
  const votes = await prisma.vote.findMany({
    include: {
      profile: { select: { username: true } },
      product: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>ALL <em className="text-[var(--orange)]">VOTES</em></h2>
        <div className="sec-tag text-[var(--orange)]">{votes.length} VOTES</div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>User</th>
              <th>Product</th>
              <th>Vote</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((v) => (
              <tr key={v.id}>
                <td className="font-bold">{v.profile.username}</td>
                <td>{v.product.name}</td>
                <td>
                  <span className={`badge ${v.type === 'upvote' ? 'b-green' : 'b-red'}`}>
                    {v.type}
                  </span>
                </td>
                <td className="text-[var(--text-dim)]">
                  {v.createdAt.toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
