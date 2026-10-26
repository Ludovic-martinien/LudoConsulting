import { AboutPage } from "@/components/about-page";
import { getProfilePhoto } from "@/lib/media-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "À propos", description: "Découvrir Ludo_Consulting, sa mission, son approche et son responsable." };

export default async function AboutRoute() {
  const photo = await getProfilePhoto();
  return <main><AboutPage photo={photo} /></main>;
}
