import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const VALID_ROLES = ["admin", "editor", "sales"];

export async function PATCH(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const [target] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    if (!target) return Response.json({ error: "Compte introuvable." }, { status: 404 });
    if (target.email.toLowerCase() === auth.email.toLowerCase()) {
      return Response.json({ error: "Vous ne pouvez pas modifier votre propre rôle ni votre propre statut." }, { status: 403 });
    }
    const updates: { role?: string; isActive?: boolean; name?: string | null } = {};
    if (body.role !== undefined) {
      const role = cleanText(body.role, 40);
      if (!VALID_ROLES.includes(role)) return Response.json({ error: "Rôle invalide." }, { status: 400 });
      updates.role = role;
    }
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") return Response.json({ error: "Statut invalide." }, { status: 400 });
      updates.isActive = body.isActive;
    }
    if (body.name !== undefined) {
      const name = cleanText(body.name, 180);
      updates.name = name || null;
    }
    if (Object.keys(updates).length === 0) return Response.json({ error: "Aucune modification." }, { status: 400 });
    await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id));
    await logAdminAction(auth, body.role !== undefined ? "admin.role_change" : "admin.user_status", "admin_user", String(id), {
      email: target.email,
      ...(updates.role ? { role: updates.role } : {}),
      ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Modification impossible." }, { status: 500 });
  }
}
