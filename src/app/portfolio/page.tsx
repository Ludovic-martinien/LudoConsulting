import { getPublicProjects } from "@/lib/public-data";
import { PortfolioPage } from "@/components/portfolio-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Portfolio et réalisations", description: "Les projets numériques de Ludo_Consulting, leurs technologies et leurs statuts." };
export default async function PortfolioRoute() { const projects = await getPublicProjects(); return <main><PortfolioPage projects={projects} /></main>; }
