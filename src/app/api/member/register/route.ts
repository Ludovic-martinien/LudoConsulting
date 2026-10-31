import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberUsers } from "@/db/schema";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";
import { createMemberSession, hashPassword, isSecureRequest, logMemberEvent, memberCookieOptions } from "@/lib/member-auth";
import { logEvent } from "@/lib/activity";
import { ensureMigrations } from "@/lib/migrate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-register", 5);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    // Crée les tables si la base est neuve (Neon/Vercel) : idempotent.
    await ensureMigrations();
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 180)) return Response.json({ error: "Impossible de traiter ce formulaire." }, { status: 400 });
    const name = cleanText(body.name, 180);
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (name.length < 2 || !validEmail(email)) return Response.json({ error: "Vérifiez votre nom et votre adresse e-mail." }, { status: 400 });
    if (process.env.ADMIN_EMAIL?.trim().toLowerCase() && email === process.env.ADMIN_EMAIL.trim().toLowerCase()) {
      return Response.json({ error: "Cette adresse est réservée à l'administration. Utilisez le formulaire de connexion." }, { status: 409 });
    }
    if (password.length < 10) return Response.json({ error: "Choisissez un mot de passe d'au moins 10 caractères." }, { status: 400 });
    if (body.consent !== true) return Response.json({ error: "Votre consentement est requis pour créer un compte." }, { status: 400 });
    const [existing] = await db.select({ id: memberUsers.id }).from(memberUsers).where(eq(memberUsers.email, email)).limit(1);
    if (existing) return Response.json({ error: "Un compte existe déjà avec cette adresse e-mail. Connectez-vous plutôt." }, { status: 409 });
    let userId: number;
    try {
      const [created] = await db.insert(memberUsers).values({
        name, email, passwordHash: hashPassword(password), consent: true, emailVerified: false,
      }).returning({ id: memberUsers.id });
      userId = created.id;
    } catch (insertError) {
      const code = (insertError as { code?: string } | null)?.code;
      if (code === "23505") {
        return Response.json({ error: "Un compte existe déjà avec cette adresse e-mail. Connectez-vous plutôt." }, { status: 409 });
      }
      console.error("Inscription : écriture impossible —", insertError instanceof Error ? insertError.message : insertError);
      return Response.json({ error: "Le service d'inscription est momentanément indisponible. Réessayez dans quelques minutes." }, { status: 503 });
    }
    const { token } = await createMemberSession(userId);
    await logMemberEvent(userId, "register", request);
    await logEvent({ actor: email, actorType: "member", action: "member.register", entityType: "member_user", entityId: String(userId) });
    const response = NextResponse.json({ ok: true, member: { id: userId, name, email, image: null } }, { status: 201 });
    response.cookies.set("ludo_member_session", token, memberCookieOptions(isSecureRequest(request)));
    return response;
  } catch (error) {
    console.error("Inscription : erreur serveur —", error instanceof Error ? error.message : error);
    return Response.json({ error: "Le service d'inscription est momentanément indisponible. Réessayez dans quelques minutes." }, { status: 503 });
  }
}
