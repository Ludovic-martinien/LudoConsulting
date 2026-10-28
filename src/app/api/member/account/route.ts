import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberSessions, memberUsers } from "@/db/schema";
import { verifyAdminPassword } from "@/lib/auth";
import { getMemberSession, hashPassword } from "@/lib/member-auth";
import { logEvent } from "@/lib/activity";
import { cleanText, publicRateLimit, sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-profile", 10);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const session = await getMemberSession();
  if (!session) return Response.json({ error: "Authentification requise." }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const [user] = await db.select().from(memberUsers).where(eq(memberUsers.id, session.user.id)).limit(1);
    if (!user) return Response.json({ error: "Compte introuvable." }, { status: 404 });
    const updates: { name?: string; passwordHash?: string } = {};
    if (body.name !== undefined) {
      const name = cleanText(body.name, 180);
      if (name.length < 2) return Response.json({ error: "Le nom doit comporter au moins 2 caractères." }, { status: 400 });
      updates.name = name;
    }
    if (body.password !== undefined) {
      const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
      if (password.length < 10) return Response.json({ error: "Le mot de passe doit comporter au moins 10 caractères." }, { status: 400 });
      if (user.passwordHash) {
        const current = typeof body.currentPassword === "string" ? body.currentPassword.slice(0, 256) : "";
        if (!current || !verifyAdminPassword(current, user.passwordHash)) {
          return Response.json({ error: "Le mot de passe actuel est incorrect." }, { status: 401 });
        }
      }
      updates.passwordHash = hashPassword(password);
    }
    if (Object.keys(updates).length === 0) return Response.json({ error: "Aucune modification à enregistrer." }, { status: 400 });
    await logEvent({ actor: session.user.email, actorType: "member", action: "member.profile_update", entityType: "member_user", entityId: String(session.user.id) });
    const [updated] = await db.update(memberUsers).set({ ...updates, updatedAt: new Date() })
      .where(eq(memberUsers.id, user.id)).returning({
        id: memberUsers.id, name: memberUsers.name, email: memberUsers.email, image: memberUsers.image,
      });
    return Response.json({ ok: true, member: updated });
  } catch {
    return Response.json({ error: "La modification n'a pas pu être enregistrée." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const session = await getMemberSession();
  if (!session) return Response.json({ error: "Authentification requise." }, { status: 401 });
  await logEvent({ actor: session.user.email, actorType: "member", action: "member.deleted", entityType: "member_user", entityId: String(session.user.id) });
  await db.delete(memberSessions).where(eq(memberSessions.userId, session.user.id));
  await db.delete(memberUsers).where(eq(memberUsers.id, session.user.id));
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ludo_member_session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
