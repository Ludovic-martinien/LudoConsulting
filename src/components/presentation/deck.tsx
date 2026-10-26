"use client";

import Link from "next/link";
import { ArrowLeft, Printer, TriangleAlert } from "lucide-react";
import { deckComparison, deckNeeds, deckNotes, deckProjects } from "@/lib/deck";
import type { MediaKind } from "@/lib/media";
import { LogoSlot } from "@/components/presentation/logo-slot";
import { UiPreview } from "@/components/presentation/ui-preview";

type LogoMap = Partial<Record<MediaKind, string>>;
const total = 12;

function Slide({ n, title, children, tone, footer = true }: { n: number; title?: string; children: React.ReactNode; tone?: string; footer?: boolean }) {
  return (
    <section className={`slide${tone ? ` slide-${tone}` : ""}`} aria-label={`Diapositive ${n} sur ${total}`}>
      <div className="slide-inner">
        {title && <div className="slide-head"><span className="slide-eyebrow">{title}</span></div>}
        {children}
      </div>
      {footer && <div className="slide-foot"><span>Ludo_Consulting · Présentation des projets numériques</span><span>{String(n).padStart(2, "0")} / {total}</span></div>}
    </section>
  );
}

export function PresentationDeck({ logos }: { logos: LogoMap }) {
  return (
    <main className="deck-page">
      <div className="deck-toolbar">
        <Link href="/" className="deck-back"><ArrowLeft size={15} /> Retour au site</Link>
        <div className="deck-toolbar-actions">
          <span>Cliquez sur « Exporter en PDF » puis choisissez « Enregistrer au format PDF » avec une orientation paysage.</span>
          <button type="button" className="button button-primary button-small" onClick={() => window.print()}><Printer size={15} /> Exporter en PDF</button>
        </div>
      </div>

      <div className="deck">
        <Slide n={1} footer={false} tone="cover">
          <div className="cover-grid">
            <div className="cover-copy">
              <span className="cover-kicker">Dossier de présentation · {new Date().getFullYear()}</span>
              <h1 className="cover-title">Cinq projets numériques,<br />cinq réponses au quotidien.</h1>
              <p className="cover-sub">Des solutions numériques au service des besoins des utilisateurs et de la transformation digitale.</p>
              <div className="cover-rule" />
              <p className="cover-note">Présentation étendue à Edu-Nify (projet 5). Chaque application conserve son nom, son identité et son positionnement propre : il ne s'agit pas d'une plateforme unique.</p>
            </div>
            <div className="cover-logos">
              {deckProjects.map((project) => (
                <div className="cover-logo" key={project.code} style={{ borderColor: `${project.colors.primary}22` }}>
                  <LogoSlot name={project.name} url={logos[project.logoKind]} size="lg" />
                  <div>
                    <strong>{project.name}</strong>
                    <small>{project.domain}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Slide>

        <Slide n={2} title="Vue d'ensemble · cinq besoins, cinq solutions">
          <h2 className="slide-title">Comprendre les cinq projets en quelques secondes.</h2>
          <div className="overview-grid">
            {deckProjects.map((project) => (
              <article className="overview-card" key={project.code} style={{ borderTopColor: project.colors.primary }}>
                <div className="overview-head">
                  <LogoSlot name={project.name} url={logos[project.logoKind]} size="sm" />
                  <div><strong>{project.name}</strong><small>{project.domain}</small></div>
                </div>
                <p><span>Problème</span>{project.problem}</p>
                <p><span>Solution</span>{project.solution}</p>
              </article>
            ))}
          </div>
          <p className="slide-note">Les fonctionnalités détaillées sont présentées comme envisagées, sauf indication contraire de maturité sur la diapositive du projet.</p>
        </Slide>

        {deckProjects.map((project, index) => (
          <Slide key={project.code} n={3 + index} title={`Projet ${index + 1} · ${project.domain}`}>
            <div className="project-head">
              <LogoSlot name={project.name} url={logos[project.logoKind]} />
              <div className="project-head-copy">
                <h2 className="slide-title">{project.name}</h2>
                <p className="project-tagline">« {project.tagline} »</p>
                <span className={`maturity maturity-${project.maturityTone}`}>{project.maturity}</span>
              </div>
            </div>
            <div className="project-body">
              <div className="project-cols">
                <div>
                  <h3 className="slide-h3">Le concept</h3>
                  <p className="slide-text">{project.concept}</p>
                  <h3 className="slide-h3">Public cible</h3>
                  <ul className="audience-list">
                    {project.audience.map((item) => <li key={item} style={{ background: project.colors.soft, color: project.colors.ink }}>{item}</li>)}
                  </ul>
                  <h3 className="slide-h3">Valeur ajoutée</h3>
                  <ul className="benefit-list">
                    {project.benefits.map((item) => <li key={item}><i style={{ background: project.colors.accent }} />{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="slide-h3">Fonctionnalités envisagées</h3>
                  <ul className="feature-list">
                    {project.features.map((item) => <li key={item}><span className="feature-dot" style={{ borderColor: project.colors.primary }} />{item}</li>)}
                  </ul>
                  <div className="preview-holder">
                    <UiPreview kind={project.preview} colors={project.colors} />
                  </div>
                </div>
              </div>
            </div>
          </Slide>
        ))}

        <Slide n={8} title="Comparaison des cinq projets">
          <h2 className="slide-title">Un même niveau d'exigence, des domaines distincts.</h2>
          <div className="table-wrap">
            <table className="deck-table">
              <thead><tr><th>Application</th><th>Domaine</th><th>Public cible</th><th>Besoin principal</th><th>Solution proposée</th></tr></thead>
              <tbody>
                {deckComparison.map((row) => <tr key={row.name}><td><strong>{row.name}</strong></td><td>{row.domain}</td><td>{row.audience}</td><td>{row.need}</td><td>{row.solution}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="slide-note">Tableau de synthèse : chaque projet conserve son périmètre, son public et sa solution propres.</p>
        </Slide>

        <Slide n={9} title="Les besoins auxquels répondent les projets">
          <h2 className="slide-title">Partir du besoin, pas de la technologie.</h2>
          <div className="needs-list">
            {deckNeeds.map((item, index) => {
              const project = deckProjects[index];
              return (
                <div className="needs-row" key={item.name} style={{ borderLeftColor: project.colors.primary }}>
                  <strong>{item.name}</strong>
                  <span className="needs-question">{item.need}</span>
                  <span className="needs-arrow">→</span>
                  <span className="needs-answer">{item.answer}</span>
                </div>
              );
            })}
          </div>
          <p className="slide-note">Aucune statistique, aucun résultat mesuré et aucune preuve d'impact ne sont avancés dans ce dossier.</p>
        </Slide>

        <Slide n={10} title="Vision et perspectives">
          <h2 className="slide-title">Des évolutions possibles, pas des acquis.</h2>
          <div className="perspectives-grid">
            {deckProjects.map((project) => (
              <article className="perspective-card" key={project.code} style={{ background: project.colors.soft, borderColor: `${project.colors.primary}22` }}>
                <strong style={{ color: project.colors.ink }}>{project.name}</strong>
                <p>{project.perspective}</p>
                <span>Perspective de développement</span>
              </article>
            ))}
          </div>
          <p className="slide-note">Ces pistes sont proposées à titre de perspectives et ne correspondent pas à des fonctionnalités déjà disponibles.</p>
        </Slide>

        <Slide n={11} title="Statut des projets et transparence">
          <h2 className="slide-title">Distinguer clairement l'existant de l'intention.</h2>
          <div className="status-grid">
            <article className="status-card is-deployed">
              <span className="status-badge">Application déployée</span>
              <h3>Edu-Nify</h3>
              <p>Plateforme déjà développée et déployée. Certaines fonctionnalités restent à finaliser : leur état opérationnel détaillé doit être confirmé avant toute communication commerciale.</p>
            </article>
            <article className="status-card">
              <span className="status-badge neutral">Projets en conception</span>
              <h3>Hydro-Track · LudoConnect · SafeGabon · TAF-GAB 2.0</h3>
              <p>Fonctionnalités décrites comme orientation fonctionnelle et propositions à valider. Aucune mise en production n'est affirmée dans ce dossier.</p>
            </article>
          </div>
          <div className="status-checks">
            <span>Aucun chiffre d'utilisateurs</span><span>Aucun partenariat annoncé</span><span>Aucune garantie d'emploi</span><span>Badges non certifiés par défaut</span><span>Données personnelles masquées</span>
          </div>
        </Slide>

        <Slide n={12} title="Conclusion" tone="closing" footer={false}>
          <div className="closing-grid">
            <div>
              <h2 className="closing-title">Le numérique au service des besoins réels.</h2>
              <p className="closing-text">Hydro-Track, LudoConnect, SafeGabon, TAF-GAB 2.0 et Edu-Nify illustrent cinq approches complémentaires de l'innovation numérique. Chaque projet vise à répondre à un besoin précis en proposant une solution pratique, accessible et adaptée à ses utilisateurs.</p>
              <p className="closing-text">À travers ces initiatives, l'ambition est de mettre la technologie au service du quotidien, de la sécurité numérique, de la mobilité des services, de l'éducation et de l'employabilité.</p>
              <p className="closing-text">TAF-GAB 2.0, porté par <strong>Ludo_Consulting</strong>, s'inscrit notamment dans une démarche de valorisation des compétences et de contribution à la transformation numérique au Gabon.</p>
              <p className="closing-slogan">Innover – Développer – Réussir.</p>
            </div>
            <div className="closing-logos">
              {deckProjects.map((project) => (
                <div className="closing-logo" key={project.code}>
                  <LogoSlot name={project.name} url={logos[project.logoKind]} size="md" />
                  <span>{project.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Slide>
      </div>

      <section className="deck-notes" aria-label="Notes de vérification">
        <h2><TriangleAlert size={17} /> Notes de vérification avant diffusion</h2>
        <ul>{deckNotes.map((note) => <li key={note}>{note}</li>)}</ul>
        <p>Pour intégrer les logos officiels et la photo du responsable : espace d'administration → <Link href="/admin/media">Photo &amp; logos</Link>. Les fichiers JPG, PNG ou WebP sont déposés tels quels, sans retouche ni recréation.</p>
      </section>
    </main>
  );
}
