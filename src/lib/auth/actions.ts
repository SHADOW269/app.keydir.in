'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const username = formData.get('username') as string;

  if (password !== confirmPassword) {
    redirect('/auth/register?error=' + encodeURIComponent('Passwords do not match'));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    redirect('/auth/register?error=' + encodeURIComponent(error.message));
  }

  redirect('/auth/account-created');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) redirect('/auth/login?error=' + encodeURIComponent(error.message));
  if (data.url) redirect(data.url);
}

export async function signInWithDiscord() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) redirect('/auth/login?error=' + encodeURIComponent(error.message));
  if (data.url) redirect(data.url);
}

export async function linkProviderAction(provider: string) {
  await linkProvider(provider as 'google' | 'discord');
}

export async function linkProvider(provider: 'google' | 'discord') {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings`,
    },
  });

  if (error) redirect('/settings?error=' + encodeURIComponent(error.message));
  if (data.url) redirect(data.url);
}

export async function unlinkProvider(provider: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const identities = user.identities;

  if (!identities || identities.length <= 1) {
    redirect('/settings?error=' + encodeURIComponent('Cannot disconnect your last authentication method'));
  }

  const identity = identities.find((i) => i.provider === provider);
  if (!identity) {
    redirect('/settings?error=' + encodeURIComponent('Provider not connected'));
  }

  const { error } = await supabase.auth.unlinkIdentity(identity);

  if (error) {
    redirect('/settings?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/settings');
  redirect('/settings?message=' + encodeURIComponent(`${provider} disconnected`));
}

export async function getConnectedAccounts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const identities = user.identities;

  const linked = new Map<string, { email?: string; username?: string }>();
  if (identities) {
    for (const identity of identities) {
      linked.set(identity.provider, {
        email: (identity.identity_data?.email as string | undefined) ?? undefined,
        username:
          (identity.identity_data?.full_name as string | undefined) ??
          (identity.identity_data?.username as string | undefined) ??
          undefined,
      });
    }
  }

  const hasPassword = linked.has('email');

  return {
    hasPassword,
    methods: [
      {
        id: 'email' as const,
        name: 'Email & Password',
        connected: hasPassword,
        email: user.email ?? undefined,
      },
      {
        id: 'google' as const,
        name: 'Google',
        connected: linked.has('google'),
        email: linked.get('google')?.email,
      },
      {
        id: 'discord' as const,
        name: 'Discord',
        connected: linked.has('discord'),
        email: linked.get('discord')?.email ?? linked.get('discord')?.username,
      },
    ],
  };
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    redirect('/auth/forgot-password?error=' + encodeURIComponent(error.message));
  }

  redirect('/auth/forgot-password?message=Check+your+email+for+the+reset+link');
}
