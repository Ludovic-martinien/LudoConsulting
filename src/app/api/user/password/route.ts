import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  MEMBER_COOKIE,
  createMemberToken,
  hashMemberPassword,
  memberCookieOptions,
  verifyMemberPassword,
  verifyMemberToken,
} from "@/lib/member-auth";
import { publicRateLimit, sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-password", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${MEMBER_COOKIE}=`))
    ?.slice(MEMBER_COOKIE.length + 1);
  const session = await verifyMemberToken(token ? decodeURIComponent(token) : undefined);
  if (!session) return Response.json({ error: "Non connecté." }, { status: 401 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword.slice(0, 256) : "";
    const next = typeof body.newPassword === "string" ? body.newPassword.slice(0, 256) : "";
    if (next.length < 8) return Response.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    const [user] = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
    if (!user || user.tokenVersion !== session.tv) return Response.json({ error: "Non connecté." }, { status: 401 });
    if (user.passwordHash && !verifyMemberPassword(currentPassword, user.passwordHash)) {
      return Response.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
    }
    await db
      .update(users)
      .set({ passwordHash: hashMemberPassword(next), tokenVersion: user.tokenVersion + 1 })
      .where(eq(users.id, user.id));
    const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!fresh) return Response.json({ error: "Profil introuvable." }, { status: 404 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(MEMBER_COOKIE, await createMemberToken(fresh), memberCookieOptions(process.env.NODE_ENV === "production"));
    return response;
  } catch {
    return Response.json({ error: "La modification n'a pas pu être effectuée." }, { status: 500 });
  }
}
