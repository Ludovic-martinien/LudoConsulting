import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploadedImages } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { acceptedImageTypes, isMediaKind, mediaKinds, mediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

function detectImageType(bytes: Buffer): string | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: Request, context: { params: Promise<{ kind: string }> }) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  const { kind } = await context.params;
  if (!isMediaKind(kind)) return Response.json({ error: "Type de média inconnu." }, { status: 400 });
  const definition = mediaKinds.find((item) => item.kind === kind);
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Aucun fichier reçu." }, { status: 400 });
    if (!(acceptedImageTypes as readonly string[]).includes(file.type)) return Response.json({ error: "Format non accepté. Utilisez un fichier JPG, PNG ou WebP (les SVG ne sont pas téléversables pour des raisons de sécurité)." }, { status: 415 });
    if (file.size === 0 || file.size > (definition?.maxBytes ?? 2 * 1024 * 1024)) return Response.json({ error: `Fichier trop volumineux (maximum ${Math.round((definition?.maxBytes ?? 2 * 1024 * 1024) / (1024 * 1024))} Mo).` }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = detectImageType(bytes);
    if (!detected || detected !== file.type) return Response.json({ error: "Le contenu du fichier ne correspond pas à une image JPG, PNG ou WebP valide." }, { status: 415 });
    await db.insert(uploadedImages).values({ kind, mimeType: detected, dataBase64: bytes.toString("base64"), sizeBytes: bytes.byteLength, updatedAt: new Date() })
      .onConflictDoUpdate({ target: uploadedImages.kind, set: { mimeType: detected, dataBase64: bytes.toString("base64"), sizeBytes: bytes.byteLength, updatedAt: new Date() } });

    // Synchronisation fichier statique : on normalise et optimise l'image
    // (WebP principal + repli JPEG) au lieu d'écrire les octets bruts.
    if (kind === "profile-photo") {
      try {
        const fs = await import("node:fs/promises");
        const sharp = (await import("sharp")).default;
        const optimized = await sharp(bytes)
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 88 })
          .toBuffer();
        const fallback = await sharp(bytes)
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 86, mozjpeg: true })
          .toBuffer();
        await fs.writeFile("public/images/responsable.webp", optimized);
        await fs.writeFile("public/images/responsable.jpg", fallback);
        await fs.writeFile("public/images/portrait.jpg", fallback);
      } catch {
        // environnement en lecture seule : la base reste la source de vérité
      }
    }
    await logAdminAction(auth, "media.upload", "uploaded_image", kind, { sizeBytes: bytes.byteLength, mimeType: detected });
    const [stored] = await db.select({ updatedAt: uploadedImages.updatedAt }).from(uploadedImages).where(eq(uploadedImages.kind, kind)).limit(1);
    return Response.json({ ok: true, url: mediaUrl(kind, stored?.updatedAt) }, { status: 201 });
  } catch {
    return Response.json({ error: "Le téléversement a échoué. Réessayez avec un fichier plus léger." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ kind: string }> }) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  const { kind } = await context.params;
  if (!isMediaKind(kind)) return Response.json({ error: "Type de média inconnu." }, { status: 400 });
  await db.delete(uploadedImages).where(eq(uploadedImages.kind, kind));
  await logAdminAction(auth, "media.delete", "uploaded_image", kind);
  return Response.json({ ok: true });
}
