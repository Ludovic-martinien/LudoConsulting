import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectDocuments } from "@/db/schema";

export { formatFileSize } from "@/lib/document-format";
import type { PublicDocument } from "@/lib/document-format";

export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

export function isPdfFile(name: string, mime: string, bytes: Buffer) {
  const magic = bytes.length >= 5 && bytes.toString("ascii", 0, 5) === "%PDF-";
  const looksPdf = mime === "application/pdf" || mime === "application/octet-stream" || mime === "";
  return magic && looksPdf && name.toLowerCase().endsWith(".pdf");
}

export async function getPublishedDocuments(): Promise<PublicDocument[]> {
  try {
    return await db.select({
      id: projectDocuments.id,
      titleFr: projectDocuments.titleFr,
      titleEn: projectDocuments.titleEn,
      projectSlug: projectDocuments.projectSlug,
      fileName: projectDocuments.fileName,
      sizeBytes: projectDocuments.sizeBytes,
      createdAt: projectDocuments.createdAt,
    }).from(projectDocuments)
      .where(eq(projectDocuments.isPublished, true))
      .orderBy(asc(projectDocuments.displayOrder), desc(projectDocuments.createdAt));
  } catch {
    return [];
  }
}

export async function getPublishedDocument(id: number) {
  try {
    const [row] = await db.select().from(projectDocuments)
      .where(and(eq(projectDocuments.id, id), eq(projectDocuments.isPublished, true))).limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}
