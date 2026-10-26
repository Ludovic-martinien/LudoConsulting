"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";

type Skill = { id: number; nameFr: string; nameEn: string; categoryFr: string; categoryEn: string; descriptionFr: string | null; descriptionEn: string | null };
export function SkillsPage({ skills }: { skills: Skill[] }) {
  const { text } = useLanguage();
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) groups.set(text(skill.categoryFr, skill.categoryEn), [...(groups.get(text(skill.categoryFr, skill.categoryEn)) ?? []), skill]);
  return <><PageHero eyebrowFr="Compétences" eyebrowEn="Skills" titleFr="Des compétences mises au service de vos projets." titleEn="Skills put to work for your projects." descriptionFr="Une présentation sans scores artificiels : les domaines et outils sont détaillés avec transparence, sans pourcentages de maîtrise non vérifiés." descriptionEn="No made-up scores: areas and tools are presented transparently, without unverified proficiency percentages." /><section className="page-content">{skills.length === 0 ? <div className="empty-state"><h3>{text("Les compétences sont en cours de structuration.", "Skills are being organised.")}</h3><p>{text("Contactez-nous pour discuter d'un besoin spécifique.", "Contact us to discuss a specific need.")}</p></div> : <div style={{ display: "grid", gap: 37 }}>{[...groups.entries()].map(([category, items]) => <section key={category}><span className="eyebrow">{category}</span><div className="skills-strip" style={{ marginTop: 17 }}>{items.map((skill) => <article className="value-card" key={skill.id} style={{ minWidth: 220, flex: "1 1 220px" }}><h3>{text(skill.nameFr, skill.nameEn)}</h3>{(skill.descriptionFr || skill.descriptionEn) && <p>{text(skill.descriptionFr ?? "", skill.descriptionEn ?? "")}</p>}</article>)}</div></section>)}</div>}<div className="cta-inline"><div><h3>{text("Une compétence à mobiliser ?", "Need a specific skill?")}</h3><p>{text("Présentez le contexte, nous vous répondrons sur l'approche possible.", "Share your context and we will discuss a possible approach.")}</p></div><Link href="/contact" className="button button-primary">{text("Nous contacter", "Get in touch")} <ArrowUpRight size={15} /></Link></div></section></>;
}
