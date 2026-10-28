import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers, users } from "@/db/schema";
import { MEMBER_COOKIE, createMemberToken, memberCookieOptions, memberSecretAvailable, verifyMemberPassword } from "@/lib/member-auth";
import { createSessionToken, sessionCookieOptions, verifyAdminPassword, type AdminRole } from "@/lib/auth";
import { getAdminCredentials } from "@/lib/admin-config";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";
import { ensureSeedData } from "@/lib/seed";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-login", 8, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (!(await memberSecretAvailable())) return Response.json({ error: "Le service de connexion n'est pas configuré. Contactez l'administrateur du site." }, { status: 503 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (!validEmail(email) || !password) return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user) {
      if (user.isActive === false) {
        await logEvent({ action: "member.login_failed", actorType: "member", actorEmail: email, actorId: user.id, entityType: "user", entityId: user.id, details: { reason: "disabled" }, success: false, ip: clientIp(request) });
        return Response.json({ error: "Ce compte est désactivé. Contactez le support." }, { status: 403 });
      }
      if (!user.passwordHash) return Response.json({ error: "Ce compte utilise la connexion Google. Utilisez le bouton Google." }, { status: 401 });
      if (!verifyMemberPassword(password, user.passwordHash)) {
        await logEvent({ action: "member.login_failed", actorType: "member", actorEmail: email, actorId: user.id, entityType: "user", entityId: user.id, success: false, ip: clientIp(request) });
        return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
      }
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
      await logEvent({ action: "member.login", actorType: "member", actorEmail: email, actorId: user.id, entityType: "user", entityId: user.id, ip: clientIp(request) });
      const response = NextResponse.json({
        ok: true,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatarUrl },
      });
      response.cookies.set(MEMBER_COOKIE, await createMemberToken(user), memberCookieOptions(process.env.NODE_ENV === "production"));
      return response;
    }
    // Formulaire unique : repli administrateur quand aucun membre ne correspond.
    const creds = await getAdminCredentials();
    if (creds && email === creds.email && verifyAdminPassword(password, creds.passwordHash)) {
      await ensureSeedData();
      await db.insert(adminUsers).values({ email: creds.email, role: "admin", isActive: true }).onConflictDoNothing();
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, creds.email)).limit(1);
      if (!admin?.isActive) return Response.json({ error: "Ce compte n’est pas autorisé à accéder à l’administration." }, { status: 403 });
      const role = admin.role as AdminRole;
      await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, admin.id));
      await logEvent({ action: "admin.login", actorType: "admin", actorEmail: creds.email, actorId: admin.id, entityType: "admin_user", entityId: admin.id, details: { role, via: "unified" }, ip: clientIp(request) });
      const response = NextResponse.json({ ok: true, role, redirect: "/admin" });
      response.cookies.set("ludo_admin_session", createSessionToken(creds.email, role), sessionCookieOptions(process.env.NODE_ENV === "production"));
      return response;
    }
    await logEvent({ action: "member.login_failed", actorType: "anonymous", entityType: "user", details: { email }, success: false, ip: clientIp(request) });
    return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
  } catch {
    return Response.json({ error: "La connexion n'a pas pu être effectuée." }, { status: 500 });
  }
}
