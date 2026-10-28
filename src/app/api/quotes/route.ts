import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { quoteRequests, services, users } from "@/db/schema";
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
  const limit = publicRateLimit(request, "quote", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 180)) return Response.json({ error: "Impossible de traiter ce formulaire." }, { status: 400 });
    const name = cleanText(body.name, 180);
    const email = cleanText(body.email, 254).toLowerCase();
    const phone = cleanText(body.phone, 50);
    const company = cleanText(body.company, 220);
    const serviceSlug = cleanText(body.serviceSlug, 180);
    const description = cleanText(body.description, 10000);
    const budget = cleanText(body.budget, 120);
    const desiredDeadline = cleanText(body.desiredDeadline, 120);
    if (name.length < 2 || !validEmail(email) || phone.length < 6 || description.length < 15 || !serviceSlug || body.consent !== true) {
      return Response.json({ error: "Vérifiez les champs obligatoires et votre consentement." }, { status: 400 });
    }
    const [service] = await db.select({ id: services.id, slug: services.slug }).from(services).where(and(eq(services.slug, serviceSlug), eq(services.isPublished, true))).limit(1);
    if (!service) return Response.json({ error: "Le service sélectionné n’est pas disponible." }, { status: 400 });
    const referenceNumber = `LC-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const userId = await optionalMemberId(request);
    const [saved] = await db.insert(quoteRequests).values({ referenceNumber, userId, name, email, phone, company: company || null, serviceId: service.id, serviceSlug: service.slug, description, budget: budget || null, desiredDeadline: desiredDeadline || null, consent: true, status: "new" }).returning({ referenceNumber: quoteRequests.referenceNumber });
    await logEvent({ action: "quote.created", actorType: userId ? "member" : "anonymous", actorEmail: email, actorId: userId, entityType: "quote_request", entityId: saved.referenceNumber, details: { serviceSlug, email }, ip: clientIp(request) });
    return Response.json({ ok: true, reference: saved.referenceNumber }, { status: 201 });
  } catch {
    return Response.json({ error: "La demande n’a pas pu être enregistrée. Réessayez plus tard." }, { status: 500 });
  }
}
