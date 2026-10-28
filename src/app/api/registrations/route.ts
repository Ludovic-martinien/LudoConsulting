import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { registrations, servicePackages, users } from "@/db/schema";
import { MEMBER_COOKIE, verifyMemberToken } from "@/lib/member-auth";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

async function optionalMemberId(request: Request): Promise<number | null> {
  try {
    const token = request.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${MEMBER_COOKIE}=`))
      ?.slice(MEMBER_COOKIE.length + 1);
    const session = await verifyMemberToken(token ? decodeURIComponent(token) : undefined);
    if (!session) return null;
    const [user] = await db.select({ id: users.id, tokenVersion: users.tokenVersion }).from(users).where(eq(users.id, session.uid)).limit(1);
    return user && user.tokenVersion === session.tv ? user.id : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "registration", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 180)) return Response.json({ error: "Impossible de traiter ce formulaire." }, { status: 400 });
    const name = cleanText(body.name, 180);
    const email = cleanText(body.email, 254).toLowerCase();
    const phone = cleanText(body.phone, 50);
    const message = cleanText(body.message, 2000);
    const parsedPackage = Number(body.packageId);
    const packageId = Number.isInteger(parsedPackage) && parsedPackage > 0 ? parsedPackage : null;
    if (name.length < 2 || !validEmail(email) || phone.length < 6 || body.consent !== true) return Response.json({ error: "Vérifiez les champs obligatoires et votre consentement." }, { status: 400 });
    if (packageId) {
      const [pkg] = await db.select({ id: servicePackages.id }).from(servicePackages).where(and(eq(servicePackages.id, packageId), eq(servicePackages.isPublished, true))).limit(1);
      if (!pkg) return Response.json({ error: "La formule sélectionnée n’est pas disponible." }, { status: 400 });
    }
    const userId = await optionalMemberId(request);
    const [saved] = await db.insert(registrations).values({ userId, name, email, phone, packageId, message: message || null, consent: true, status: "new" }).returning({ id: registrations.id });
    await logEvent({ action: "registration.created", actorType: userId ? "member" : "anonymous", actorEmail: email, actorId: userId, entityType: "registration", entityId: saved.id, details: { email, packageId }, ip: clientIp(request) });
    return Response.json({ ok: true, id: saved.id }, { status: 201 });
  } catch {
    return Response.json({ error: "La demande n’a pas pu être enregistrée. Réessayez plus tard." }, { status: 500 });
  }
}
