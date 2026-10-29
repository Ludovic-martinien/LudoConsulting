import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, projectCategories, projects, serviceItems, servicePackages, servicePrices, services, skills } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";

function money(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export async function getPublicServiceCards() {
  try {
    return await getPublicServiceCardsInner();
  } catch (error) {
    console.error("Données indisponibles (getPublicServiceCards):", error instanceof Error ? error.message : error);
    return [];
  }
}

async function getPublicServiceCardsInner() {
  await ensureSeedData();
  const [serviceRows, prices, packages] = await Promise.all([
    db.select().from(services).where(eq(services.isPublished, true)).orderBy(asc(services.displayOrder)),
    db.select().from(servicePrices).where(eq(servicePrices.isPublished, true)),
    db.select().from(servicePackages).where(eq(servicePackages.isPublished, true)),
  ]);
  return serviceRows.map((service) => {
    const servicePriceRows = prices.filter((price) => price.serviceId === service.id);
    const packageRows = packages.filter((pkg) => pkg.serviceId === service.id);
    let priceLabelFr = "Sur devis";
    let priceLabelEn = "By quote";
    if ((service.priceType === "starting" || service.priceType === "fixed") && service.basePrice !== null) {
      const prefixFr = service.priceType === "starting" ? "Dès " : "";
      const prefixEn = service.priceType === "starting" ? "From " : "";
      priceLabelFr = `${prefixFr}${money(service.basePrice)}`;
      priceLabelEn = `${prefixEn}${money(service.basePrice)}`;
    } else if (service.priceType === "unavailable") {
      priceLabelFr = "Tarif temporairement indisponible";
      priceLabelEn = "Pricing temporarily unavailable";
    } else if (service.priceType === "packages" && packageRows.length) {
      const amounts = packageRows.map((pkg) => pkg.price);
      priceLabelFr = `${money(Math.min(...amounts))} – ${money(Math.max(...amounts))}`;
      priceLabelEn = priceLabelFr;
    } else if (service.priceType === "structured" && servicePriceRows.length) {
      const min = Math.min(...servicePriceRows.map((price) => price.price));
      priceLabelFr = `Dès ${money(min)}`;
      priceLabelEn = `From ${money(min)}`;
    }
    return { titleFr: service.titleFr, titleEn: service.titleEn, descriptionFr: service.descriptionFr, descriptionEn: service.descriptionEn, slug: service.slug, icon: service.icon, priceLabelFr, priceLabelEn };
  });
}

export async function getPublicService(slug: string) {
  try {
    return await getPublicServiceInner(slug);
  } catch (error) {
    console.error("Données indisponibles (getPublicService):", error instanceof Error ? error.message : error);
    return null;
  }
}

async function getPublicServiceInner(slug: string) {
  await ensureSeedData();
  const [service] = await db.select().from(services).where(and(eq(services.slug, slug), eq(services.isPublished, true))).limit(1);
  if (!service) return null;
  const [items, prices, packages] = await Promise.all([
    db.select().from(serviceItems).where(and(eq(serviceItems.serviceId, service.id), eq(serviceItems.isActive, true))).orderBy(asc(serviceItems.displayOrder)),
    db.select().from(servicePrices).where(and(eq(servicePrices.serviceId, service.id), eq(servicePrices.isPublished, true))).orderBy(asc(servicePrices.displayOrder)),
    db.select().from(servicePackages).where(and(eq(servicePackages.serviceId, service.id), eq(servicePackages.isPublished, true))).orderBy(asc(servicePackages.displayOrder)),
  ]);
  return {
    titleFr: service.titleFr,
    titleEn: service.titleEn,
    slug: service.slug,
    descriptionFr: service.descriptionFr,
    descriptionEn: service.descriptionEn,
    priceType: service.priceType,
    basePrice: service.basePrice,
    currency: service.currency,
    items: items.map(({ titleFr, titleEn }) => ({ titleFr, titleEn })),
    prices: prices.map(({ labelFr, labelEn, price, priceType, currency }) => ({ labelFr, labelEn, price, priceType, currency })),
    packages: packages.map(({ nameFr, nameEn, descriptionFr, descriptionEn, price, currency, featuresFr, featuresEn, duration }) => ({ nameFr, nameEn, descriptionFr, descriptionEn, price, currency, featuresFr, featuresEn, duration })),
  };
}

export async function getPublicProjects() {
  try {
    return await getPublicProjectsInner();
  } catch (error) {
    console.error("Données indisponibles (getPublicProjects):", error instanceof Error ? error.message : error);
    return [];
  }
}

async function getPublicProjectsInner() {
  await ensureSeedData();
  const [projectRows, categoryRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.isPublished, true)).orderBy(asc(projects.displayOrder)),
    db.select().from(projectCategories).orderBy(asc(projectCategories.displayOrder)),
  ]);
  const categories = new Map(categoryRows.map((category) => [category.id, category]));
  return projectRows.map((project) => {
    const category = project.categoryId ? categories.get(project.categoryId) : undefined;
    return {
      titleFr: project.titleFr,
      titleEn: project.titleEn,
      slug: project.slug,
      shortDescriptionFr: project.shortDescriptionFr,
      shortDescriptionEn: project.shortDescriptionEn,
      descriptionFr: project.descriptionFr,
      descriptionEn: project.descriptionEn,
      objectives: project.objectives,
      features: project.features,
      status: project.status,
      role: project.role,
      technologies: project.technologies,
      categoryFr: category?.nameFr ?? "Projet numérique",
      categoryEn: category?.nameEn ?? "Digital project",
      coverImageUrl: project.mainImageUrl,
      demoUrl: project.demoUrl,
      repositoryUrl: project.repositoryUrl,
    };
  });
}

export async function getPublicSkills() {
  try {
    return await getPublicSkillsInner();
  } catch (error) {
    console.error("Données indisponibles (getPublicSkills):", error instanceof Error ? error.message : error);
    return [];
  }
}

async function getPublicSkillsInner() {
  await ensureSeedData();
  return db.select().from(skills).where(eq(skills.isPublished, true)).orderBy(asc(skills.displayOrder));
}

export async function getPublishedArticles() {
  try {
    return await getPublishedArticlesInner();
  } catch (error) {
    console.error("Données indisponibles (getPublishedArticles):", error instanceof Error ? error.message : error);
    return [];
  }
}

async function getPublishedArticlesInner() {
  await ensureSeedData();
  return db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(asc(articles.publishedAt));
}
