import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  MEMBER_COOKIE,
  createMemberToken,
  memberCookieOptions,
  verifyMemberPassword,
  verifyMemberToken,
} from "@/lib/member-auth";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

async function currentUser(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${MEMBER_COOKIE}=`))
    ?.slice(MEMBER_COOKIE.length + 1);
  const session = await verifyMemberToken(token ? decodeURIComponent(token) : undefined);
  if (!session) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
  if (!user || user.tokenVersion !== session.tv) return null;
  return user;
}

function publicProfile(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatarUrl,
    provider: user.provider,
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Non connecté." }, { status: 401 });
  return Response.json({ user: publicProfile(user) });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-profile", 10, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Non connecté." }, { status: 401 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const patch: { name?: string; phone?: string | null; email?: string } = {};
    if (body.name !== undefined) {
      const name = cleanText(body.name, 180);
      if (name.length < 2) return Response.json({ error: "Indiquez votre nom (2 caractères minimum)." }, { status: 400 });
      patch.name = name;
    }
    if (body.phone !== undefined) {
      const phone = cleanText(body.phone, 30);
      if (phone && !/^[\d\s+\-.()]{6,30}$/.test(phone)) return Response.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
      patch.phone = phone || null;
    }
    if (body.email !== undefined) {
      const email = cleanText(body.email, 254).toLowerCase();
      if (!validEmail(email)) return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
      if (email !== user.email) {
        if (user.passwordHash) {
          const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword.slice(0, 256) : "";
          if (!verifyMemberPassword(currentPassword, user.passwordHash)) {
            return Response.json({ error: "Mot de passe actuel incorrect : changement d'e-mail refusé." }, { status: 401 });
          }
        }
        const [taken] = await db.select({ id: users.id }).from(users).where(and(eq(users.email, email), ne(users.id, user.id))).limit(1);
        if (taken) return Response.json({ error: "Cet e-mail est déjà utilisé par un autre compte." }, { status: 409 });
        patch.email = email;
      }
    }
    if (Object.keys(patch).length === 0) return Response.json({ ok: true, user: publicProfile(user) });
    await db.update(users).set(patch).where(eq(users.id, user.id));
    const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!fresh) return Response.json({ error: "Profil introuvable." }, { status: 404 });
    await logEvent({ action: patch.email ? "member.email_changed" : "member.profile_updated", actorType: "member", actorEmail: fresh.email, actorId: fresh.id, entityType: "user", entityId: fresh.id, details: { fields: Object.keys(patch).join(",") }, ip: clientIp(request) });
    const response = NextResponse.json({ ok: true, user: publicProfile(fresh) });
    response.cookies.set(MEMBER_COOKIE, await createMemberToken(fresh), memberCookieOptions(process.env.NODE_ENV === "production"));
    return response;
  } catch {
    return Response.json({ error: "La mise à jour n'a pas pu être effectuée." }, { status: 500 });
  }
}
