import { getPublicSkills } from "@/lib/public-data";
import { SkillsPage } from "@/components/skills-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Compétences techniques", description: "Les domaines de compétences et d'accompagnement de Ludo_Consulting." };
export default async function SkillsRoute() { const skills = await getPublicSkills(); return <main><SkillsPage skills={skills.map(({ id, nameFr, nameEn, categoryFr, categoryEn, descriptionFr, descriptionEn }) => ({ id, nameFr, nameEn, categoryFr, categoryEn, descriptionFr, descriptionEn }))} /></main>; }
