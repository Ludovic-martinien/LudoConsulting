import type { MediaKind } from "@/lib/media";

export type DeckPreview = "delivery" | "documents" | "vault" | "jobs" | "classroom";

export type DeckProject = {
  code: string;
  name: string;
  logoKind: MediaKind;
  domain: string;
  tagline: string;
  concept: string;
  problem: string;
  solution: string;
  audience: string[];
  features: string[];
  benefits: string[];
  perspective: string;
  maturity: string;
  maturityTone: "concept" | "deployed";
  preview: DeckPreview;
  colors: { primary: string; accent: string; soft: string; ink: string };
};

export const deckProjects: DeckProject[] = [
  {
    code: "hydro-track",
    name: "Hydro-Track",
    logoKind: "logo-hydro-track",
    domain: "Commande & livraison",
    tagline: "L'eau en express chez vous.",
    concept: "Application de commande et de suivi des livraisons d'eau et de boissons, pour les particuliers comme pour les entreprises.",
    problem: "Commandes difficiles à organiser et suivi des livraisons peu lisible.",
    solution: "Commande en ligne, suivi du statut et coordination entre clients, livreurs et administrateurs.",
    audience: ["Particuliers", "Entreprises", "Commerces", "Livreurs et responsables de livraison"],
    features: ["Consultation des produits disponibles", "Commande de produits", "Gestion des commandes", "Suivi du statut des livraisons", "Gestion des livraisons et des livreurs", "Interface d'administration"],
    benefits: ["Parcours de commande simplifié", "Suivi de livraison plus lisible", "Meilleure coordination des opérations"],
    perspective: "Amélioration du suivi des livraisons et de la gestion des commandes.",
    maturity: "Orientation fonctionnelle — fonctionnalités à confirmer",
    maturityTone: "concept",
    preview: "delivery",
    colors: { primary: "#0B3A75", accent: "#E0B24A", soft: "#EAF2FB", ink: "#0A2540" },
  },
  {
    code: "ludoconnect",
    name: "LudoConnect",
    logoKind: "logo-ludoconnect",
    domain: "Documents perdus",
    tagline: "Rapprocher pour mieux restituer.",
    concept: "Application de recherche et de récupération de documents perdus : cartes d'identité, passeports, permis et documents administratifs.",
    problem: "Perte de documents administratifs et absence de canal simple de mise en relation.",
    solution: "Signalement des documents perdus et retrouvés, recherche par catégorie et vérification avant restitution.",
    audience: ["Citoyens", "Étudiants", "Travailleurs", "Structures partenaires de restitution"],
    features: ["Déclaration d'un document perdu", "Signalement d'un document retrouvé", "Recherche par catégorie", "Consultation des signalements", "Notifications de correspondances potentielles", "Vérification de l'identité avant restitution", "Protection des données personnelles"],
    benefits: ["Mise en relation facilitée", "Restitution responsable et vérifiée", "Réduction des difficultés liées à la perte"],
    perspective: "Élargissement du réseau de signalement et renforcement de la vérification des documents.",
    maturity: "Proposition fonctionnelle — à confirmer",
    maturityTone: "concept",
    preview: "documents",
    colors: { primary: "#124E6B", accent: "#F0B94C", soft: "#E9F3F5", ink: "#0C2B38" },
  },
  {
    code: "safegabon",
    name: "SafeGabon",
    logoKind: "logo-safegabon",
    domain: "Cybersécurité personnelle",
    tagline: "Sécurisez ce qui compte.",
    concept: "Coffre-fort numérique pour enregistrer, organiser et retrouver ses identifiants de connexion dans un espace protégé.",
    problem: "Multiplicité des comptes et risque de perte d'accès aux services numériques.",
    solution: "Centralisation des identifiants par catégories, authentification renforcée et chiffrement des données sensibles.",
    audience: ["Particuliers", "Étudiants", "Professionnels", "Entrepreneurs et entreprises"],
    features: ["Coffre-fort numérique d'identifiants", "Organisation par catégories", "Recherche rapide", "Authentification sécurisée", "Chiffrement des données sensibles", "Générateur de mots de passe robustes", "Sauvegarde sécurisée, si prévue"],
    benefits: ["Gestion des identifiants simplifiée", "Moins de risque de perte d'accès", "Sécurité numérique renforcée"],
    perspective: "Renforcement des mécanismes de sécurité et amélioration de l'expérience utilisateur.",
    maturity: "Proposition fonctionnelle — à confirmer",
    maturityTone: "concept",
    preview: "vault",
    colors: { primary: "#12335E", accent: "#0E7A4B", soft: "#EAF1F6", ink: "#0B2440" },
  },
  {
    code: "taf-gab",
    name: "TAF-GAB 2.0",
    logoKind: "logo-taf-gab",
    domain: "Emploi & employabilité",
    tagline: "Connecter les talents aux opportunités.",
    concept: "Plateforme numérique dédiée à l'emploi et à l'employabilité au Gabon, avec CV numérique, vidéo de présentation et badges professionnels.",
    problem: "Accès aux opportunités professionnelles et valorisation des compétences des candidats.",
    solution: "Offres d'emploi, outils de candidature, profil numérique et espace recruteur pour la mise en relation.",
    audience: ["Demandeurs d'emploi", "Jeunes diplômés", "Étudiants en stage", "Entreprises et recruteurs", "Organismes de formation"],
    features: ["Recherche et consultation d'offres", "Création et gestion de CV", "Génération de lettres de motivation", "CV numérique professionnel", "Vidéo de présentation", "Badges professionnels", "Gestion des documents professionnels", "Espace recruteur et mise en relation"],
    benefits: ["Recherche d'emploi plus accessible", "Compétences mieux présentées", "Échanges candidats / recruteurs facilités"],
    perspective: "Enrichissement des outils de candidature et nouvelles possibilités de mise en relation professionnelle.",
    maturity: "Concept — fonctionnalités envisagées",
    maturityTone: "concept",
    preview: "jobs",
    colors: { primary: "#0B2545", accent: "#159947", soft: "#EAF4EE", ink: "#0A1E36" },
  },
  {
    code: "edu-nify",
    name: "Edu-Nify",
    logoKind: "logo-edu-nify",
    domain: "Éducation & apprentissage en ligne",
    tagline: "L'éducation unifiée.",
    concept: "Plateforme éducative numérique pour organiser les activités pédagogiques et favoriser l'apprentissage à distance.",
    problem: "Besoin d'un environnement numérique structuré pour enseigner et apprendre à distance.",
    solution: "Cours en ligne, classes virtuelles, visioconférence, messagerie, partage d'écran et tableau blanc interactif.",
    audience: ["Élèves et étudiants", "Enseignants et formateurs", "Établissements scolaires", "Centres de formation"],
    features: ["Cours en ligne et ressources éducatives", "Classes virtuelles", "Visioconférence", "Messagerie instantanée", "Partage d'écran", "Gestion des participants", "Tableau blanc interactif", "Enregistrement des séances, si autorisé"],
    benefits: ["Apprentissage plus accessible", "Interactions enseignants / apprenants", "Organisation des séances facilitée"],
    perspective: "Consolidation des outils de classe virtuelle et extension des usages pédagogiques.",
    maturity: "Application développée et déployée — état détaillé à confirmer",
    maturityTone: "deployed",
    preview: "classroom",
    colors: { primary: "#1B3FB0", accent: "#6C2BD9", soft: "#EDF0FE", ink: "#121E51" },
  },
];

export const deckComparison = [
  { name: "Hydro-Track", domain: "Livraison", audience: "Clients, entreprises et livreurs", need: "Approvisionnement", solution: "Commande et suivi des livraisons" },
  { name: "LudoConnect", domain: "Documents perdus", audience: "Citoyens et propriétaires de documents", need: "Recherche et récupération", solution: "Signalement et restitution des documents" },
  { name: "SafeGabon", domain: "Cybersécurité personnelle", audience: "Particuliers et professionnels", need: "Gestion des mots de passe", solution: "Coffre-fort numérique sécurisé" },
  { name: "TAF-GAB 2.0", domain: "Emploi et employabilité", audience: "Candidats et recruteurs", need: "Recherche d'emploi et valorisation des compétences", solution: "CV numérique et mise en relation professionnelle" },
  { name: "Edu-Nify", domain: "Éducation numérique", audience: "Apprenants, enseignants et établissements", need: "Apprentissage et enseignement à distance", solution: "Classes virtuelles et cours en ligne" },
];

export const deckNeeds = [
  { name: "Hydro-Track", need: "Simplification des commandes et des livraisons", answer: "Un parcours de commande lisible et un suivi du statut de livraison." },
  { name: "LudoConnect", need: "Réduction des difficultés liées aux documents perdus", answer: "Un canal de signalement et une vérification avant restitution." },
  { name: "SafeGabon", need: "Amélioration de la gestion des identifiants", answer: "Un coffre-fort numérique organisé et protégé." },
  { name: "TAF-GAB 2.0", need: "Recherche d'emploi et valorisation des compétences", answer: "Des outils de candidature et un espace de mise en relation." },
  { name: "Edu-Nify", need: "Enseignement et apprentissage à distance", answer: "Un environnement de classe virtuelle et de ressources pédagogiques." },
];

export const deckNotes = [
  "Le brief mentionne « SateGabon » alors que le logo fourni affiche « SafeGabon ». La présentation suit le logo officiel ; le nom définitif doit être confirmé avant diffusion.",
  "Aucun logo n'a pu être intégré automatiquement : les fichiers joints ne sont pas accessibles depuis le projet. Cinq emplacements réservés sont affichés et les logos officiels peuvent être déposés depuis l'administration.",
  "Le logo LudoConnect ne figurait pas parmi les images transmises ; un emplacement lui est également réservé.",
  "Les fonctionnalités sont présentées comme envisagées, sauf pour Edu-Nify dont la version est déployée : le détail opérationnel de chaque fonction reste à confirmer.",
  "Aucune statistique, aucun partenariat, aucun résultat mesuré et aucune garantie d'emploi ou de certification ne sont affichés.",
];
