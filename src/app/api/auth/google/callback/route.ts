import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  MEMBER_COOKIE,
  createMemberToken,
  exchangeGoogleCode,
  googleConfigured,
  googleRedirectUri,
  memberCookieOptions,
  publicBaseUrl,
  verifyGoogleState,
} from "@/lib/member-auth";
import { publicRateLimit } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const home = new URL(`${publicBaseUrl(request)}/`);
  const fail = (code: string) => {
    home.searchParams.set("auth", code);
    return Response.redirect(home, 302);
  };
  const limit = publicRateLimit(request, "google-callback", 10, 15 * 60 * 1000);
  if (!limit.allowed) return fail("error");
  if (!googleConfigured()) return fail("google-unavailable");
  const url = new URL(request.url);
  if (url.searchParams.get("error")) return fail("cancelled");
  const code = url.searchParams.get("code");
  if (!code || !(await verifyGoogleState(url.searchParams.get("state")))) return fail("error");
  try {
    const profile = await exchangeGoogleCode(code, googleRedirectUri(request));
    let [user] = await db.select().from(users).where(eq(users.googleId, profile.sub)).limit(1);
    let isNewAccount = false;
    if (!user) {
      const [byEmail] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
      if (byEmail) {
        await db.update(users).set({ googleId: profile.sub, avatarUrl: byEmail.avatarUrl || profile.picture, lastLoginAt: new Date() }).where(eq(users.id, byEmail.id));
        [user] = await db.select().from(users).where(eq(users.id, byEmail.id)).limit(1);
      } else {
        const [created] = await db
          .insert(users)
          .values({ name: profile.name.slice(0, 180), email: profile.email, provider: "google", googleId: profile.sub, avatarUrl: profile.picture, lastLoginAt: new Date() })
          .returning();
        user = created;
        isNewAccount = true;
      }
    } else {
      await db.update(users).set({ lastLoginAt: new Date(), avatarUrl: user.avatarUrl || profile.picture }).where(eq(users.id, user.id));
    }
    if (!user) return fail("error");
    if (user.isActive === false) return fail("disabled");
    await logEvent({ action: isNewAccount ? "member.google_signup" : "member.google_login", actorType: "member", actorEmail: user.email, actorId: user.id, entityType: "user", entityId: user.id, ip: clientIp(request) });
    home.searchParams.set("member", "welcome");
    const response = NextResponse.redirect(home, 302);
    response.cookies.set(MEMBER_COOKIE, await createMemberToken(user), memberCookieOptions(process.env.NODE_ENV === "production"));
    return response;
  } catch {
    return fail("error");
  }
}
