import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { servicePackages, servicePrices, services } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";
import { PricingPage } from "@/components/pricing-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tarifs et formules", description: "Tarifs confirmés des formations bureautiques, des services académiques et de la cybersécurité." };

export default async function PricingRoute() {
  await ensureSeedData();
  const [training] = await db.select().from(services).where(and(eq(services.slug, "formation-informatique"), eq(services.isPublished, true))).limit(1);
  const [academic] = await db.select().from(services).where(and(eq(services.slug, "documents-professionnels-academiques"), eq(services.isPublished, true))).limit(1);
  const [cyber] = await db.select().from(services).where(and(eq(services.slug, "cybersecurite-reseaux"), eq(services.isPublished, true))).limit(1);
  const [packages, academicPrices] = await Promise.all([
    training ? db.select().from(servicePackages).where(and(eq(servicePackages.serviceId, training.id), eq(servicePackages.isPublished, true))).orderBy(asc(servicePackages.displayOrder)) : Promise.resolve([]),
    academic ? db.select().from(servicePrices).where(and(eq(servicePrices.serviceId, academic.id), eq(servicePrices.isPublished, true))).orderBy(asc(servicePrices.displayOrder)) : Promise.resolve([]),
  ]);
  return <main><PricingPage packages={packages} academicPrices={academicPrices} cyberPrice={cyber?.basePrice ?? null} /></main>;
}
