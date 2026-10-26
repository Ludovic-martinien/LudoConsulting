import { asc } from "drizzle-orm";
import { db } from "@/db";
import { articleCategories, articles } from "@/db/schema";
import { AdminShell } from "@/components/admin-shell";
import { AdminArticles } from "@/components/admin-articles";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des articles", robots: { index: false, follow: false } };
export default async function AdminArticlesPage() {
  const session = await requireAdminPage(["admin", "editor"]);
  const [rows, categories] = await Promise.all([db.select().from(articles).orderBy(asc(articles.createdAt)), db.select({ id: articleCategories.id, nameFr: articleCategories.nameFr, nameEn: articleCategories.nameEn }).from(articleCategories)]);
  const articleData = rows.map(({ id, categoryId, titleFr, titleEn, slug, excerptFr, excerptEn, contentFr, contentEn, coverImageUrl, author, seoTitleFr, seoTitleEn, seoDescriptionFr, seoDescriptionEn, isPublished, publishedAt }) => ({ id, categoryId, titleFr, titleEn, slug, excerptFr, excerptEn, contentFr, contentEn, coverImageUrl, author, seoTitleFr, seoTitleEn, seoDescriptionFr, seoDescriptionEn, isPublished, publishedAt }));
  return <AdminShell email={session.email} role={session.role}><AdminArticles articles={articleData} categories={categories} /></AdminShell>;
}
