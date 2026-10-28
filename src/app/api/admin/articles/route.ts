import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articleCategories, articles } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function secureUrl(value: unknown) { const raw = cleanText(value, 1000); if (!raw) return { ok: true, value: null as string | null }; try { const parsed = new URL(raw); return { ok: parsed.protocol === "https:", value: parsed.protocol === "https:" ? raw : null }; } catch { return { ok: false, value: null as string | null }; } }
export async function POST(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]); if (isResponse(auth)) return auth;
  try {
    const body = await request.json() as Record<string, unknown>;
    const titleFr = cleanText(body.titleFr, 240); const titleEn = cleanText(body.titleEn, 240); const slug = cleanText(body.slug, 200).toLowerCase();
    const excerptFr = cleanText(body.excerptFr, 2000); const excerptEn = cleanText(body.excerptEn, 2000); const contentFr = cleanText(body.contentFr, 30000); const contentEn = cleanText(body.contentEn, 30000);
    if (titleFr.length < 2 || titleEn.length < 2 || !slugPattern.test(slug) || excerptFr.length < 5 || contentFr.length < 20) return Response.json({ error: "Vérifiez les titres, le slug, le résumé et le contenu français." }, { status: 400 });
    const categoryId = Number(body.categoryId) || null;
    if (categoryId) { const [category] = await db.select({ id: articleCategories.id }).from(articleCategories).where(eq(articleCategories.id, categoryId)).limit(1); if (!category) return Response.json({ error: "Catégorie introuvable." }, { status: 400 }); }
    const cover = secureUrl(body.coverImageUrl); if (!cover.ok) return Response.json({ error: "L'image doit utiliser une URL HTTPS valide." }, { status: 400 });
    const isPublished = body.isPublished === true;
    const [created] = await db.insert(articles).values({ categoryId, titleFr, titleEn, slug, excerptFr, excerptEn, contentFr, contentEn, coverImageUrl: cover.value, author: cleanText(body.author, 180) || "Ludo_Consulting", seoTitleFr: cleanText(body.seoTitleFr, 240) || null, seoTitleEn: cleanText(body.seoTitleEn, 240) || null, seoDescriptionFr: cleanText(body.seoDescriptionFr, 2000) || null, seoDescriptionEn: cleanText(body.seoDescriptionEn, 2000) || null, isPublished, publishedAt: isPublished ? new Date() : null }).returning({ id: articles.id });
    await logAdminAction(auth, isPublished ? "article.publish" : "article.create", "article", String(created.id));
    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch { return Response.json({ error: "L’article n’a pas pu être créé. Vérifiez le slug et les champs." }, { status: 409 }); }
}
