import { eq } from "drizzle-orm";
import { scryptSync, randomBytes } from "node:crypto";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { verifyAdminPassword } from "@/lib/auth";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/admin-config";
import { publicRateLimit, sameOrigin } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  const limit = publicRateLimit(request, "admin-password", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword.slice(0, 256) : "";
  const next = typeof body.newPassword === "string" ? body.newPassword.slice(0, 256) : "";
  if (next.length < 8) return Response.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  // Seul le compte propriétaire (identifiants gérés) peut changer le mot de passe partagé.
  const creds = await getAdminCredentials();
  if (!creds || auth.email.toLowerCase() !== creds.email.toLowerCase() || !verifyAdminPassword(currentPassword, creds.passwordHash)) {
    await logEvent({ action: "admin.password_changed", actorType: "admin", actorEmail: auth.email, entityType: "admin_user", success: false, ip: clientIp(request) });
    return Response.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
  }
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `scrypt:${salt}:${scryptSync(next, salt, 64).toString("hex")}`;
  await saveAdminCredentials({ ...creds, passwordHash });
  const [user] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, auth.email)).limit(1);
  await logEvent({ action: "admin.password_changed", actorType: "admin", actorEmail: auth.email, entityType: "admin_user", entityId: user?.id, ip: clientIp(request) });
  return Response.json({ ok: true });
}
