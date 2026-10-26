import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceItems, servicePackages, servicePrices, services } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
type JsonRecord = Record<string, unknown>;
const priceTypes = ["quote", "starting", "packages", "structured", "fixed", "unavailable"];
function isRecord(value: unknown): value is JsonRecord { return typeof value === "object" && value !== null && !Array.isArray(value); }
function parsePrice(value: unknown) { if (value === null || value === "") return null; const amount = Number(value); return Number.isSafeInteger(amount) && amount >= 0 && amount <= 1_000_000_000 ? amount : Number.NaN; }
function list(value: unknown, limit = 60) { return Array.isArray(value) ? value.map((item) => cleanText(item, 240)).filter(Boolean).slice(0, limit) : []; }

export async function PATCH(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  try {
    const body = await request.json() as JsonRecord;
    const titleFr = cleanText(body.titleFr, 220); const titleEn = cleanText(body.titleEn, 220);
    const descriptionFr = cleanText(body.descriptionFr, 5000); const descriptionEn = cleanText(body.descriptionEn, 5000);
    const priceType = cleanText(body.priceType, 32); const basePrice = parsePrice(body.basePrice);
    if (titleFr.length < 2 || titleEn.length < 2 || descriptionFr.length < 10 || descriptionEn.length < 10 || !priceTypes.includes(priceType) || Number.isNaN(basePrice)) return Response.json({ error: "Données du service ou tarif invalides." }, { status: 400 });
    const [current] = await db.select({ id: services.id }).from(services).where(eq(services.id, id)).limit(1);
    if (!current) return Response.json({ error: "Service introuvable." }, { status: 404 });
    const itemFr = list(body.itemsFr); const itemEn = list(body.itemsEn);
    if (itemFr.length !== itemEn.length) return Response.json({ error: "Le nombre de prestations doit être identique en français et en anglais." }, { status: 400 });
    const priceUpdates = Array.isArray(body.prices) ? body.prices.filter(isRecord) : [];
    const packageUpdates = Array.isArray(body.packages) ? body.packages.filter(isRecord) : [];
    const newPackages = Array.isArray(body.newPackages) ? body.newPackages.filter(isRecord) : [];
    if (priceUpdates.length > 100 || packageUpdates.length > 100 || newPackages.length > 10) return Response.json({ error: "Trop de modifications dans une seule requête." }, { status: 400 });
    for (const update of priceUpdates) if (!Number.isInteger(Number(update.id)) || !Number.isSafeInteger(Number(update.price)) || Number(update.price) < 0 || Number(update.price) > 1_000_000_000) return Response.json({ error: "Tarif invalide." }, { status: 400 });
    for (const update of packageUpdates) {
      const packagePrice = Number(update.price); const featuresFr = list(update.featuresFr); const featuresEn = list(update.featuresEn);
      if (!Number.isInteger(Number(update.id)) || !Number.isSafeInteger(packagePrice) || packagePrice < 0 || packagePrice > 1_000_000_000 || cleanText(update.nameFr, 180).length < 2 || cleanText(update.nameEn, 180).length < 2 || featuresFr.length !== featuresEn.length) return Response.json({ error: "Vérifiez le prix, les noms et les modules des formules." }, { status: 400 });
    }
    for (const plan of newPackages) {
      const packagePrice = Number(plan.price); const featuresFr = list(plan.featuresFr); const featuresEn = list(plan.featuresEn);
      if (cleanText(plan.nameFr, 180).length < 2 || cleanText(plan.nameEn, 180).length < 2 || !Number.isSafeInteger(packagePrice) || packagePrice < 0 || packagePrice > 1_000_000_000 || featuresFr.length !== featuresEn.length) return Response.json({ error: "La nouvelle formule doit avoir un nom bilingue et un prix valide." }, { status: 400 });
    }
    await db.transaction(async (tx) => {
      await tx.update(services).set({ titleFr, titleEn, descriptionFr, descriptionEn, priceType, basePrice, isPublished: body.isPublished === true, updatedAt: new Date() }).where(eq(services.id, id));
      await tx.delete(serviceItems).where(eq(serviceItems.serviceId, id));
      if (itemFr.length) await tx.insert(serviceItems).values(itemFr.map((itemTitleFr, index) => ({ serviceId: id, titleFr: itemTitleFr, titleEn: itemEn[index], displayOrder: index + 1, isActive: true })));
      for (const update of priceUpdates) {
        const priceId = Number(update.id);
        const [belongs] = await tx.select({ id: servicePrices.id }).from(servicePrices).where(and(eq(servicePrices.id, priceId), eq(servicePrices.serviceId, id))).limit(1);
        if (!belongs) throw new Error("Invalid service price reference");
        await tx.update(servicePrices).set({ price: Number(update.price), updatedAt: new Date() }).where(eq(servicePrices.id, priceId));
      }
      for (const update of packageUpdates) {
        const packageId = Number(update.id);
        const [belongs] = await tx.select({ id: servicePackages.id }).from(servicePackages).where(and(eq(servicePackages.id, packageId), eq(servicePackages.serviceId, id))).limit(1);
        if (!belongs) throw new Error("Invalid service package reference");
        await tx.update(servicePackages).set({
          nameFr: cleanText(update.nameFr, 180), nameEn: cleanText(update.nameEn, 180),
          descriptionFr: cleanText(update.descriptionFr, 4000), descriptionEn: cleanText(update.descriptionEn, 4000),
          price: Number(update.price), featuresFr: list(update.featuresFr), featuresEn: list(update.featuresEn),
          duration: cleanText(update.duration, 120) || null, audienceFr: cleanText(update.audienceFr, 220) || null, audienceEn: cleanText(update.audienceEn, 220) || null,
          conditionsFr: cleanText(update.conditionsFr, 3000) || null, conditionsEn: cleanText(update.conditionsEn, 3000) || null,
          isPublished: update.isPublished === true, updatedAt: new Date(),
        }).where(eq(servicePackages.id, packageId));
      }
      for (const plan of newPackages) {
        await tx.insert(servicePackages).values({
          serviceId: id, nameFr: cleanText(plan.nameFr, 180), nameEn: cleanText(plan.nameEn, 180),
          descriptionFr: cleanText(plan.descriptionFr, 4000), descriptionEn: cleanText(plan.descriptionEn, 4000),
          price: Number(plan.price), currency: "FCFA", featuresFr: list(plan.featuresFr), featuresEn: list(plan.featuresEn),
          duration: cleanText(plan.duration, 120) || null, audienceFr: cleanText(plan.audienceFr, 220) || null, audienceEn: cleanText(plan.audienceEn, 220) || null,
          conditionsFr: cleanText(plan.conditionsFr, 3000) || null, conditionsEn: cleanText(plan.conditionsEn, 3000) || null,
          isPublished: plan.isPublished === true, displayOrder: 100,
        });
      }
    });
    await logAdminAction(auth, "service.update", "service", String(id), { priceChanges: priceUpdates.length, packages: packageUpdates.length + newPackages.length, items: itemFr.length });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "La modification n’a pas pu être enregistrée." }, { status: 500 });
  }
}
