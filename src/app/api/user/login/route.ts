import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { MEMBER_COOKIE, createMemberToken, memberCookieOptions, memberSecretAvailable, verifyMemberPassword } from "@/lib/member-auth";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-login", 8, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (!memberSecretAvailable()) return Response.json({ error: "Le service de connexion n'est pas configuré. Contactez l'administrateur du site." }, { status: 503 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (!validEmail(email) || !password) return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    if (!user.passwordHash) return Response.json({ error: "Ce compte utilise la connexion Google. Utilisez le bouton Google." }, { status: 401 });
    if (!verifyMemberPassword(password, user.passwordHash)) return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatarUrl },
    });
    response.cookies.set(MEMBER_COOKIE, createMemberToken(user), memberCookieOptions(process.env.NODE_ENV === "production"));
    return response;
  } catch {
    return Response.json({ error: "La connexion n'a pas pu être effectuée." }, { status: 500 });
  }
}
