import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberLoginEvents, memberSessions, memberUsers } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  const [removed] = await db.delete(memberUsers).where(eq(memberUsers.id, id)).returning({ id: memberUsers.id, email: memberUsers.email });
  if (!removed) return Response.json({ error: "Membre introuvable." }, { status: 404 });
  await logAdminAction(auth, "member.delete", "member_user", String(id));
  return Response.json({ ok: true });
}

export async function GET(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  const [user] = await db.select().from(memberUsers).where(eq(memberUsers.id, id)).limit(1);
  if (!user) return Response.json({ error: "Membre introuvable." }, { status: 404 });
  const [sessions, events] = await Promise.all([
    db.select({ expiresAt: memberSessions.expiresAt, createdAt: memberSessions.createdAt }).from(memberSessions).where(eq(memberSessions.userId, id)),
    db.select({ method: memberLoginEvents.method, createdAt: memberLoginEvents.createdAt }).from(memberLoginEvents).where(eq(memberLoginEvents.userId, id)).orderBy(memberLoginEvents.createdAt).limit(50),
  ]);
  return Response.json({
    member: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      googleLinked: Boolean(user.googleId),
      hasPassword: Boolean(user.passwordHash),
      emailVerified: user.emailVerified,
      consent: user.consent,
      createdAt: user.createdAt,
      sessions,
      events,
    },
  });
}
