import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/article-detail";
import { getPublishedArticles } from "@/lib/public-data";
type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) { const { slug } = await params; const article = (await getPublishedArticles()).find((item) => item.slug === slug); return article ? { title: article.seoTitleFr || article.titleFr, description: article.seoDescriptionFr || article.excerptFr } : { title: "Article introuvable" }; }
export default async function ArticleRoute({ params }: Props) { const { slug } = await params; const article = (await getPublishedArticles()).find((item) => item.slug === slug); if (!article) notFound(); return <main><ArticleDetail article={article} /></main>; }
