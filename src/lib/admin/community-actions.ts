'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function resetProductVotes(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'auth_required' };

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    return { error: 'not_authorized' };
  }

  await prisma.vote.deleteMany({ where: { productId } });
  revalidatePath('/admin/community');
  revalidatePath('/keyboards');
  return { success: true };
}

export async function removeVote(voteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'auth_required' };

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    return { error: 'not_authorized' };
  }

  await prisma.vote.delete({ where: { id: voteId } });
  revalidatePath('/admin/community');
  return { success: true };
}
