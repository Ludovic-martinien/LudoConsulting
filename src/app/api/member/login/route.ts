import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberUsers } from "@/db/schema";
import { verifyAdminPassword } from "@/lib/auth";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";
import { createMemberSession, isSecureRequest, logMemberEvent, memberCookieOptions } from "@/lib/member-auth";

export const dynamic = "force-dynamic";
const INVALID = "Adresse e-mail ou mot de passe incorrect.";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "member-login", 8);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 180)) return Response.json({ error: INVALID }, { status: 401 });
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (!validEmail(email) || !password) return Response.json({ error: INVALID }, { status: 401 });
    const [user] = await db.select().from(memberUsers).where(eq(memberUsers.email, email)).limit(1);
    if (!user?.passwordHash || !verifyAdminPassword(password, user.passwordHash)) {
      return Response.json({ error: INVALID }, { status: 401 });
    }
    const { token } = await createMemberSession(user.id);
    await logMemberEvent(user.id, "password", request);
    const response = NextResponse.json({ ok: true, member: { id: user.id, name: user.name, email: user.email, image: user.image } });
    response.cookies.set("ludo_member_session", token, memberCookieOptions(isSecureRequest(request)));
    return response;
  } catch {
    return Response.json({ error: "La connexion n'a pas pu être effectuée." }, { status: 500 });
  }
}
