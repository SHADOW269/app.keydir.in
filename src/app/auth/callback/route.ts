import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=Missing+authorization+code`
    );
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth Error:", error);

      return NextResponse.redirect(
        `${origin}/auth/login?error=Could+not+authenticate`
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${origin}/auth/login?error=No+user+returned`
      );
    }

    let profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!profile) {
      const baseUsername =
        user.user_metadata?.username ??
        slugify(user.email?.split("@")[0] ?? "user");

      let username = baseUsername;
      let counter = 1;

      while (
        await prisma.profile.findUnique({
          where: { username },
        })
      ) {
        username = `${baseUsername}${counter++}`;
      }

      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          username,
          displayName:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            null,
        },
      });

      const communityBadge = await prisma.badge.findUnique({
        where: {
          slug: "community-member",
        },
      });

      if (communityBadge) {
        await prisma.userBadge.create({
          data: {
            profileId: profile.id,
            badgeId: communityBadge.id,
          },
        });
      }
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("Auth callback error:", err);

    return NextResponse.redirect(
      `${origin}/auth/login?error=Unexpected+server+error`
    );
  }
}
