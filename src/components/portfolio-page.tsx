"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/content-cards";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";
import { projectStatusLabels } from "@/lib/site";

type Project = { titleFr: string; titleEn: string; slug: string; shortDescriptionFr: string; shortDescriptionEn: string; status: string; technologies: string[]; categoryFr: string; categoryEn: string; coverImageUrl: string | null };
export function PortfolioPage({ projects }: { projects: Project[] }) {
  const { text } = useLanguage();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => [...new Set(projects.map((project) => text(project.categoryFr, project.categoryEn)))], [projects, text]);
  const statuses = useMemo(() => [...new Set(projects.map((project) => project.status))], [projects]);
  const filtered = projects.filter((project) => {
    const categoryName = text(project.categoryFr, project.categoryEn);
    const title = text(project.titleFr, project.titleEn);
    const description = text(project.shortDescriptionFr, project.shortDescriptionEn);
    return (category === "all" || category === categoryName) && (status === "all" || status === project.status) && `${title} ${description} ${project.technologies.join(" ")}`.toLowerCase().includes(query.toLowerCase());
  });
  return <><PageHero eyebrowFr="Portfolio" eyebrowEn="Portfolio" titleFr="Des projets numériques, avec leur statut réel." titleEn="Digital projects, with their actual status." descriptionFr="Découvrez les projets connus et les technologies associées. Les éléments dont l'état n'est pas confirmé sont explicitement signalés." descriptionEn="Explore known projects and their associated technologies. Items whose status is unconfirmed are clearly labelled." /><section className="page-content"><div className="filter-row"><button className={`filter-chip${category === "all" ? " is-active" : ""}`} type="button" onClick={() => setCategory("all")}>{text("Toutes les catégories", "All categories")}</button>{categories.map((item) => <button key={item} className={`filter-chip${category === item ? " is-active" : ""}`} type="button" onClick={() => setCategory(item)}>{item}</button>)}</div><div className="filter-row"><button className={`filter-chip${status === "all" ? " is-active" : ""}`} type="button" onClick={() => setStatus("all")}>{text("Tous les statuts", "All statuses")}</button>{statuses.map((item) => <button key={item} className={`filter-chip${status === item ? " is-active" : ""}`} type="button" onClick={() => setStatus(item)}>{text(projectStatusLabels[item]?.fr ?? "À confirmer", projectStatusLabels[item]?.en ?? "To confirm")}</button>)}<label className="hidden-field" htmlFor="portfolio-search">{text("Rechercher un projet", "Search projects")}</label><input id="portfolio-search" className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text("Rechercher un projet ou une technologie…", "Search projects or technologies…")} /></div>{filtered.length ? <div className="projects-grid">{filtered.map((project) => <ProjectCard key={project.slug} project={project} />)}</div> : <div className="empty-state"><h3>{text("Aucun projet correspondant.", "No matching projects.")}</h3><p>{text("Essayez de modifier le filtre ou la recherche.", "Try changing your filters or search.")}</p></div>}<div className="portfolio-deck-link"><div><strong>{text("Dossier de présentation des projets", "Project presentation deck")}</strong><p>{text("Hydro-Track, LudoConnect, SafeGabon, TAF-GAB 2.0 et Edu-Nify : vision, publics, fonctionnalités envisagées et perspectives.", "Hydro-Track, LudoConnect, SafeGabon, TAF-GAB 2.0 and Edu-Nify: vision, audiences, planned features and perspectives.")}</p></div><a href="/presentation" className="button button-primary button-small">{text("Ouvrir la présentation", "Open the presentation")}</a><a href="/cahiers-des-charges" className="button button-outline-dark button-small">{text("Cahiers des charges", "Specifications")}</a></div><p className="form-disclaimer" style={{ marginTop: 26 }}>{text("Aucun lien de démonstration ni dépôt n'est affiché s'il n'a pas été confirmé. Les aperçus graphiques sont des illustrations de présentation, pas des captures d'écran du produit.", "No demo or repository link is shown unless confirmed. The visual previews are presentation illustrations, not product screenshots.")}</p></section></>;
}
