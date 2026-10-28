import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ludoconsulting.vercel.app";

type ArticleRow = { slug: string; updatedAt: Date };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Les rubriques Services, Réalisations, Tarifs et Formations sont réservées
  // aux membres connectés : elles sont exclues du sitemap (accès redirigé).
  // Si la base est injoignable (ex. compilation sans DATABASE_URL), on sert
  // uniquement les chemins statiques au lieu de faire échouer le build.
  let articleRows: ArticleRow[] = [];
  try {
    await ensureSeedData();
    articleRows = await db.select({ slug: articles.slug, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.isPublished, true));
  } catch {
    /* Base indisponible : sitemap statique uniquement. */
  }
  const staticPaths = ["", "/about", "/skills", "/blog", "/quote", "/contact", "/privacy", "/legal", "/terms"];
  return [
    ...staticPaths.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...articleRows.map((article) => ({ url: `${baseUrl}/blog/${article.slug}`, lastModified: article.updatedAt, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
