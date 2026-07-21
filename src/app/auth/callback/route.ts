import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const existing = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!existing) {
          const username = user.user_metadata?.username || slugify(user.email?.split('@')[0] || 'user');
          const profile = await prisma.profile.create({
            data: {
              userId: user.id,
              username,
              displayName: user.user_metadata?.full_name || user.user_metadata?.username || null,
            },
          });

          const communityBadge = await prisma.badge.findUnique({ where: { slug: 'community-member' } });
          if (communityBadge) {
            await prisma.userBadge.create({ data: { profileId: profile.id, badgeId: communityBadge.id } });
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+authenticate`);
}
