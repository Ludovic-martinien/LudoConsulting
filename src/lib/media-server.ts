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
  return "/images/profil/responsable.webp";
}

export async function getProjectLogoUrls(): Promise<Partial<Record<MediaKind, string>>> {
  const versions = await getMediaVersions();
  const result: Partial<Record<MediaKind, string>> = {
    "logo-hydro-track": "/brand/projects/hydro-track.webp",
    "logo-taf-gab": "/brand/projects/taf-gab-2.0.webp",
    "logo-safegabon": "/brand/projects/safegabon.webp",
    "logo-edu-nify": "/brand/projects/edu-nify.webp",
    "logo-ludoconnect": "/brand/projects/ludoconnect.webp",
  };
  for (const [kind, updatedAt] of versions) {
    if (kind.startsWith("logo-")) result[kind as MediaKind] = mediaUrl(kind as MediaKind, updatedAt);
  }
  return result;
}
