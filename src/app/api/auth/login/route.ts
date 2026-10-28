import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs, adminUsers } from "@/db/schema";
import { createSessionToken, sessionCookieOptions, verifyAdminPassword, type AdminRole } from "@/lib/auth";
import { cleanText, publicRateLimit, sameOrigin } from "@/lib/request-guard";
import { ensureSeedData } from "@/lib/seed";
import { logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "admin-login", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !passwordHash || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) {
    return Response.json({ error: "L’accès administrateur n’est pas encore configuré. Consultez la documentation de déploiement." }, { status: 503 });
  }
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (email !== configuredEmail || !verifyAdminPassword(password, passwordHash)) {
      await logEvent({ actor: email, actorType: "anonymous", action: "admin.login_failed", result: "failure" });
      return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    }
    await ensureSeedData();
    await db.insert(adminUsers).values({ email: configuredEmail, role: "admin", isActive: true }).onConflictDoNothing();
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, configuredEmail)).limit(1);
    if (!user?.isActive) return Response.json({ error: "Ce compte n’est pas autorisé à accéder à l’administration." }, { status: 403 });
    const role = user.role as AdminRole;
    await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
    await db.insert(activityLogs).values({ adminEmail: configuredEmail, action: "admin.login", entityType: "admin_user", entityId: String(user.id), details: { role } });
    const response = NextResponse.json({ ok: true, role });
    response.cookies.set("ludo_admin_session", createSessionToken(configuredEmail, role), sessionCookieOptions(process.env.NODE_ENV === "production"));
    return response;
  } catch {
    return Response.json({ error: "La connexion n’a pas pu être effectuée." }, { status: 500 });
  }
}
