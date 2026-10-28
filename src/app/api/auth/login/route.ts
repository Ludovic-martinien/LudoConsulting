import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs, adminUsers } from "@/db/schema";
import { createSessionToken, sessionCookieOptions, verifyAdminPassword, type AdminRole } from "@/lib/auth";
import { getAdminCredentials } from "@/lib/admin-config";
import { cleanText, publicRateLimit, sameOrigin } from "@/lib/request-guard";
import { ensureSeedData } from "@/lib/seed";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "admin-login", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const creds = await getAdminCredentials();
  if (!creds) {
    return Response.json({ error: "L’accès administrateur n’est pas encore configuré. Consultez la documentation de déploiement." }, { status: 503 });
  }
  const configuredEmail = creds.email;
  const passwordHash = creds.passwordHash;
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (email !== configuredEmail || !verifyAdminPassword(password, passwordHash)) {
      await logEvent({ action: "admin.login_failed", actorType: "anonymous", entityType: "admin_user", details: { email }, success: false, ip: clientIp(request) });
      return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    }
    await ensureSeedData();
    await db.insert(adminUsers).values({ email: configuredEmail, role: "admin", isActive: true }).onConflictDoNothing();
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, configuredEmail)).limit(1);
    if (!user?.isActive) return Response.json({ error: "Ce compte n’est pas autorisé à accéder à l’administration." }, { status: 403 });
    const role = user.role as AdminRole;
    await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
    await db.insert(activityLogs).values({ adminEmail: configuredEmail, actorType: "admin", actorId: String(user.id), action: "admin.login", entityType: "admin_user", entityId: String(user.id), details: { role }, success: true, ip: clientIp(request) });
    const response = NextResponse.json({ ok: true, role });
    response.cookies.set("ludo_admin_session", createSessionToken(configuredEmail, role), sessionCookieOptions(process.env.NODE_ENV === "production"));
    return response;
  } catch {
    return Response.json({ error: "La connexion n’a pas pu être effectuée." }, { status: 500 });
  }
}
