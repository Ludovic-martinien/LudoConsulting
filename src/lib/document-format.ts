/** Helpers d'affichage des documents — utilisables côté client et serveur (aucune dépendance Node). */
export type PublicDocument = {
  id: number;
  titleFr: string;
  titleEn: string;
  projectSlug: string | null;
  fileName: string;
  sizeBytes: number;
  createdAt: Date;
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
