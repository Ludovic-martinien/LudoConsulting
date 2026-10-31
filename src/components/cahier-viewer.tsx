"use client";

import { useLanguage } from "@/components/language-provider";
import { formatFileSize } from "@/lib/document-format";

export function CahierViewer({ id, fileName, sizeBytes, createdAt }: { id: number; fileName: string; sizeBytes: number; createdAt: string }) {
  const { text, locale } = useLanguage();
  return (
    <div className="document-viewer">
      <div className="document-meta">
        <span><strong>{text("Fichier", "File")} :</strong> {fileName}</span>
        <span><strong>{text("Taille", "Size")} :</strong> {formatFileSize(sizeBytes)}</span>
        <span><strong>{text("Publié le", "Published on")} :</strong> {new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long" }).format(new Date(createdAt))}</span>
      </div>
      <iframe
        src={`/api/documents/${id}/file`}
        title={text(`Aperçu du document ${fileName}`, `Preview of ${fileName}`)}
        className="document-frame"
        loading="lazy"
      />
      <p className="form-disclaimer">{text("Si l'aperçu ne s'affiche pas sur votre appareil, utilisez le bouton de téléchargement.", "If the preview does not display on your device, use the download button.")}</p>
    </div>
  );
}
