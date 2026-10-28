import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  const [user] = await db.select({
    id: adminUsers.id,
    email: adminUsers.email,
    name: adminUsers.name,
    role: adminUsers.role,
    isActive: adminUsers.isActive,
    lastLoginAt: adminUsers.lastLoginAt,
    createdAt: adminUsers.createdAt,
  }).from(adminUsers).where(eq(adminUsers.email, auth.email)).limit(1);
  if (!user) return Response.json({ error: "Profil introuvable." }, { status: 404 });
  return Response.json({ profile: user });
}

export async function PATCH(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.role !== undefined || body.email !== undefined || body.isActive !== undefined) {
      return Response.json({ error: "Le rôle, l'e-mail et le statut ne sont pas modifiables depuis le profil." }, { status: 403 });
    }
    const name = cleanText(body.name, 180);
    if (!name || name.length < 2) return Response.json({ error: "Le nom doit comporter au moins 2 caractères." }, { status: 400 });
    const [updated] = await db.update(adminUsers).set({ name }).where(eq(adminUsers.email, auth.email)).returning({ id: adminUsers.id });
    if (!updated) return Response.json({ error: "Profil introuvable." }, { status: 404 });
    await logAdminAction(auth, "admin.profile_update", "admin_user", String(updated.id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Modification impossible." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // La suppression d'un compte staff passe par un autre administrateur (traçabilité).
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  return Response.json({ error: "La suppression d'un compte staff doit être effectuée par un autre administrateur." }, { status: 403 });
}
