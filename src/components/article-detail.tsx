"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";

type Article = { titleFr: string; titleEn: string; excerptFr: string; excerptEn: string; contentFr: string; contentEn: string; author: string; publishedAt: Date | null };
export function ArticleDetail({ article }: { article: Article }) {
  const { text, locale } = useLanguage();
  const content = text(article.contentFr, article.contentEn || article.contentFr);
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
  return <><PageHero eyebrowFr="Ressource" eyebrowEn="Resource" titleFr={article.titleFr} titleEn={article.titleEn || article.titleFr} descriptionFr={article.excerptFr} descriptionEn={article.excerptEn || article.excerptFr} /><article className="page-content page-content-narrow"><Link href="/blog" className="text-link"><ArrowLeft size={15} /> {text("Retour au journal", "Back to journal")}</Link><p className="form-disclaimer" style={{ marginTop: 20 }}>{article.publishedAt ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long" }).format(new Date(article.publishedAt)) : ""} · {text("Par", "By")} {article.author}</p><div className="content-prose" style={{ marginTop: 33 }}>{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article></>;
}
