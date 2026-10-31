import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { logEvent } from "@/lib/activity";
import { ensureMigrations } from "@/lib/migrate";
import { registrations, servicePackages } from "@/db/schema";
import { cleanText, publicRateLimit, sameOrigin, validEmail } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = publicRateLimit(request, "registration", 5, 15 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 180)) return Response.json({ error: "Impossible de traiter ce formulaire." }, { status: 400 });
    await ensureMigrations();
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
    const [saved] = await db.insert(registrations).values({ name, email, phone, packageId, message: message || null, consent: true, status: "new" }).returning({ id: registrations.id });
    await logEvent({ actor: email, actorType: "anonymous", action: "form.received", entityType: "registration", entityId: String(saved.id) });
    return Response.json({ ok: true, id: saved.id }, { status: 201 });
  } catch {
    return Response.json({ error: "La demande n’a pas pu être enregistrée. Réessayez plus tard." }, { status: 500 });
  }
}
