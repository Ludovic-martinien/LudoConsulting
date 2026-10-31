"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatFileSize, type PublicDocument } from "@/lib/document-format";

export function CahiersList({ documents }: { documents: PublicDocument[] }) {
  const { text, locale } = useLanguage();
  return (
    <div className="services-grid">
      {documents.map((doc) => (
        <Link key={doc.id} href={`/cahiers-des-charges/${doc.id}`} className="service-card">
          <span className="service-icon"><FileText size={20} strokeWidth={1.8} /></span>
          <h3>{text(doc.titleFr, doc.titleEn || doc.titleFr)}</h3>
          <p>
            {doc.projectSlug ? `${text("Projet", "Project")} : ${doc.projectSlug}` : text("Document officiel", "Official document")}
            {" · "}{formatFileSize(doc.sizeBytes)}
          </p>
          <span className="service-card-bottom">
            <span className="service-price">
              {new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium" }).format(new Date(doc.createdAt))}
            </span>
            <span className="service-arrow"><ArrowRight size={14} /></span>
          </span>
        </Link>
      ))}
    </div>
  );
}
