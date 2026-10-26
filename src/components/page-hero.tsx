"use client";

import { useLanguage } from "@/components/language-provider";

export function PageHero({ eyebrowFr, eyebrowEn, titleFr, titleEn, descriptionFr, descriptionEn }: { eyebrowFr: string; eyebrowEn: string; titleFr: string; titleEn: string; descriptionFr: string; descriptionEn: string }) {
  const { text } = useLanguage();
  return <section className="page-hero"><div className="page-hero-inner"><span className="eyebrow">{text(eyebrowFr, eyebrowEn)}</span><h1>{text(titleFr, titleEn)}</h1><p>{text(descriptionFr, descriptionEn)}</p></div></section>;
}
