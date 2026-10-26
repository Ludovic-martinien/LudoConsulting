"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";
import { MediaImage } from "@/components/media-image";

type Article = { id: number; titleFr: string; titleEn: string; slug: string; excerptFr: string; excerptEn: string; coverImageUrl: string | null; publishedAt: Date | null; author: string };
export function BlogPage({ articles }: { articles: Article[] }) {
  const { text, locale } = useLanguage();
  return <><PageHero eyebrowFr="Journal & ressources" eyebrowEn="Journal & resources" titleFr="Des ressources pour mieux appréhender le numérique." titleEn="Resources to make digital easier to understand." descriptionFr="Articles, tutoriels et conseils seront publiés ici au fil du temps. Seuls les contenus effectivement publiés sont visibles." descriptionEn="Articles, tutorials and advice will be published here over time. Only content that has actually been published is shown." /><section className="page-content">{articles.length ? <div className="services-grid">{articles.map((article) => <Link href={`/blog/${article.slug}`} className="article-card" key={article.id}><div className="article-cover">{article.coverImageUrl ? <MediaImage src={article.coverImageUrl} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BookOpen size={31} />}</div><div className="article-card-body"><span>{article.publishedAt ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium" }).format(new Date(article.publishedAt)) : text("Ressource", "Resource")} · {article.author}</span><h3>{text(article.titleFr, article.titleEn || article.titleFr)}</h3><p>{text(article.excerptFr, article.excerptEn || article.excerptFr)}</p><div className="text-link" style={{ marginTop: 15 }}>{text("Lire l'article", "Read article")} <ArrowRight size={14} /></div></div></Link>)}</div> : <div className="empty-state"><span className="service-icon" style={{ margin: "0 auto 15px" }}><BookOpen size={18} /></span><h3>{text("Les premières ressources arrivent bientôt.", "The first resources are coming soon.")}</h3><p>{text("Aucun article n'est publié pour le moment. En attendant, contactez-nous pour une question ou un accompagnement personnalisé.", "No article has been published yet. In the meantime, contact us with a question or for tailored guidance.")}</p></div>}</section></>;
}
