import { ServicesIndex } from "@/components/services-index";
import { getPublicServiceCards } from "@/lib/public-data";
import { requireMemberOrAdmin } from "@/lib/page-guard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services", description: "Les huit domaines de services de Ludo_Consulting : développement, IA, formation, cybersécurité, création et accompagnement digital." };

export default async function ServicesPage() {
  await requireMemberOrAdmin();
  const services = await getPublicServiceCards();
  return <main><ServicesIndex services={services} /></main>;
}
