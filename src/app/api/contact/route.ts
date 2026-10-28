import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "contact");
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 180)) return Response.json({ error: "Impossible de traiter ce formulaire." }, { status: 400 });
    const name = cleanText(body.name, 180);
    const email = cleanText(body.email, 254).toLowerCase();
    const phone = cleanText(body.phone, 50);
    const subject = cleanText(body.subject, 240);
    const message = cleanText(body.message, 5000);
    if (name.length < 2 || !validEmail(email) || subject.length < 2 || message.length < 10 || body.consent !== true) {
      return Response.json({ error: "Vérifiez les champs obligatoires et votre consentement." }, { status: 400 });
    }
    const [saved] = await db.insert(contactMessages).values({ name, email, phone: phone || null, subject, message, consent: true, status: "new" }).returning({ id: contactMessages.id });
    await logEvent({ action: "contact.created", actorType: "anonymous", entityType: "contact_message", entityId: saved.id, details: { email, subject }, ip: clientIp(request) });
    return Response.json({ ok: true, id: saved.id }, { status: 201 });
  } catch {
    return Response.json({ error: "Le message n’a pas pu être enregistré. Réessayez plus tard." }, { status: 500 });
  }
}
