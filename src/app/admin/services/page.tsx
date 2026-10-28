import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceItems, servicePackages, servicePrices, services } from "@/db/schema";
import { AdminServices } from "@/components/admin-services";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-page";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des services", robots: { index: false, follow: false } };
export default async function AdminServicesPage() {
  const session = await requireAdminPage(["admin", "editor"]);
  await ensureSeedData();
  const rows = await db.select().from(services).orderBy(asc(services.displayOrder));
  const servicesWithData = await Promise.all(rows.map(async (service) => {
    const [items, prices, packages] = await Promise.all([
      db.select({ titleFr: serviceItems.titleFr, titleEn: serviceItems.titleEn }).from(serviceItems).where(eq(serviceItems.serviceId, service.id)).orderBy(asc(serviceItems.displayOrder)),
      db.select({ id: servicePrices.id, labelFr: servicePrices.labelFr, labelEn: servicePrices.labelEn, price: servicePrices.price }).from(servicePrices).where(eq(servicePrices.serviceId, service.id)).orderBy(asc(servicePrices.displayOrder)),
      db.select({ id: servicePackages.id, nameFr: servicePackages.nameFr, nameEn: servicePackages.nameEn, descriptionFr: servicePackages.descriptionFr, descriptionEn: servicePackages.descriptionEn, price: servicePackages.price, featuresFr: servicePackages.featuresFr, featuresEn: servicePackages.featuresEn, duration: servicePackages.duration, audienceFr: servicePackages.audienceFr, audienceEn: servicePackages.audienceEn, conditionsFr: servicePackages.conditionsFr, conditionsEn: servicePackages.conditionsEn, isPublished: servicePackages.isPublished }).from(servicePackages).where(eq(servicePackages.serviceId, service.id)).orderBy(asc(servicePackages.displayOrder)),
    ]);
    return { id: service.id, titleFr: service.titleFr, titleEn: service.titleEn, slug: service.slug, descriptionFr: service.descriptionFr, descriptionEn: service.descriptionEn, icon: service.icon, priceType: service.priceType, basePrice: service.basePrice, isPublished: service.isPublished, items, prices, packages };
  }));
  return <AdminShell email={session.email} role={session.role}><AdminServices services={servicesWithData} /></AdminShell>;
}
