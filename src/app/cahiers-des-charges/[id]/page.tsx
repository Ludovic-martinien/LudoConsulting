import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CahierViewer } from "@/components/cahier-viewer";
import { requireMemberPage } from "@/lib/member-page";
import { getPublishedDocument } from "@/lib/documents";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const doc = await getPublishedDocument(Number(id));
  return doc
    ? { title: doc.titleFr, description: `Cahier des charges : ${doc.titleFr}`, robots: { index: false, follow: false } }
    : { title: "Document introuvable" };
}

export default async function CahierDetailPage({ params }: Props) {
  await requireMemberPage();
  const { id } = await params;
  const doc = await getPublishedDocument(Number(id));
  if (!doc) notFound();
  return (
    <main>
      <PageHero
        eyebrowFr={doc.projectSlug ? `Projet : ${doc.projectSlug}` : "Document officiel"}
        eyebrowEn={doc.projectSlug ? `Project: ${doc.projectSlug}` : "Official document"}
        titleFr={doc.titleFr}
        titleEn={doc.titleEn || doc.titleFr}
        descriptionFr="Consultez le document ci-dessous ou téléchargez-le en PDF."
        descriptionEn="Read the document below or download it as PDF."
      />
      <section className="page-content">
        <Link href="/cahiers-des-charges" className="text-link" style={{ marginBottom: 24 }}>
          <ArrowLeft size={15} /> Retour aux cahiers des charges
        </Link>
        <CahierViewer
          id={doc.id}
          fileName={doc.fileName}
          sizeBytes={doc.sizeBytes}
          createdAt={doc.createdAt.toISOString()}
        />
        <p className="form-disclaimer" style={{ marginTop: 18 }}>
          <FileText size={12} style={{ display: "inline", marginRight: 5 }} />
          Document officiel publié par Ludo_Consulting — usage personnel, merci de ne pas le rediffuser sans autorisation.
        </p>
        <a className="button button-primary button-small" style={{ marginTop: 12 }} href={`/api/documents/${doc.id}/file`} download={doc.fileName}>
          <Download size={14} /> Télécharger le PDF
        </a>
      </section>
    </main>
  );
}
