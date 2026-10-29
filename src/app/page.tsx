import { db } from "@/db";
import { profiles } from "@/db/schema";
import { HomePage } from "@/components/home-page";
import { getProfilePhoto } from "@/lib/media-server";
import { getPublicProjects, getPublicServiceCards, getPublicSkills } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function IndexPage() {
  let services: Awaited<ReturnType<typeof getPublicServiceCards>> = [];
  let projects: Awaited<ReturnType<typeof getPublicProjects>> = [];
  let skills: Awaited<ReturnType<typeof getPublicSkills>> = [];
  let profile: { fullName: string; professionalTitle: string } | undefined;
  let profilePhoto: string | null = "/images/responsable.webp";
  try {
    const [serviceRows, projectRows, skillRows, profileRows, photo] = await Promise.all([
      getPublicServiceCards(),
      getPublicProjects(),
      getPublicSkills(),
      db.select({ fullName: profiles.fullName, professionalTitle: profiles.professionalTitle }).from(profiles).limit(1),
      getProfilePhoto(),
    ]);
    services = serviceRows;
    projects = projectRows;
    skills = skillRows;
    profile = profileRows[0];
    profilePhoto = photo;
  } catch (error) {
    console.error("Accueil en mode dégradé:", error instanceof Error ? error.message : error);
  }
  return <HomePage
    services={services}
    projects={projects}
    skills={skills.map(({ nameFr, nameEn }) => ({ nameFr, nameEn }))}
    profilePhoto={profilePhoto}
    profileName={profile?.fullName ?? "M. Mve Zogo Martinien Ludovic"}
    profileTitle={profile?.professionalTitle ?? "Développeur web et mobile · Concepteur de solutions informatiques"}
  />;
}
