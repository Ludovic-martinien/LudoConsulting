import type { Metadata } from "next";
import { PresentationDeck } from "@/components/presentation/deck";
import { getProjectLogoUrls } from "@/lib/media-server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Présentation des projets numériques",
  description: "Dossier de présentation : Hydro-Track, LudoConnect, SafeGabon, TAF-GAB 2.0 et Edu-Nify.",
  robots: { index: false, follow: false },
};

export default async function PresentationPage() {
  const logos = await getProjectLogoUrls();
  return <PresentationDeck logos={logos} />;
}
