import { ServicesIndex } from "@/components/services-index";
import { getPublicServiceCards } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services", description: "Les huit domaines de services de Ludo_Consulting : développement, IA, formation, cybersécurité, création et accompagnement digital." };

export default async function ServicesPage() {
  const services = await getPublicServiceCards();
  return <main><ServicesIndex services={services} /></main>;
}
