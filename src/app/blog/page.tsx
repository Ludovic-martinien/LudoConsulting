import { getPublishedArticles } from "@/lib/public-data";
import { BlogPage } from "@/components/blog-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Blog et ressources", description: "Articles, tutoriels et ressources numériques publiés par Ludo_Consulting." };
export default async function BlogRoute() { const articles = await getPublishedArticles(); return <main><BlogPage articles={articles.map(({ id, titleFr, titleEn, slug, excerptFr, excerptEn, coverImageUrl, publishedAt, author }) => ({ id, titleFr, titleEn, slug, excerptFr, excerptEn, coverImageUrl, publishedAt, author }))} /></main>; }
