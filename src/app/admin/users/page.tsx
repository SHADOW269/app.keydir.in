import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users — Admin' };

export default async function AdminUsersPage() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="page-body">
      <div className="sec-head">
        <h2>ALL <em className="text-[var(--purple)]">USERS</em></h2>
        <div className="sec-tag text-[var(--purple)]">{users.length} USERS</div>
      </div>

      <div className="overflow-x-auto">
        <table className="price-table mb-8">
          <thead>
            <tr>
              <th>Username</th>
              <th>Display Name</th>
              <th>Votes Used</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-bold">{u.username}</td>
                <td className="text-[var(--text-muted)]">{u.displayName ?? '—'}</td>
                <td>{25 - u.voteCredits}/25</td>
                <td className="text-[var(--text-dim)]">
                  {u.createdAt.toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
