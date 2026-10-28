import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, auth.email)).limit(1);
  if (!user) return Response.json({ error: "Profil introuvable." }, { status: 404 });
  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, auth.email)).limit(1);
  if (!user) return Response.json({ error: "Profil introuvable." }, { status: 404 });
  // Seul le nom est modifiable ici : ni le rôle, ni l'e-mail, ni le statut.
  if (body.name === undefined) return Response.json({ error: "Aucune modification." }, { status: 400 });
  const name = cleanText(body.name, 180);
  if (name.length < 2) return Response.json({ error: "Indiquez un nom (2 caractères minimum)." }, { status: 400 });
  await db.update(adminUsers).set({ name }).where(eq(adminUsers.id, user.id));
  await logEvent({
    action: "admin.profile_updated", actorType: "admin", actorEmail: auth.email,
    entityType: "admin_user", entityId: user.id, ip: clientIp(request),
  });
  return Response.json({ ok: true, user: { id: user.id, name, email: user.email, role: user.role } });
}
