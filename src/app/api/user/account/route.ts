import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { MEMBER_COOKIE, verifyMemberPassword, verifyMemberToken } from "@/lib/member-auth";
import { publicRateLimit, sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-delete", 5, 15 * 60 * 1000);
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
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.confirm !== true) return Response.json({ error: "Veuillez confirmer la suppression." }, { status: 400 });
    const [user] = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
    if (!user || user.tokenVersion !== session.tv) return Response.json({ error: "Non connecté." }, { status: 401 });
    if (user.passwordHash) {
      const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
      if (!verifyMemberPassword(password, user.passwordHash)) {
        return Response.json({ error: "Mot de passe incorrect : suppression refusée." }, { status: 401 });
      }
    }
    await db.delete(users).where(eq(users.id, user.id));
    const response = NextResponse.json({ ok: true });
    response.cookies.set(MEMBER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" });
    return response;
  } catch {
    return Response.json({ error: "La suppression n'a pas pu être effectuée." }, { status: 500 });
  }
}
