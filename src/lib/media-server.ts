import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, uploadedImages } from "@/db/schema";
import { mediaUrl, type MediaKind } from "@/lib/media";

export async function getMediaVersions() {
  const rows = await db.select({ kind: uploadedImages.kind, updatedAt: uploadedImages.updatedAt }).from(uploadedImages);
  return new Map(rows.map((row) => [row.kind, row.updatedAt]));
}

export async function getProfilePhoto() {
  return "/images/responsable.webp";
}

export async function getProjectLogoUrls(): Promise<Partial<Record<MediaKind, string>>> {
  const versions = await getMediaVersions();
  const result: Partial<Record<MediaKind, string>> = {
    "logo-hydro-track": "/images/logo-hydro-track.webp",
    "logo-taf-gab": "/images/logo-taf-gab.webp",
    "logo-safegabon": "/images/logo-safegabon.webp",
    "logo-edu-nify": "/images/logo-edunify.webp",
    "logo-ludoconnect": "/images/logo-ludoconnect.webp",
  };
  for (const [kind, updatedAt] of versions) {
    if (kind.startsWith("logo-")) result[kind as MediaKind] = mediaUrl(kind as MediaKind, updatedAt);
  }
  return result;
}
