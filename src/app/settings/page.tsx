import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ConnectedAccounts } from '@/components/auth/connected-accounts';
import { getConnectedAccounts } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const accounts = await getConnectedAccounts();

  return (
    <>
      <Navbar />
      <main className="settings-page">
        <div className="settings-container">
          <h1 className="settings-title">Settings</h1>
          <ConnectedAccounts
            methods={accounts?.methods ?? []}
            error={params.error}
            message={params.message}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
