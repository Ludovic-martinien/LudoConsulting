import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceItems, servicePackages, services } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";
import { TrainingPage } from "@/components/training-page";
import { requireMemberOrAdmin } from "@/lib/page-guard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Formations informatiques", description: "Formations informatiques, bureautiques et numériques de Ludo_Consulting." };
type Props = { searchParams: Promise<{ package?: string }> };

export default async function TrainingRoute({ searchParams }: Props) {
  await requireMemberOrAdmin();
  await ensureSeedData();
  const [service] = await db.select().from(services).where(and(eq(services.slug, "formation-informatique"), eq(services.isPublished, true))).limit(1);
  const [query, packages, items] = await Promise.all([
    searchParams,
    service ? db.select().from(servicePackages).where(and(eq(servicePackages.serviceId, service.id), eq(servicePackages.isPublished, true))).orderBy(asc(servicePackages.displayOrder)) : Promise.resolve([]),
    service ? db.select().from(serviceItems).where(and(eq(serviceItems.serviceId, service.id), eq(serviceItems.isActive, true))).orderBy(asc(serviceItems.displayOrder)) : Promise.resolve([]),
  ]);
  const wanted = Number(query.package);
  const selected = packages.some((plan) => plan.id === wanted) ? String(wanted) : "";
  return <main><TrainingPage items={items.map(({ titleFr, titleEn }) => ({ titleFr, titleEn }))} packages={packages} initialPackage={selected} /></main>;
}
