import { db } from "@/db";
import {
  adminUsers,
  articleCategories,
  projectCategories,
  projectTechnologies,
  projects,
  profiles,
  serviceItems,
  servicePackages,
  servicePrices,
  services,
  siteSettings,
  skills,
  socialLinks,
  technologies,
} from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { ensureMigrations } from "@/lib/migrate";

const serviceSeed = [
  {
    slug: "developpement-informatique",
    titleFr: "Développement informatique",
    titleEn: "Software development",
    descriptionFr: "Des solutions numériques sur mesure, pensées pour répondre à vos objectifs et accompagner la croissance de votre activité.",
    descriptionEn: "Custom digital solutions designed around your goals and built to support your business growth.",
    icon: "code",
    priceType: "quote",
    items: [
      ["Création de sites web professionnels et de boutiques en ligne", "Professional websites and online stores"],
      ["Développement d'applications web et mobiles", "Web and mobile application development"],
      ["Conception de logiciels de gestion commerciale et de facturation", "Business management and invoicing software"],
      ["Création et gestion de bases de données", "Database design and management"],
      ["Intégration d'API et solutions numériques sur mesure", "API integration and bespoke digital solutions"],
    ],
  },
  {
    slug: "intelligence-artificielle",
    titleFr: "Intelligence artificielle",
    titleEn: "Artificial intelligence",
    descriptionFr: "Découvrez les outils d'IA et apprenez à les intégrer de façon concrète, responsable et utile à votre quotidien professionnel.",
    descriptionEn: "Explore AI tools and learn to use them in practical, responsible ways that support your daily work.",
    icon: "brain",
    priceType: "quote",
    items: [
      ["Formation à ChatGPT, Gemini, Claude et Perplexity", "Training with ChatGPT, Gemini, Claude and Perplexity"],
      ["Création et optimisation de prompts professionnels", "Professional prompt creation and refinement"],
      ["Vibe coding : création d'applications et de sites avec l'aide de l'IA", "Vibe coding: building apps and websites with AI assistance"],
      ["Automatisation des tâches professionnelles", "Professional task automation"],
      ["Génération de textes, d'images et de contenus numériques", "Text, image and digital content generation"],
      ["Initiation aux agents IA et aux chatbots", "Introduction to AI agents and chatbots"],
      ["Accompagnement dans l'utilisation des outils d'intelligence artificielle", "Guidance on using artificial intelligence tools"],
    ],
  },
  {
    slug: "formation-informatique",
    titleFr: "Formation informatique & bureautique",
    titleEn: "IT & office skills training",
    descriptionFr: "Des formations pratiques et un accompagnement adapté pour développer vos compétences numériques, à votre rythme.",
    descriptionEn: "Practical training and tailored support to grow your digital skills at your own pace.",
    icon: "graduation",
    priceType: "packages",
    items: [
      ["Initiation à l'informatique et aux outils numériques", "Introduction to computers and digital tools"],
      ["Formation en Microsoft Word, Excel et PowerPoint", "Microsoft Word, Excel and PowerPoint training"],
      ["Formation en programmation et développement web", "Programming and web development training"],
      ["Formation pratique en infographie et création numérique", "Hands-on graphic design and digital creation training"],
      ["Formation aux outils d'intelligence artificielle", "Artificial intelligence tools training"],
      ["Accompagnement personnalisé et perfectionnement informatique", "Personalised support and IT skills development"],
    ],
  },
  {
    slug: "cybersecurite-reseaux",
    titleFr: "Cybersécurité & réseaux",
    titleEn: "Cybersecurity & networking",
    descriptionFr: "Sensibilisez vos équipes, protégez vos informations et améliorez la configuration de vos réseaux selon votre contexte.",
    descriptionEn: "Build awareness, protect your information and improve network configuration for your specific context.",
    icon: "shield",
    priceType: "starting",
    basePrice: 120000,
    items: [
      ["Formation en cybersécurité et protection des données", "Cybersecurity and data protection training"],
      ["Administration et sécurisation des réseaux d'entreprise", "Business network administration and security"],
      ["Configuration et assistance réseau", "Network configuration and support"],
      ["Sensibilisation aux virus et logiciels malveillants", "Awareness of viruses and malicious software"],
      ["Protection des comptes et des informations professionnelles", "Protection of accounts and business information"],
      ["Conseils en sécurité informatique", "IT security advice"],
    ],
  },
  {
    slug: "infographie-identite-visuelle",
    titleFr: "Infographie & identité visuelle",
    titleEn: "Graphic design & visual identity",
    descriptionFr: "Des supports visuels cohérents pour affirmer votre image et mieux communiquer auprès de vos clients.",
    descriptionEn: "Consistent visual assets to strengthen your identity and communicate more clearly with your audience.",
    icon: "palette",
    priceType: "quote",
    items: [
      ["Création de logos professionnels", "Professional logo design"],
      ["Conception de cartes de visite et de badges professionnels", "Business cards and professional badges"],
      ["Création d'affiches publicitaires et de flyers", "Advertising posters and flyers"],
      ["Conception de catalogues et de supports de communication", "Catalogues and communication materials"],
      ["Création de visuels pour les réseaux sociaux", "Social media visuals"],
      ["Conception d'identités visuelles pour entreprises et particuliers", "Visual identities for businesses and individuals"],
      ["Retouche et amélioration d'images", "Image retouching and enhancement"],
    ],
  },
  {
    slug: "maintenance-assistance-informatique",
    titleFr: "Maintenance & assistance informatique",
    titleEn: "IT maintenance & support",
    descriptionFr: "Un accompagnement pour diagnostiquer les incidents, maintenir vos équipements et retrouver un environnement de travail fiable.",
    descriptionEn: "Support to diagnose issues, maintain your equipment and restore a dependable working environment.",
    icon: "wrench",
    priceType: "quote",
    items: [
      ["Diagnostic et dépannage informatique", "IT diagnostics and troubleshooting"],
      ["Maintenance préventive et corrective", "Preventive and corrective maintenance"],
      ["Installation et configuration de logiciels", "Software installation and configuration"],
      ["Optimisation des performances des ordinateurs", "Computer performance optimisation"],
      ["Assistance technique et résolution de problèmes logiciels", "Technical support and software problem solving"],
      ["Conseils et accompagnement informatique", "IT advice and guidance"],
    ],
  },
  {
    slug: "documents-professionnels-academiques",
    titleFr: "Documents professionnels & services académiques",
    titleEn: "Professional documents & academic support",
    descriptionFr: "Un appui méthodologique, éditorial et de mise en forme pour vos documents professionnels et académiques, dans le respect des règles applicables.",
    descriptionEn: "Methodological, editorial and formatting support for professional and academic documents, in line with applicable rules.",
    icon: "file-text",
    priceType: "structured",
    items: [
      ["Création et amélioration de CV professionnels", "Professional CV creation and improvement"],
      ["Rédaction de lettres de motivation", "Cover letter writing"],
      ["Préparation de dossiers de candidature", "Application file preparation"],
      ["Correction de mémoires de Licence, de Master et de thèses", "Proofreading of Bachelor's, Master's and doctoral dissertations"],
      ["Mise en forme académique et professionnelle des documents", "Academic and professional document formatting"],
      ["Accompagnement méthodologique et préparation aux soutenances", "Methodological guidance and presentation preparation"],
    ],
  },
  {
    slug: "communication-numerique",
    titleFr: "Communication numérique & accompagnement digital",
    titleEn: "Digital communication & consulting",
    descriptionFr: "Faites évoluer votre présence en ligne et donnez à votre activité les bons outils pour mieux présenter son offre.",
    descriptionEn: "Strengthen your online presence and give your business the right tools to present its offer more effectively.",
    icon: "megaphone",
    priceType: "quote",
    items: [
      ["Création de pages professionnelles Facebook", "Professional Facebook page creation"],
      ["Conception de contenus pour promouvoir une activité", "Content creation to promote a business"],
      ["Création de supports de communication numérique", "Digital communication material creation"],
      ["Accompagnement digital des entreprises et des entrepreneurs", "Digital guidance for businesses and entrepreneurs"],
      ["Conseils en outils numériques et transformation digitale", "Digital tools and transformation advice"],
    ],
  },
];

const projectCategorySeed = [
  ["Applications web", "Web applications", "applications-web"],
  ["Applications mobiles", "Mobile applications", "applications-mobiles"],
  ["Logiciels de gestion", "Management software", "logiciels-gestion"],
  ["Plateformes éducatives", "Educational platforms", "plateformes-educatives"],
  ["Projets d'intelligence artificielle", "Artificial intelligence projects", "projets-ia"],
  ["Sites web professionnels", "Professional websites", "sites-web"],
  ["Projets pédagogiques", "Learning projects", "projets-pedagogiques"],
  ["Création graphique et communication numérique", "Graphic design and digital communication", "creation-graphique"],
  ["Autres solutions numériques", "Other digital solutions", "autres-solutions"],
];

const feature = (fr: string, en: string) => ({ fr, en, state: "planned" as const });

const edulinkSeed = {
  titleFr: "EduLink",
  titleEn: "EduLink",
  slug: "edulink",
  shortDescriptionFr: "Application web de cours de soutien en ligne, pensée pour relier les élèves et étudiants à des enseignants, des ressources et des parcours d'apprentissage.",
  shortDescriptionEn: "A web application for online tutoring, designed to connect learners with teachers, resources and learning paths.",
  descriptionFr: "EduLink est un projet d'application web de soutien en ligne. L'aperçu présente une expérience de recherche de cours, de consultation de ressources et de suivi des apprentissages. Le projet est réalisable ; la maquette est fournie à titre de présentation et les fonctionnalités comme la stack technique (React, Next.js, TypeScript, Tailwind CSS) restent à valider avant le développement.",
  descriptionEn: "EduLink is an online tutoring web application project. The preview shows an experience for finding courses, browsing resources and tracking learning progress. The project is feasible; the mockup is a presentation concept, and both features and the proposed stack (React, Next.js, TypeScript, Tailwind CSS) remain to be validated before development.",
  objectives: [
    { fr: "Faciliter l'accès à des cours de soutien en ligne.", en: "Make online tutoring courses easier to access." },
    { fr: "Offrir un espace clair pour organiser les séances et suivre les progrès.", en: "Provide a clear space to organise sessions and track progress." },
  ],
  features: [
    feature("Recherche de cours et d'enseignants par matière", "Course and teacher search by subject"),
    feature("Espace étudiant et ressources pédagogiques", "Student space and learning resources"),
    feature("Planning et réservation des séances de soutien", "Tutoring session planning and booking"),
    feature("Suivi de la progression et des objectifs", "Progress and learning goal tracking"),
    feature("Notifications et rappels de cours", "Lesson notifications and reminders"),
  ],
  status: "conceptual",
  role: "Conception produit, identité visuelle et maquette de l'application. Développement à planifier.",
  mainImageUrl: "/images/edulink-preview.webp",
  technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  displayOrder: 3,
  isPublished: true,
};

export async function ensureSeedData() {
  await ensureMigrations();
  await db.transaction(async (tx) => {
    const [marker] = await tx.insert(siteSettings)
      .values({ key: "seed-v1", value: true })
      .onConflictDoNothing()
      .returning({ key: siteSettings.key });
    if (!marker) return;

    await tx.insert(profiles).values({
      fullName: "M. Mve Zogo Martinien Ludovic",
      professionalTitle: "Développeur web et mobile · Concepteur de solutions informatiques",
      biographyFr: "Ludo_Consulting accompagne les entreprises, les entrepreneurs, les étudiants et les particuliers dans leurs projets numériques, leur formation et leur réussite professionnelle. Son approche associe développement informatique, accompagnement digital, création et apprentissage continu.",
      biographyEn: "Ludo_Consulting supports businesses, entrepreneurs, students and individuals with digital projects, training and professional development. Its approach brings together software development, digital guidance, creative work and continuous learning.",
      email: "ludo.consulting3@gmail.com",
      phonePrimary: "+241 077 022 306",
      phoneSecondary: "+241 062 641 120",
      website: "https://ludoconsulting.vercel.app/",
      whatsappCatalog: "https://wa.me/c/24106654235",
    }).onConflictDoNothing();

    await tx.insert(services).values(serviceSeed.map((service, index) => ({
      titleFr: service.titleFr,
      titleEn: service.titleEn,
      slug: service.slug,
      descriptionFr: service.descriptionFr,
      descriptionEn: service.descriptionEn,
      icon: service.icon,
      priceType: service.priceType,
      basePrice: "basePrice" in service ? service.basePrice : null,
      currency: "FCFA",
      displayOrder: index + 1,
      isPublished: true,
    }))).onConflictDoNothing();

    const insertedServices = await tx.select({ id: services.id, slug: services.slug }).from(services);
    const serviceIds = new Map(insertedServices.map((service) => [service.slug, service.id]));
    const itemRows = serviceSeed.flatMap((service) => {
      const id = serviceIds.get(service.slug);
      if (!id) return [];
      return service.items.map(([titleFr, titleEn], index) => ({
        serviceId: id,
        titleFr,
        titleEn,
        displayOrder: index + 1,
        isActive: true,
      }));
    });
    await tx.insert(serviceItems).values(itemRows).onConflictDoNothing();

    const trainingId = serviceIds.get("formation-informatique");
    if (trainingId) {
      await tx.insert(servicePackages).values([
        { serviceId: trainingId, nameFr: "Formule Standard", nameEn: "Standard plan", price: 35000, currency: "FCFA", descriptionFr: "", descriptionEn: "", featuresFr: [], featuresEn: [], displayOrder: 1, isPublished: true },
        { serviceId: trainingId, nameFr: "Formule Premium", nameEn: "Premium plan", price: 65000, currency: "FCFA", descriptionFr: "", descriptionEn: "", featuresFr: [], featuresEn: [], displayOrder: 2, isPublished: true },
      ]).onConflictDoNothing();
    }

    const academicId = serviceIds.get("documents-professionnels-academiques");
    if (academicId) {
      await tx.insert(servicePrices).values([
        { serviceId: academicId, labelFr: "Correction de mémoire de Licence", labelEn: "Bachelor's dissertation proofreading", price: 25000, priceType: "starting", displayOrder: 1 },
        { serviceId: academicId, labelFr: "Correction de mémoire de Master", labelEn: "Master's dissertation proofreading", price: 35000, priceType: "starting", displayOrder: 2 },
        { serviceId: academicId, labelFr: "Pack correction et mise en forme Master", labelEn: "Master's proofreading and formatting package", price: 45000, priceType: "starting", displayOrder: 3 },
      ]).onConflictDoNothing();
    }

    await tx.insert(projectCategories).values(projectCategorySeed.map(([nameFr, nameEn, slug], index) => ({ nameFr, nameEn, slug, displayOrder: index + 1 }))).onConflictDoNothing();
    const categoryRows = await tx.select().from(projectCategories);
    const categoryIds = new Map(categoryRows.map((category) => [category.slug, category.id]));

    const projectRows = [
      {
        categoryId: categoryIds.get("plateformes-educatives") ?? null,
        titleFr: "Edu-Nify",
        titleEn: "Edu-Nify",
        slug: "edu-nify",
        shortDescriptionFr: "Plateforme éducative numérique imaginée pour faciliter l'accès aux cours en ligne, aux ressources pédagogiques et aux activités d'apprentissage.",
        shortDescriptionEn: "A digital learning platform designed to make online courses, learning resources and educational activities more accessible.",
        descriptionFr: "Edu-Nify vise à réunir des cours en ligne, des ressources pédagogiques et un espace d'apprentissage. L'état de développement et la disponibilité de chaque fonctionnalité doivent être confirmés avant toute communication commerciale.",
        descriptionEn: "Edu-Nify aims to bring together online courses, learning resources and a learning space. The development status and availability of each feature must be confirmed before any commercial communication.",
        objectives: [{ fr: "Faciliter l'accès aux cours et aux ressources pédagogiques.", en: "Make courses and learning resources easier to access." }],
        features: [
          feature("Accès aux cours en ligne", "Online course access"),
          feature("Gestion des ressources pédagogiques", "Learning resource management"),
          feature("Espace d'apprentissage", "Learning space"),
          feature("Classe virtuelle", "Virtual classroom"),
          feature("Visioconférence", "Video conferencing"),
          feature("Chat", "Chat"),
          feature("Partage d'écran", "Screen sharing"),
          feature("Gestion des présences", "Attendance tracking"),
          feature("Partage de documents", "Document sharing"),
          feature("Planning des cours", "Course scheduling"),
          feature("Notifications", "Notifications"),
        ],
        status: "to-confirm",
        role: "",
        technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "Supabase", "PWA", "Vercel"],
        displayOrder: 1,
        isPublished: true,
      },
      {
        categoryId: categoryIds.get("logiciels-gestion") ?? null,
        titleFr: "Gestion commerciale & facturation",
        titleEn: "Business management & invoicing",
        slug: "gestion-commerciale-facturation",
        shortDescriptionFr: "Application web de gestion commerciale pensée pour faciliter le suivi des clients, des devis, des factures et des paiements.",
        shortDescriptionEn: "A business management web application concept for handling customers, quotations, invoices and payments.",
        descriptionFr: "Le projet décrit une application web de gestion commerciale. Les fonctionnalités et les rôles évoqués sont des éléments prévus ou associés au projet; leur disponibilité réelle reste à confirmer.",
        descriptionEn: "This project describes a business management web application. The listed features and roles are planned or associated with the project; their actual availability remains to be confirmed.",
        objectives: [{ fr: "Faciliter le suivi des clients, des devis, des factures et des paiements.", en: "Make it easier to manage customers, quotations, invoices and payments." }],
        features: [
          feature("Gestion des clients", "Customer management"),
          feature("Création de devis", "Quotation creation"),
          feature("Création de factures", "Invoice creation"),
          feature("Gestion des paiements échelonnés", "Installment payment tracking"),
          feature("Tableau de bord", "Dashboard"),
          feature("Gestion des utilisateurs", "User management"),
          feature("Permissions selon les rôles", "Role-based permissions"),
          feature("Rôles envisagés : secrétaire, comptable, directeur, administrateur", "Proposed roles: secretary, accountant, director, administrator"),
        ],
        status: "to-confirm",
        role: "",
        technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript", "Bootstrap", "WampServer"],
        displayOrder: 2,
        isPublished: true,
      },
      { ...edulinkSeed, categoryId: categoryIds.get("plateformes-educatives") ?? null },
      {
        categoryId: categoryIds.get("applications-mobiles") ?? null,
        titleFr: "Hydro-Track",
        titleEn: "Hydro-Track",
        slug: "hydro-track",
        shortDescriptionFr: "Application de commande et de suivi des livraisons d'eau et de boissons au Gabon.",
        shortDescriptionEn: "Water and beverage delivery tracking and ordering application in Gabon.",
        descriptionFr: "Hydro-Track est une application numérique conçue pour faciliter la commande et la livraison d'eau et de boissons aux particuliers et aux entreprises. Elle permet aux clients de passer leurs commandes facilement, de suivre leur livraison et de recevoir leurs produits à domicile ou en entreprise.",
        descriptionEn: "Hydro-Track is a digital application designed to simplify ordering and delivery of water and beverages for individuals and businesses in Gabon.",
        objectives: [{ fr: "Simplifier l'approvisionnement en eau potable et boissons.", en: "Simplify clean water and beverage supply." }],
        features: [
          feature("Consultation des produits disponibles", "Catalog of available products"),
          feature("Commande et paiement", "Ordering and payment"),
          feature("Suivi en direct du statut de livraison", "Live delivery tracking"),
          feature("Gestion des livreurs et affectation", "Driver management and assignment"),
        ],
        status: "in-development",
        role: "Conception de l'expérience utilisateur et architecture applicative.",
        mainImageUrl: "/images/hydro-track-preview.webp",
        technologies: ["React Native", "Node.js", "PostgreSQL", "GPS Tracking"],
        displayOrder: 4,
        isPublished: true,
      },
      {
        categoryId: categoryIds.get("applications-mobiles") ?? null,
        titleFr: "SafeGabon",
        titleEn: "SafeGabon",
        slug: "safegabon",
        shortDescriptionFr: "Application de gestion et de sécurisation des mots de passe avec coffre-fort chiffré.",
        shortDescriptionEn: "Secure password manager and digital vault application.",
        descriptionFr: "SafeGabon est une application numérique conçue pour aider les utilisateurs à organiser et retrouver facilement leurs mots de passe dans un coffre-fort numérique sécurisé (Zero Knowledge).",
        descriptionEn: "SafeGabon is a digital password manager designed to help users securely store and manage their credentials in an encrypted vault.",
        objectives: [{ fr: "Renforcer la cybersécurité personnelle et professionnelle.", en: "Strengthen personal and business cybersecurity." }],
        features: [
          feature("Coffre-fort numérique chiffré", "Encrypted digital vault"),
          feature("Organisation par catégories", "Category organization"),
          feature("Générateur de mots de passe robustes", "Strong password generator"),
          feature("Authentification biométrique et 2FA", "Biometric and 2FA authentication"),
        ],
        status: "in-development",
        role: "Conception UX/UI, architecture de sécurité et développement par Ludo_Consulting.",
        mainImageUrl: "/images/safegabon-preview.webp",
        technologies: ["TypeScript", "React Native", "AES-256", "PostgreSQL"],
        displayOrder: 5,
        isPublished: true,
      },
      {
        categoryId: categoryIds.get("applications-web") ?? null,
        titleFr: "TAF-GAB 2.0",
        titleEn: "TAF-GAB 2.0",
        slug: "taf-gab",
        shortDescriptionFr: "Plateforme numérique dédiée à l'emploi et à l'employabilité au Gabon.",
        shortDescriptionEn: "Digital platform dedicated to employment and employability in Gabon.",
        descriptionFr: "TAF-GAB 2.0 est une plateforme numérique innovante portée par Ludo_Consulting, facilitant la recherche d'emploi, la création de CV et lettres, le profil numérique avec vidéo de présentation et la mise en relation avec les recruteurs.",
        descriptionEn: "TAF-GAB 2.0 is an innovative digital platform led by Ludo_Consulting, facilitating job search, resume building, digital profiles with video presentations and recruiter matching in Gabon.",
        objectives: [{ fr: "Favoriser l'insertion professionnelle et valoriser les compétences au Gabon.", en: "Promote professional integration and highlight skills in Gabon." }],
        features: [
          feature("Recherche et consultation d'offres d'emploi", "Job search and browsing"),
          feature("Créateur de CV et lettres de motivation", "Resume and cover letter builder"),
          feature("Profil public avec vidéo et badges professionnels", "Public profile with video and badges"),
          feature("Espace recruteur et gestion des candidatures", "Recruiter portal and candidate tracking"),
        ],
        status: "in-development",
        role: "Projet porté par Ludo_Consulting : stratégie, conception UX/UI et développement.",
        mainImageUrl: "/images/taf-gab-preview.webp",
        technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "PWA"],
        displayOrder: 6,
        isPublished: true,
      },
      {
        categoryId: categoryIds.get("applications-mobiles") ?? null,
        titleFr: "LudoConnect",
        titleEn: "LudoConnect",
        slug: "ludoconnect",
        shortDescriptionFr: "Application de recherche et de restitution sécurisée de documents perdus au Gabon.",
        shortDescriptionEn: "Platform for searching and safely recovering lost documents in Gabon.",
        descriptionFr: "LudoConnect est une application numérique conçue pour faciliter la recherche et la récupération de documents perdus (CNI, passeports, permis) en rapprochant citoyens et structures partenaires de manière sécurisée et responsable.",
        descriptionEn: "LudoConnect is a digital application designed to assist citizens in recovering lost official documents safely and reliably.",
        objectives: [{ fr: "Réduire les difficultés liées à la perte de documents administratifs.", en: "Reduce administrative document loss difficulties." }],
        features: [
          feature("Déclaration de document perdu", "Lost document declaration"),
          feature("Signalement de document retrouvé", "Found document reporting"),
          feature("Vérification stricte avant restitution", "Identity verification before return"),
          feature("Protection des données personnelles (zéro donnée sensible publique)", "Privacy protection"),
        ],
        status: "conceptual",
        role: "Conception produit et architecture de confidentialité.",
        mainImageUrl: "/images/logo-ludoconnect.webp",
        technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
        displayOrder: 7,
        isPublished: true,
      },
    ];
    await tx.insert(projects).values(projectRows).onConflictDoNothing();

    await tx.insert(skills).values([
      { nameFr: "Développement web et mobile", nameEn: "Web and mobile development", categoryFr: "Développement", categoryEn: "Development", descriptionFr: "Conception de sites, d'applications et de solutions informatiques.", descriptionEn: "Design of websites, applications and software solutions.", displayOrder: 1 },
      { nameFr: "Conception de solutions informatiques", nameEn: "Software solution design", categoryFr: "Développement", categoryEn: "Development", descriptionFr: "Analyse et conception de solutions numériques adaptées aux besoins.", descriptionEn: "Analysis and design of digital solutions tailored to specific needs.", displayOrder: 2 },
      { nameFr: "Bases de données", nameEn: "Databases", categoryFr: "Technologies numériques", categoryEn: "Digital technologies", descriptionFr: "Création et gestion de bases de données selon les besoins des projets.", descriptionEn: "Database creation and management based on project needs.", displayOrder: 3 },
      { nameFr: "Intelligence artificielle et automatisation", nameEn: "Artificial intelligence and automation", categoryFr: "Technologies numériques", categoryEn: "Digital technologies", descriptionFr: "Formation et accompagnement dans l'utilisation des outils d'IA et l'automatisation.", descriptionEn: "Training and guidance in the use of AI tools and automation.", displayOrder: 4 },
      { nameFr: "Cybersécurité et réseaux", nameEn: "Cybersecurity and networking", categoryFr: "Technologies numériques", categoryEn: "Digital technologies", descriptionFr: "Sensibilisation, accompagnement et sécurité des réseaux selon le besoin.", descriptionEn: "Awareness, guidance and network security based on the need.", displayOrder: 5 },
      { nameFr: "Infographie et identité visuelle", nameEn: "Graphic design and visual identity", categoryFr: "Création", categoryEn: "Creative", descriptionFr: "Conception de supports visuels et d'identités pour la communication.", descriptionEn: "Design of visual materials and identities for communication.", displayOrder: 6 },
      { nameFr: "Formation et accompagnement", nameEn: "Training and guidance", categoryFr: "Transmission", categoryEn: "Learning", descriptionFr: "Initiation et accompagnement autour des outils numériques et de la programmation.", descriptionEn: "Introduction and guidance in digital tools and programming.", displayOrder: 7 },
      { nameFr: "Supports pédagogiques et documents professionnels", nameEn: "Learning materials and professional documents", categoryFr: "Transmission", categoryEn: "Learning", descriptionFr: "Conception et mise en forme de supports pédagogiques et de documents.", descriptionEn: "Design and formatting of learning materials and documents.", displayOrder: 8 },
      { nameFr: "Gestion de projets numériques", nameEn: "Digital project management", categoryFr: "Accompagnement", categoryEn: "Guidance", descriptionFr: "Planification et suivi de projets numériques avec des étapes de validation.", descriptionEn: "Planning and tracking of digital projects through review milestones.", displayOrder: 9 },
    ]).onConflictDoNothing();

    const technologyNames = [...new Set(projectRows.flatMap((project) => project.technologies))];
    await tx.insert(technologies).values(technologyNames.map((name) => ({ name }))).onConflictDoNothing();
    const storedTechnologies = await tx.select({ id: technologies.id, name: technologies.name }).from(technologies);
    const technologyIds = new Map(storedTechnologies.map((technology) => [technology.name, technology.id]));
    const storedProjects = await tx.select({ id: projects.id, technologies: projects.technologies }).from(projects);
    const projectTechnologyRows = storedProjects.flatMap((project) => project.technologies.flatMap((technology) => {
      const technologyId = technologyIds.get(technology);
      return technologyId ? [{ projectId: project.id, technologyId }] : [];
    }));
    if (projectTechnologyRows.length) await tx.insert(projectTechnologies).values(projectTechnologyRows).onConflictDoNothing();

    await tx.insert(articleCategories).values([
      { nameFr: "Développement", nameEn: "Development", slug: "developpement" },
      { nameFr: "Intelligence artificielle", nameEn: "Artificial intelligence", slug: "intelligence-artificielle" },
      { nameFr: "Bureautique", nameEn: "Office skills", slug: "bureautique" },
      { nameFr: "Cybersécurité", nameEn: "Cybersecurity", slug: "cybersecurite" },
      { nameFr: "Conseils numériques", nameEn: "Digital advice", slug: "conseils-numeriques" },
    ]).onConflictDoNothing();

    const configuredAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (configuredAdmin) {
      await tx.insert(adminUsers).values({ email: configuredAdmin, role: "admin", isActive: true }).onConflictDoNothing();
    }
  });

  await ensureEdulinkProject();
  await ensureSocialLinks();
}

const globalForSeed = globalThis as typeof globalThis & { __ludoEdulinkSeeded?: boolean };

export async function ensureEdulinkProject() {
  if (globalForSeed.__ludoEdulinkSeeded) return;
  const [category] = await db.select({ id: projectCategories.id }).from(projectCategories).where(eq(projectCategories.slug, "plateformes-educatives")).limit(1);
  await db.insert(projects).values({ ...edulinkSeed, categoryId: category?.id ?? null }).onConflictDoNothing({ target: projects.slug });

  const [edulink] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, "edulink")).limit(1);
  if (edulink) {
    await db.insert(technologies).values(edulinkSeed.technologies.map((name) => ({ name }))).onConflictDoNothing();
    const storedTechnologies = await db.select({ id: technologies.id, name: technologies.name }).from(technologies);
    const technologyIds = new Map(storedTechnologies.map((technology) => [technology.name, technology.id]));
    const technologyRows = edulinkSeed.technologies.flatMap((technology) => {
      const technologyId = technologyIds.get(technology);
      return technologyId ? [{ projectId: edulink.id, technologyId }] : [];
    });
    if (technologyRows.length) await db.insert(projectTechnologies).values(technologyRows).onConflictDoNothing();
  }

  const [gestion] = await db.select({ id: projects.id, features: projects.features }).from(projects).where(eq(projects.slug, "gestion-commerciale-facturation")).limit(1);
  if (gestion && !gestion.features.some((item) => item.fr.startsWith("Rôles envisagés"))) {
    await db.update(projects).set({
      features: [...gestion.features, { fr: "Rôles envisagés : secrétaire, comptable, directeur, administrateur", en: "Proposed roles: secretary, accountant, director, administrator", state: "planned" }],
      updatedAt: new Date(),
    }).where(eq(projects.id, gestion.id));
  }

  await db.update(profiles).set({
    logoUrl: "/brand/Ludo_Consulting.svg",
    profileImageUrl: "/images/responsable.webp",
  }).where(eq(profiles.id, 1));
  globalForSeed.__ludoEdulinkSeeded = true;
}

const globalForSocials = globalThis as typeof globalThis & { __ludoSocialsSeeded?: boolean };

export async function ensureSocialLinks() {
  if (globalForSocials.__ludoSocialsSeeded) return;
  const { SOCIAL_DEFAULTS } = await import("@/lib/social");
  await db.insert(socialLinks).values(SOCIAL_DEFAULTS.map((item) => ({
    platform: item.platform,
    label: item.label,
    url: item.url,
    displayOrder: item.displayOrder,
    isPublished: true,
  }))).onConflictDoNothing();
  globalForSocials.__ludoSocialsSeeded = true;
}

export async function seedMarkerExists() {
  const [row] = await db.select({ key: siteSettings.key }).from(siteSettings).where(eq(siteSettings.key, "seed-v1")).limit(1);
  return Boolean(row);
}
