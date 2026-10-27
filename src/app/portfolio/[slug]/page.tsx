import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/project-detail";
import { getPublicProjects } from "@/lib/public-data";
import { requireMemberPage } from "@/lib/member-page";
type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) { const { slug } = await params; const project = (await getPublicProjects()).find((item) => item.slug === slug); return project ? { title: project.titleFr, description: project.shortDescriptionFr } : { title: "Projet introuvable" }; }
export default async function ProjectRoute({ params }: Props) {
  await requireMemberPage();
  const { slug } = await params; const project = (await getPublicProjects()).find((item) => item.slug === slug); if (!project) notFound(); return <main><ProjectDetail project={project} /></main>; }
