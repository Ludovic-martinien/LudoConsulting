"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, Code2, GraduationCap, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { siteInfo, serviceQuoteMessage } from "@/lib/site";
import { ProjectCard, ServiceCard } from "@/components/content-cards";
import { ResponsibleSection } from "@/components/responsible-section";
import { MediaImage } from "@/components/media-image";
import { MemberOnly, openAuth } from "@/components/member-auth";

type HomeService = { titleFr: string; titleEn: string; descriptionFr: string; descriptionEn: string; slug: string; icon: string; priceLabelFr: string; priceLabelEn: string };
type HomeProject = { titleFr: string; titleEn: string; slug: string; shortDescriptionFr: string; shortDescriptionEn: string; status: string; technologies: string[]; categoryFr: string; categoryEn: string; coverImageUrl: string | null };
type HomeSkill = { nameFr: string; nameEn: string };

const processSteps = [
  { fr: "Compréhension du besoin", en: "Understanding your needs", copyFr: "Nous prenons le temps d'écouter votre contexte et vos objectifs.", copyEn: "We take time to understand your context and goals." },
  { fr: "Analyse & proposition", en: "Analysis & proposal", copyFr: "Une réponse adaptée au périmètre, aux priorités et aux délais.", copyEn: "A proposal shaped around the scope, priorities and timeline." },
  { fr: "Planification", en: "Planning", copyFr: "Les étapes, livrables et points de validation sont clarifiés.", copyEn: "Milestones, deliverables and review points are made clear." },
  { fr: "Conception & développement", en: "Design & development", copyFr: "Nous construisons la solution avec un suivi régulier.", copyEn: "We build the solution with regular progress updates." },
  { fr: "Tests & validation", en: "Testing & review", copyFr: "Les éléments réalisés sont vérifiés avec vous.", copyEn: "We review the completed work together." },
  { fr: "Livraison", en: "Delivery", copyFr: "La livraison intervient après validation des éléments convenus.", copyEn: "Delivery follows approval of the agreed work." },
  { fr: "Assistance & évolution", en: "Support & evolution", copyFr: "Selon le contrat, nous pouvons vous accompagner dans la suite.", copyEn: "Further support can be arranged according to the agreement." },
];

export function HomePage({ services, projects, skills, profilePhoto, profileName, profileTitle }: { services: HomeService[]; projects: HomeProject[]; skills: HomeSkill[]; profilePhoto: string | null; profileName: string; profileTitle: string }) {
  const { text, locale } = useLanguage();
  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{text("Technologies · Création · Apprentissage", "Technology · Creativity · Learning")}</span>
            <h1>{locale === "fr" ? <>Le numérique, <em>au service</em> de vos ambitions.</> : <>Digital, in service of <em>your ambitions.</em></>}</h1>
            <p className="hero-lede">{text("Nous accompagnons les entreprises, les entrepreneurs, les étudiants et les particuliers dans leurs projets numériques grâce au développement informatique, à l'intelligence artificielle, à la formation et aux solutions digitales sur mesure.", "We support businesses, entrepreneurs, students and individuals with digital projects through software development, artificial intelligence, training and tailored digital solutions.")}</p>
            <div className="hero-actions"><Link href="/services" className="button button-primary">{text("Découvrir nos services", "Explore our services")} <ArrowUpRight size={16} /></Link><Link href="/portfolio" className="button button-outline">{text("Voir nos réalisations", "View our work")} <ArrowRight size={15} /></Link></div>
            <div className="hero-note"><i>↗</i>{text("Un échange clair, une solution pensée pour votre besoin.", "Clear conversations, solutions shaped around your needs.")}</div>
          </div>
          <div className="hero-art" aria-label={text("Portrait de M. Mve Zogo Martinien Ludovic, responsable de Ludo_Consulting", "Portrait of M. Mve Zogo Martinien Ludovic, Ludo_Consulting's lead")}>
            <div className="orbit orbit-two" /><div className="orbit" /><div className="orbit orbit-three" />
            <div className="hero-portrait-card">
              <MediaImage
                src={profilePhoto || "/images/profil/responsable.webp"}
                alt={text(`Portrait de ${profileName}, responsable de Ludo_Consulting`, `Portrait of ${profileName}, Ludo_Consulting's lead`)}
                className="hero-portrait-img"
                loading="eager"
                decoding="async"
              />
              <div className="hero-portrait-badge">
                <span className="hero-portrait-status" />
                <div>
                  <strong>{profileName}</strong>
                  <span>{text("Responsable Ludo_Consulting · Dev / Lichtensteiner", "Ludo_Consulting Lead · Dev / Lichtensteiner")}</span>
                </div>
              </div>
            </div>
            <div className="hero-badge badge-one"><span className="badge-icon"><Code2 size={14} /></span><strong>{text("Développement", "Development")}</strong><span>{text("Des outils faits pour vous", "Tools made for you")}</span></div>
            <div className="hero-badge badge-two"><span className="badge-icon"><Bot size={14} /></span><strong>{text("Intelligence artificielle", "Artificial intelligence")}</strong><span>{text("Apprendre · automatiser", "Learn · automate")}</span></div>
            <div className="hero-badge badge-three"><span className="badge-icon"><GraduationCap size={14} /></span><strong>{text("Formation", "Training")}</strong><span>{text("À votre rythme", "At your pace")}</span></div>
          </div>
        </div>
        <div className="hero-bottom"><strong>{text(siteInfo.slogan.fr, siteInfo.slogan.en)}</strong><div className="hero-bottom-tags"><span>{text("Solutions sur mesure", "Tailored solutions")}</span><span>{text("Accompagnement", "Guidance")}</span><span>{text("Formation", "Training")}</span></div></div>
      </section>

      <section className="section"><div className="section-inner intro-grid"><div><span className="eyebrow">{text("À propos de Ludo_Consulting", "About Ludo_Consulting")}</span><h2 className="section-title">{text("Un partenaire numérique, du premier échange à la mise en œuvre.", "A digital partner, from the first conversation to delivery.")}</h2><p className="section-copy">{text("Nous aidons chacun à transformer une idée en solution utile, à développer ses compétences et à mieux utiliser le numérique au quotidien.", "We help turn ideas into useful solutions, grow practical skills and make better use of digital tools every day.")}</p><div style={{ marginTop: 24 }}><Link className="text-link" href="/about">{text("En savoir plus sur notre approche", "Learn more about our approach")} <ArrowRight size={15} /></Link></div></div><div className="intro-side"><div className="intro-quote">{text("« Une technologie réussie est d’abord une technologie qui répond à un vrai besoin. »", "“Technology works best when it solves a real need.”")}<small>{text("Notre manière de travailler", "How we work")}</small></div><div className="intro-stats"><div className="intro-stat"><strong>{services.length.toString().padStart(2, "0")}</strong><span>{text("domaines de services", "service areas")}</span></div><div className="intro-stat"><strong>FR / EN</strong><span>{text("une expérience bilingue", "a bilingual experience")}</span></div><div className="intro-stat"><strong>{projects.length.toString().padStart(2, "0")}</strong><span>{text("projets présentés", "projects presented")}</span></div></div></div></div></section>

      <ResponsibleSection photo={profilePhoto} fullName={profileName} professionalTitle={profileTitle} />

      <section className="section services-section"><div className="section-inner"><div className="section-heading"><span className="eyebrow">{text("Ce que nous faisons", "What we do")}</span><h2 className="section-title">{text("Des services concrets pour avancer dans le numérique.", "Practical services to move forward with digital.")}</h2><p className="section-copy">{text("Du développement à la formation, nous vous aidons à choisir la bonne prochaine étape.", "From development to training, we help you choose the right next step.")}</p></div><div className="services-grid">{services.map((service) => <ServiceCard key={service.slug} service={service} />)}</div><div className="services-bottom"><p className="price-disclaimer">{text(serviceQuoteMessage.fr, serviceQuoteMessage.en)}</p><Link href="/pricing" className="text-link">{text("Consulter les tarifs", "See pricing")} <ArrowRight size={15} /></Link></div></div></section>

      <section className="section project-section"><div className="section-inner"><div className="section-heading"><span className="eyebrow">{text("Projets & réalisations", "Projects & work")}</span><h2 className="section-title">{text("Des idées numériques, présentées avec transparence.", "Digital ideas, presented transparently.")}</h2><p className="section-copy">{text("Les statuts affichés reflètent les informations disponibles. Les fonctionnalités dont la disponibilité n'est pas confirmée sont signalées comme envisagées.", "Statuses reflect the information currently available. Features whose availability is unconfirmed are labelled as planned.")}</p></div><div className="projects-grid projects-grid-three">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div><div style={{ marginTop: 27 }}><Link className="text-link" href="/portfolio">{text("Voir le portfolio", "View portfolio")} <ArrowRight size={15} /></Link></div></div></section>

      <section className="section process-section"><div className="section-inner"><div className="section-heading"><span className="eyebrow">{text("Une collaboration claire", "A clear collaboration")}</span><h2 className="section-title">{text("Du besoin à la solution, avec méthode.", "From need to solution, with a clear process.")}</h2><p className="section-copy">{text("Chaque collaboration est définie selon le projet et les modalités convenues.", "Every collaboration is shaped around the project and agreed terms.")}</p></div><div className="process-grid">{processSteps.map((step) => <article className="process-step" key={step.fr}><h3>{text(step.fr, step.en)}</h3><p>{text(step.copyFr, step.copyEn)}</p></article>)}</div></div></section>

      <section className="section" style={{ paddingBottom: 80 }}><div className="section-inner"><div className="section-heading"><span className="eyebrow">{text("Expertises", "Expertise")}</span><h2 className="section-title">{text("Des savoir-faire au croisement des outils et des usages.", "Skills where tools meet real-world use.")}</h2></div><div className="skills-strip">{skills.map((skill) => <span className="skill-chip" key={skill.nameFr}>{text(skill.nameFr, skill.nameEn)}</span>)}</div><div style={{ marginTop: 24 }}><Link className="text-link" href="/skills">{text("Découvrir les compétences", "Explore skills")} <ArrowRight size={15} /></Link></div></div></section>

      <section className="member-band"><div className="member-inner"><div><span className="eyebrow">{text("Espace membre", "Member area")}</span><h2>{text("Créez votre compte en une minute.", "Create your account in one minute.")}</h2><p>{text("Inscrivez-vous avec Google ou votre e-mail pour suivre vos demandes de devis et rester en contact avec Ludo_Consulting.", "Sign up with Google or your email to track your quote requests and stay in touch with Ludo_Consulting.")}</p></div><div className="member-actions"><button type="button" className="button button-primary" onClick={() => openAuth("signup")}>{text("Créer un compte", "Create an account")} <ArrowUpRight size={16} /></button><button type="button" className="button button-outline" onClick={() => openAuth("login")}>{text("Se connecter", "Sign in")}</button></div></div></section>

      <section className="cta-band"><div className="cta-inner"><div><span className="eyebrow">{text("Parlons de votre projet", "Let's talk about your project")}</span><h2>{text("Vous avez une idée ? Construisons la suite ensemble.", "Have an idea? Let's build what comes next.")}</h2><p>{text("Présentez-nous votre besoin. Nous prendrons le temps d'en discuter et de proposer une approche adaptée.", "Tell us what you need. We will take time to discuss it and suggest an approach that fits.")}</p></div><Link href="/quote" className="button">{text("Démarrer un projet", "Start a project")} <ArrowUpRight size={16} /></Link></div></section>
      <MemberOnly><a className="floating-whatsapp" href={siteInfo.whatsappCatalog} aria-label={text("Ouvrir le catalogue WhatsApp de Ludo_Consulting", "Open the Ludo_Consulting WhatsApp catalogue")} target="_blank" rel="noreferrer"><MessageCircle size={21} /><span>{text("Catalogue WhatsApp", "WhatsApp catalogue")}</span></a></MemberOnly>
    </main>
  );
}
