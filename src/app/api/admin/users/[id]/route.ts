import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, quoteRequests, registrations, users } from "@/db/schema";
import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string): { kind: "member" | "admin"; id: number } | null {
  const [kind, value] = raw.split(":");
  const id = Number(value);
  if ((kind !== "member" && kind !== "admin") || !Number.isInteger(id) || id <= 0) return null;
  return { kind, id };
}

export async function GET(request: Request, { params }: Ctx) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  const parsed = parseId((await params).id);
  if (!parsed) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  if (parsed.kind === "member") {
    const [user] = await db.select().from(users).where(eq(users.id, parsed.id)).limit(1);
    if (!user) return Response.json({ error: "Utilisateur introuvable." }, { status: 404 });
    const [quotes, regs] = await Promise.all([
      db.select({ id: quoteRequests.id, referenceNumber: quoteRequests.referenceNumber, status: quoteRequests.status, createdAt: quoteRequests.createdAt }).from(quoteRequests).where(eq(quoteRequests.userId, user.id)),
      db.select({ id: registrations.id, status: registrations.status, createdAt: registrations.createdAt }).from(registrations).where(eq(registrations.userId, user.id)),
    ]);
    const { passwordHash: _hash, ...safe } = user;
    return Response.json({
      user: { ...safe, kind: "member", role: "member", createdAt: user.createdAt.toISOString(), lastLoginAt: user.lastLoginAt?.toISOString() ?? null, termsAcceptedAt: user.termsAcceptedAt?.toISOString() ?? null },
      quotes: quotes.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() })),
      registrations: regs.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    });
  }
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, parsed.id)).limit(1);
  if (!admin) return Response.json({ error: "Utilisateur introuvable." }, { status: 404 });
  return Response.json({
    user: { ...admin, kind: "admin", createdAt: admin.createdAt.toISOString(), lastLoginAt: admin.lastLoginAt?.toISOString() ?? null },
    quotes: [],
    registrations: [],
  });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  const parsed = parseId((await params).id);
  if (!parsed) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const ip = clientIp(request);

  if (parsed.kind === "member") {
    const [user] = await db.select().from(users).where(eq(users.id, parsed.id)).limit(1);
    if (!user) return Response.json({ error: "Utilisateur introuvable." }, { status: 404 });
    if (typeof body.isActive === "boolean" && body.isActive !== user.isActive) {
      await db.update(users).set({ isActive: body.isActive, tokenVersion: user.tokenVersion + 1 }).where(eq(users.id, user.id));
      await logEvent({
        action: body.isActive ? "member.activated" : "member.deactivated",
        actorType: "admin", actorEmail: auth.email, entityType: "user", entityId: user.id,
        details: { email: user.email }, ip,
      });
    }
    return Response.json({ ok: true });
  }

  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, parsed.id)).limit(1);
  if (!admin) return Response.json({ error: "Utilisateur introuvable." }, { status: 404 });
  const isSelf = admin.email.toLowerCase() === auth.email.toLowerCase();
  if (typeof body.isActive === "boolean" && body.isActive !== admin.isActive) {
    if (isSelf) return Response.json({ error: "Vous ne pouvez pas désactiver votre propre compte." }, { status: 409 });
    if (!body.isActive) {
      const others = await db.select({ id: adminUsers.id }).from(adminUsers).where(and(eq(adminUsers.isActive, true), ne(adminUsers.id, admin.id))).limit(1);
      if (others.length === 0) return Response.json({ error: "Impossible : c'est le dernier compte administrateur actif." }, { status: 409 });
    }
    await db.update(adminUsers).set({ isActive: body.isActive }).where(eq(adminUsers.id, admin.id));
    await logEvent({
      action: body.isActive ? "admin.user_activated" : "admin.user_deactivated",
      actorType: "admin", actorEmail: auth.email, entityType: "admin_user", entityId: admin.id,
      details: { email: admin.email }, ip,
    });
  }
  if (typeof body.role === "string") {
    const role = cleanText(body.role, 40);
    if (!["admin", "editor", "sales"].includes(role)) return Response.json({ error: "Rôle invalide." }, { status: 400 });
    if (role !== admin.role) {
      if (isSelf) return Response.json({ error: "Vous ne pouvez pas modifier votre propre rôle." }, { status: 409 });
      if (admin.role === "admin" && role !== "admin") {
        const others = await db.select({ id: adminUsers.id }).from(adminUsers).where(and(eq(adminUsers.role, "admin"), eq(adminUsers.isActive, true), ne(adminUsers.id, admin.id))).limit(1);
        if (others.length === 0) return Response.json({ error: "Impossible : c'est le dernier administrateur." }, { status: 409 });
      }
      await db.update(adminUsers).set({ role }).where(eq(adminUsers.id, admin.id));
      await logEvent({
        action: "admin.user_role_changed", actorType: "admin", actorEmail: auth.email,
        entityType: "admin_user", entityId: admin.id, details: { email: admin.email, from: admin.role, to: role }, ip,
      });
    }
  }
  return Response.json({ ok: true });
}
