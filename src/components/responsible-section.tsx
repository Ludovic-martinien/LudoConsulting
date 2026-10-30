"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { MediaImage } from "@/components/media-image";

export function ResponsibleSection({ photo, fullName, professionalTitle }: { photo: string | null; fullName: string; professionalTitle: string }) {
  const { text } = useLanguage();
  const expertise = [
    text("Développement web et mobile", "Web and mobile development"),
    text("Conception de solutions informatiques", "Software solution design"),
    text("Formation et accompagnement de stagiaires", "Training and intern mentoring"),
    text("Intelligence artificielle et automatisation", "Artificial intelligence and automation"),
  ];
  return (
    <section className="section responsible-section">
      <div className="section-inner responsible-grid">
        <div className="responsible-media">
          <figure className="responsible-portrait">
            <MediaImage
              src={photo || "/images/profil/responsable.webp"}
              alt={text(`Portrait de ${fullName}, responsable de Ludo_Consulting`, `Portrait of ${fullName}, Ludo_Consulting's lead`)}
              loading="eager"
              decoding="async"
            />
          </figure>
          <span className="responsible-caption">{text("Le responsable", "The lead")}</span>
        </div>
        <div className="responsible-copy">
          <span className="eyebrow">{text("Derrière Ludo_Consulting", "Behind Ludo_Consulting")}</span>
          <h2 className="section-title">{text("Une expertise technique, une culture de la transmission.", "Technical expertise with a culture of sharing.")}</h2>
          <p className="responsible-name">{fullName}</p>
          <p className="responsible-role">{text(professionalTitle, "Web and mobile developer · Software solution designer")}</p>
          <p className="responsible-bio">{text("Également connu sous les noms de Dev / Lichtensteiner, il accompagne la conception de projets numériques, la coordination d'équipes et l'enseignement de la programmation. Sa démarche associe exigence technique, pédagogie et transmission.", "Also known as Dev / Lichtensteiner, he supports digital project design, team coordination and programming instruction. His approach combines technical rigour, pedagogy and knowledge sharing.")}</p>
          <ul className="responsible-list">
            {expertise.map((item) => <li key={item}><BadgeCheck size={15} /> {item}</li>)}
          </ul>
          <div className="responsible-actions">
            <Link href="/about" className="button button-primary button-small">{text("Découvrir le parcours", "Discover the profile")} <ArrowUpRight size={14} /></Link>
            <Link href="/contact" className="text-link">{text("Prendre contact", "Get in touch")} <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
