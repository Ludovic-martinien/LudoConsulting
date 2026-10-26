import "server-only";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { getAdminSession, type AdminRole, type AdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/request-guard";

export async function authorizeAdmin(request: Request, roles: AdminRole[] = ["admin"]) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Authentification requise." }, { status: 401 });
  if (!roles.includes(session.role)) return Response.json({ error: "Permission insuffisante." }, { status: 403 });
  return session;
}

export async function logAdminAction(session: AdminSession, action: string, entityType?: string, entityId?: string, details: Record<string, string | number | boolean | null> = {}) {
  await db.insert(activityLogs).values({ adminEmail: session.email, action, entityType: entityType ?? null, entityId: entityId ?? null, details });
}

export function isResponse(value: AdminSession | Response): value is Response {
  return value instanceof Response;
}
