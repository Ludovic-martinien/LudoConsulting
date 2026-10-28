import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, adminUsers, memberUsers } from "@/db/schema";
import { createSessionToken, sessionCookieOptions, verifyAdminPassword, type AdminRole } from "@/lib/auth";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";
import { logEvent } from "@/lib/activity";
import { createMemberSession, isSecureRequest, logMemberEvent, memberCookieOptions } from "@/lib/member-auth";

export const dynamic = "force-dynamic";
const INVALID = "Adresse e-mail ou mot de passe incorrect.";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-login", 8);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 180)) return Response.json({ error: INVALID }, { status: 401 });
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (!validEmail(email) || !password) return Response.json({ error: INVALID }, { status: 401 });
    // Compte administrateur : mêmes identifiants que le formulaire dédié,
    // vérifiés en priorité pour que ce parcours ne soit jamais éclipsé.
    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const configuredAdminHash = process.env.ADMIN_PASSWORD_HASH;
    if (configuredAdminEmail && configuredAdminHash && email === configuredAdminEmail) {
      if (!verifyAdminPassword(password, configuredAdminHash)) {
        await logEvent({ actor: email, actorType: "anonymous", action: "admin.login_failed", result: "failure" });
        return Response.json({ error: INVALID }, { status: 401 });
      }
      await db.insert(adminUsers).values({ email: configuredAdminEmail, role: "admin", isActive: true }).onConflictDoNothing();
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, configuredAdminEmail)).limit(1);
      if (!admin?.isActive) {
        await logEvent({ actor: email, actorType: "anonymous", action: "admin.login_failed", result: "failure" });
        return Response.json({ error: INVALID }, { status: 401 });
      }
      await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, admin.id));
      await db.insert(activityLogs).values({ adminEmail: configuredAdminEmail, action: "admin.login", entityType: "admin_user", entityId: String(admin.id), details: { role: admin.role } });
      const response = NextResponse.json({ ok: true, role: admin.role, redirect: "/admin" });
      response.cookies.set("ludo_admin_session", createSessionToken(configuredAdminEmail, admin.role as AdminRole), sessionCookieOptions(process.env.NODE_ENV === "production"));
      return response;
    }
    // L'adresse de l'administrateur est réservée : aucun compte membre ne peut l'utiliser.
    if (configuredAdminEmail && email === configuredAdminEmail) {
      return Response.json({ error: INVALID }, { status: 401 });
    }
    const [user] = await db.select().from(memberUsers).where(eq(memberUsers.email, email)).limit(1);
    if (!user?.passwordHash || !verifyAdminPassword(password, user.passwordHash)) {
      await logEvent({ actor: email, actorType: "anonymous", action: "member.login_failed", result: "failure" });
      return Response.json({ error: INVALID }, { status: 401 });
    }
    const { token } = await createMemberSession(user.id);
    await logMemberEvent(user.id, "password", request);
    await logEvent({ actor: email, actorType: "member", action: "member.login", entityType: "member_user", entityId: String(user.id) });
    const response = NextResponse.json({ ok: true, member: { id: user.id, name: user.name, email: user.email, image: user.image } });
    response.cookies.set("ludo_member_session", token, memberCookieOptions(isSecureRequest(request)));
    return response;
  } catch {
    return Response.json({ error: "La connexion n'a pas pu être effectuée." }, { status: 500 });
  }
}
