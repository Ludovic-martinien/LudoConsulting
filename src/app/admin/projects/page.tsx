import { asc } from "drizzle-orm";
import { db } from "@/db";
import { projectCategories, projects } from "@/db/schema";
import { AdminShell } from "@/components/admin-shell";
import { AdminProjects } from "@/components/admin-projects";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des projets", robots: { index: false, follow: false } };

export default async function AdminProjectsPage() {
  const session = await requireAdminPage(["admin", "editor"]);
  const [projectRows, categories] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.displayOrder)),
    db.select({ id: projectCategories.id, nameFr: projectCategories.nameFr, nameEn: projectCategories.nameEn }).from(projectCategories).orderBy(asc(projectCategories.displayOrder)),
  ]);
  const projectData = projectRows.map((project) => ({
    id: project.id,
    categoryId: project.categoryId,
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
    mainImageUrl: project.mainImageUrl,
    demoUrl: project.demoUrl,
    repositoryUrl: project.repositoryUrl,
    technologies: project.technologies,
    isPublished: project.isPublished,
  }));
  return <AdminShell email={session.email} role={session.role}><AdminProjects projects={projectData} categories={categories} /></AdminShell>;
}
