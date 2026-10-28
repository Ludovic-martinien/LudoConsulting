import { QuoteForm } from "@/components/public-forms";
import { PageHero } from "@/components/page-hero";
import { getPublicServiceCards } from "@/lib/public-data";
export const dynamic = "force-dynamic";
export const metadata = { title: "Demander un devis", description: "Présenter un besoin à Ludo_Consulting et enregistrer une demande de devis." };
type Props = { searchParams: Promise<{ service?: string }> };
export default async function QuoteRoute({ searchParams }: Props) {
  const [services, query] = await Promise.all([getPublicServiceCards(), searchParams]);
  const selected = services.some((item) => item.slug === query.service) ? query.service : "";
  return <main><PageHero eyebrowFr="Demande de devis" eyebrowEn="Quote request" titleFr="Décrivez votre besoin, nous prendrons la suite en main." titleEn="Tell us what you need, and we'll take it from there." descriptionFr="Votre demande sera enregistrée avec une référence. Elle ne constitue pas un devis envoyé, une acceptation ou un engagement de paiement." descriptionEn="Your request will be saved with a reference. This is not a quote sent, an acceptance or a payment commitment." /><section className="page-content"><div style={{ maxWidth: 850, margin: "auto" }}><QuoteForm services={services.map(({ slug, titleFr, titleEn }) => ({ slug, titleFr, titleEn }))} initialService={selected} /></div></section></main>;
}
