import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/service-detail";
import { getPublicService } from "@/lib/public-data";
import { requireMemberPage } from "@/lib/member-page";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getPublicService(slug);
  return service ? { title: service.titleFr, description: service.descriptionFr } : { title: "Service introuvable" };
}

export default async function ServicePage({ params }: Props) {
  await requireMemberPage();
  const { slug } = await params;
  const service = await getPublicService(slug);
  if (!service) notFound();
  return <main><ServiceDetail service={service} /></main>;
}
