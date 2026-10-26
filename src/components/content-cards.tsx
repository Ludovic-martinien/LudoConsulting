"use client";

import Link from "next/link";
import { ArrowRight, Brain, Code2, FileText, GraduationCap, Megaphone, Palette, ShieldCheck, Wrench } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { projectStatusLabels } from "@/lib/site";
import { MediaImage } from "@/components/media-image";

const iconMap = { code: Code2, brain: Brain, graduation: GraduationCap, shield: ShieldCheck, palette: Palette, wrench: Wrench, "file-text": FileText, megaphone: Megaphone };

type ServiceCardData = { titleFr: string; titleEn: string; descriptionFr: string; descriptionEn: string; slug: string; icon: string; priceLabelFr: string; priceLabelEn: string };
export function ServiceCard({ service }: { service: ServiceCardData }) {
  const { text } = useLanguage();
  const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Code2;
  return (
    <Link href={`/services/${service.slug}`} className="service-card">
      <span className="service-icon"><Icon size={20} strokeWidth={1.8} /></span>
      <h3>{text(service.titleFr, service.titleEn)}</h3>
      <p>{text(service.descriptionFr, service.descriptionEn)}</p>
      <span className="service-card-bottom"><span className="service-price">{text(service.priceLabelFr, service.priceLabelEn)}</span><span className="service-arrow"><ArrowRight size={14} /></span></span>
    </Link>
  );
}

type ProjectCardData = { titleFr: string; titleEn: string; slug: string; shortDescriptionFr: string; shortDescriptionEn: string; status: string; technologies: string[]; categoryFr?: string; categoryEn?: string; coverImageUrl?: string | null };
export function ProjectCard({ project }: { project: ProjectCardData }) {
  const { text } = useLanguage();
  const status = projectStatusLabels[project.status] ?? projectStatusLabels["to-confirm"];
  const education = project.slug === "edu-nify";
  return (
    <Link href={`/portfolio/${project.slug}`} className="project-card">
      <div className={`project-art ${education ? "education" : "business"}${project.coverImageUrl ? " has-image" : ""}`} aria-hidden={project.coverImageUrl ? undefined : true}>
        {project.coverImageUrl ? <MediaImage src={project.coverImageUrl} alt="" loading="lazy" decoding="async" className="project-cover-image" /> : <div className="mock-window">
          <div className="mock-topbar"><i /><i /><i /><span /></div>
          <div className="mock-body"><div className="mock-sidebar"><div className="mock-logo" /><div className="mock-line" /><div className="mock-line" /><div className="mock-line" /></div><div className="mock-main"><div className="mock-title" /><div className="mock-subtitle" /><div className="mock-card-row"><i className="mock-mini-card" /><i className="mock-mini-card" /><i className="mock-mini-card" /></div><div className="mock-chart" /></div></div>
        </div>}
        <span className="project-badge">{project.coverImageUrl ? text("Aperçu de la maquette", "Mockup preview") : text("Aperçu de concept", "Concept preview")}</span>
      </div>
      <div className="project-content">
        <div className="project-meta"><span>{text(project.categoryFr ?? "Projet numérique", project.categoryEn ?? "Digital project")}</span><span className="status-pill">{text(status.fr, status.en)}</span></div>
        <h3>{text(project.titleFr, project.titleEn)}</h3>
        <p>{text(project.shortDescriptionFr, project.shortDescriptionEn)}</p>
        <div className="tech-tags">{project.technologies.slice(0, 5).map((technology) => <span className="tech-tag" key={technology}>{technology}</span>)}</div>
        <div className="project-link"><span>{text("Découvrir le projet", "Explore project")}</span><ArrowRight size={16} /></div>
      </div>
    </Link>
  );
}
