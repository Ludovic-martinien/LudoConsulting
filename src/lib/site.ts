export type Locale = "fr" | "en";

export const siteInfo = {
  name: "Ludo_Consulting",
  slogan: { fr: "Innover – Développer – Réussir.", en: "Innovate – Develop – Succeed." },
  email: "ludo.consulting3@gmail.com",
  phones: ["+241 077 022 306", "+241 062 641 120"],
  phoneLinks: ["+241077022306", "+241062641120"],
  website: "https://ludoconsulting.vercel.app/",
  whatsappCatalog: "https://wa.me/c/24106654235",
  motto: {
    fr: "Votre partenaire pour vos projets numériques, votre formation et votre réussite professionnelle.",
    en: "Your partner for digital projects, learning and professional success.",
  },
};

export const navigation = [
  { href: "/", fr: "Accueil", en: "Home" },
  { href: "/about", fr: "À propos", en: "About" },
  { href: "/services", fr: "Services", en: "Services" },
  { href: "/portfolio", fr: "Réalisations", en: "Work" },
  { href: "/pricing", fr: "Tarifs", en: "Pricing" },
  { href: "/training", fr: "Formations", en: "Training" },
  { href: "/blog", fr: "Journal", en: "Journal" },
  { href: "/contact", fr: "Contact", en: "Contact" },
] as const;

export const serviceIcons = {
  code: "⌘",
  brain: "✳",
  graduation: "↗",
  shield: "◈",
  palette: "✺",
  wrench: "⌁",
  "file-text": "▤",
  megaphone: "↗",
} as const;

export const serviceQuoteMessage = {
  fr: "Les autres prestations sont proposées sur devis, selon la nature du besoin, la complexité du projet et les délais souhaités.",
  en: "Other services are quoted based on the need, project complexity and desired timeframe.",
};

export const projectStatusLabels: Record<string, { fr: string; en: string }> = {
  completed: { fr: "Terminé", en: "Completed" },
  in_progress: { fr: "En développement", en: "In development" },
  prototype: { fr: "Prototype", en: "Prototype" },
  testing: { fr: "En phase de test", en: "In testing" },
  conceptual: { fr: "Projet conceptuel", en: "Concept project" },
  preparation: { fr: "En préparation", en: "In preparation" },
  "to-confirm": { fr: "Statut à confirmer", en: "Status to be confirmed" },
};

export const requestStatuses: Record<string, { fr: string; en: string }> = {
  new: { fr: "Nouveau", en: "New" },
  processing: { fr: "En cours de traitement", en: "In progress" },
  waiting: { fr: "En attente d'informations", en: "Awaiting information" },
  quote_preparation: { fr: "Devis à préparer", en: "Quote to prepare" },
  replied: { fr: "Répondu", en: "Replied" },
  accepted: { fr: "Accepté", en: "Accepted" },
  declined: { fr: "Refusé", en: "Declined" },
  closed: { fr: "Clôturé", en: "Closed" },
};
