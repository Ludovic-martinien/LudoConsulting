import { db } from "@/db";
import { profiles } from "@/db/schema";
import { HomePage } from "@/components/home-page";
import { getProfilePhoto } from "@/lib/media-server";
import { getPublicProjects, getPublicServiceCards, getPublicSkills } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function IndexPage() {
  const [services, projects, skills, profileRows, profilePhoto] = await Promise.all([
    getPublicServiceCards(),
    getPublicProjects(),
    getPublicSkills(),
    db.select({ fullName: profiles.fullName, professionalTitle: profiles.professionalTitle }).from(profiles).limit(1),
    getProfilePhoto(),
  ]);
  const profile = profileRows[0];
  return <HomePage
    services={services}
    projects={projects}
    skills={skills.map(({ nameFr, nameEn }) => ({ nameFr, nameEn }))}
    profilePhoto={profilePhoto}
    profileName={profile?.fullName ?? "M. Mve Zogo Martinien Ludovic"}
    profileTitle={profile?.professionalTitle ?? "Développeur web et mobile · Concepteur de solutions informatiques"}
  />;
}
