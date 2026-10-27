import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberUsers } from "@/db/schema";
import {
  createMemberSession,
  exchangeGoogleCode,
  fetchGoogleProfile,
  getOAuthState,
  getOrigin,
  googleOAuthConfig,
  isSecureRequest,
  logMemberEvent,
  memberCookieOptions,
  safeCompare,
} from "@/lib/member-auth";

export const dynamic = "force-dynamic";

function failure(origin: string) {
  const url = new URL("/#espace-membre", origin);
  url.searchParams.set("erreur", "google");
  const response = NextResponse.redirect(url);
  response.cookies.set("ludo_oauth_state", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const origin = getOrigin(request) ?? "/";
  const absoluteOrigin = getOrigin(request) ?? new URL(request.url).origin;
  const url = new URL(request.url);
  if (url.searchParams.get("error")) return failure(absoluteOrigin);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = await getOAuthState();
  if (!code || !safeCompare(state, expectedState)) return failure(absoluteOrigin);
  const config = googleOAuthConfig(getOrigin(request));
  if (!config) return failure(absoluteOrigin);
  try {
    const accessToken = await exchangeGoogleCode(config, code);
    const profile = await fetchGoogleProfile(accessToken);
    if (!profile.verified) return failure(absoluteOrigin);

    let [user] = await db.select().from(memberUsers).where(eq(memberUsers.googleId, profile.sub)).limit(1);
    if (!user) {
      const [byEmail] = await db.select().from(memberUsers).where(eq(memberUsers.email, profile.email)).limit(1);
      if (byEmail) {
        const [linked] = await db.update(memberUsers).set({
          googleId: profile.sub,
          emailVerified: true,
          image: byEmail.image ?? profile.picture,
          updatedAt: new Date(),
        }).where(eq(memberUsers.id, byEmail.id)).returning();
        user = linked;
      } else {
        const [created] = await db.insert(memberUsers).values({
          name: profile.name,
          email: profile.email,
          emailVerified: true,
          image: profile.picture,
          googleId: profile.sub,
          consent: true,
        }).returning();
        user = created;
      }
    } else if (profile.picture && user.image !== profile.picture) {
      await db.update(memberUsers).set({ image: profile.picture, updatedAt: new Date() }).where(eq(memberUsers.id, user.id));
    }
    if (!user) return failure(absoluteOrigin);

    const { token } = await createMemberSession(user.id);
    await logMemberEvent(user.id, "google", request);
    const response = NextResponse.redirect(new URL("/compte", absoluteOrigin));
    response.cookies.set("ludo_oauth_state", "", { httpOnly: true, path: "/", maxAge: 0 });
    response.cookies.set("ludo_member_session", token, memberCookieOptions(isSecureRequest(request)));
    return response;
  } catch {
    return failure(absoluteOrigin);
  }
}
