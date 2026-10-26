"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceCard } from "@/components/content-cards";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";
import { serviceQuoteMessage } from "@/lib/site";

type Card = { titleFr: string; titleEn: string; descriptionFr: string; descriptionEn: string; slug: string; icon: string; priceLabelFr: string; priceLabelEn: string };
export function ServicesIndex({ services }: { services: Card[] }) {
  const { text } = useLanguage();
  return <><PageHero eyebrowFr="Nos expertises" eyebrowEn="Our expertise" titleFr="Les bons outils pour faire avancer vos projets." titleEn="The right tools to move your projects forward." descriptionFr="Huit domaines complémentaires pour créer, apprendre, sécuriser et faire évoluer votre activité." descriptionEn="Eight complementary areas to create, learn, secure and grow your business." /><section className="page-content"><div className="services-grid">{services.map((service) => <ServiceCard service={service} key={service.slug} />)}</div><div className="services-bottom" style={{ marginTop: 28 }}><p className="price-disclaimer">{text(serviceQuoteMessage.fr, serviceQuoteMessage.en)}</p><Link href="/pricing" className="text-link">{text("Voir les tarifs et formules", "See pricing and plans")} <ArrowRight size={15} /></Link></div></section></>;
}
