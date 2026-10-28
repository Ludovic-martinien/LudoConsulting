import { db } from "@/db";
import { serviceItems, services } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export async function POST(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  try {
    const body = await request.json() as Record<string, unknown>;
    const titleFr = cleanText(body.titleFr, 220); const titleEn = cleanText(body.titleEn, 220); const slug = cleanText(body.slug, 180).toLowerCase();
    const descriptionFr = cleanText(body.descriptionFr, 5000); const descriptionEn = cleanText(body.descriptionEn, 5000); const icon = cleanText(body.icon, 80) || "code";
    if (titleFr.length < 2 || titleEn.length < 2 || !slugPattern.test(slug) || descriptionFr.length < 10 || descriptionEn.length < 10) return Response.json({ error: "Vérifiez les titres, le slug et les descriptions obligatoires." }, { status: 400 });
    const [created] = await db.insert(services).values({ titleFr, titleEn, slug, descriptionFr, descriptionEn, icon, priceType: "quote", displayOrder: 100, isPublished: false }).returning({ id: services.id });
    await logAdminAction(auth, "service.create", "service", String(created.id));
    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch {
    return Response.json({ error: "Le service n’a pas pu être créé. Vérifiez notamment que son slug est unique." }, { status: 409 });
  }
}
