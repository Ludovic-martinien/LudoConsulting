import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { MEMBER_COOKIE, createMemberToken, hashMemberPassword, memberCookieOptions, memberSecretAvailable } from "@/lib/member-auth";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-signup", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (!memberSecretAvailable()) return Response.json({ error: "Le service d'inscription n'est pas configuré. Contactez l'administrateur du site." }, { status: 503 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = cleanText(body.name, 180);
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (name.length < 2) return Response.json({ error: "Indiquez votre nom (2 caractères minimum)." }, { status: 400 });
    if (!validEmail(email)) return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    if (password.length < 8) return Response.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) return Response.json({ error: "Un compte existe déjà avec cet e-mail. Connectez-vous." }, { status: 409 });
    const [created] = await db
      .insert(users)
      .values({ name, email, passwordHash: hashMemberPassword(password), provider: "email", lastLoginAt: new Date() })
      .returning({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl, tokenVersion: users.tokenVersion });
    if (!created) return Response.json({ error: "L'inscription n'a pas pu être effectuée." }, { status: 500 });
    const response = NextResponse.json({
      ok: true,
      user: { id: created.id, name: created.name, email: created.email, avatar: created.avatarUrl },
    });
    response.cookies.set(MEMBER_COOKIE, createMemberToken(created), memberCookieOptions(process.env.NODE_ENV === "production"));
    return response;
  } catch {
    return Response.json({ error: "L'inscription n'a pas pu être effectuée." }, { status: 500 });
  }
}
