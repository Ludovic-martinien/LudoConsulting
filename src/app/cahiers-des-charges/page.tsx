import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CahiersList } from "@/components/cahiers-list";
import { requireMemberPage } from "@/lib/member-page";
import { getPublishedDocuments } from "@/lib/documents";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cahiers des charges",
  description: "Consultez les cahiers des charges des projets de Ludo_Consulting.",
  robots: { index: false, follow: false },
};

export default async function CahiersPage() {
  await requireMemberPage();
  const documents = await getPublishedDocuments();
  return (
    <main>
      <PageHero
        eyebrowFr="Documentation projets"
        eyebrowEn="Project documentation"
        titleFr="Les cahiers des charges de nos projets."
        titleEn="Our projects' specifications."
        descriptionFr="Documents officiels publiés par Ludo_Consulting : consultez-les en ligne ou téléchargez-les en PDF."
        descriptionEn="Official documents published by Ludo_Consulting: read them online or download them as PDF."
      />
      <section className="page-content">
        {documents.length === 0 ? (
          <div className="empty-state">
            <span className="service-icon" style={{ margin: "0 auto 15px" }}><FileText size={18} /></span>
            <h3>Aucun cahier des charges publié</h3>
            <p>Les documents publiés par Ludo_Consulting apparaîtront ici.</p>
          </div>
        ) : (
          <CahiersList documents={documents} />
        )}
        <div style={{ marginTop: 27 }}>
          <Link className="text-link" href="/portfolio">Voir le portfolio <ArrowRight size={15} /></Link>
        </div>
      </section>
    </main>
  );
}
