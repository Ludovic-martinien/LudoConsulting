import { desc } from "drizzle-orm";
import { db } from "@/db";
import { projectDocuments } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";
import { isPdfFile, MAX_DOCUMENT_BYTES } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  const rows = await db.select({
    id: projectDocuments.id,
    titleFr: projectDocuments.titleFr,
    titleEn: projectDocuments.titleEn,
    projectSlug: projectDocuments.projectSlug,
    fileName: projectDocuments.fileName,
    sizeBytes: projectDocuments.sizeBytes,
    isPublished: projectDocuments.isPublished,
    createdAt: projectDocuments.createdAt,
  }).from(projectDocuments).orderBy(desc(projectDocuments.createdAt));
  return Response.json({ documents: rows });
}

export async function POST(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  try {
    const form = await request.formData();
    const titleFr = cleanText(form.get("titleFr"), 240);
    const titleEn = cleanText(form.get("titleEn"), 240);
    const projectSlug = cleanText(form.get("projectSlug"), 180);
    const file = form.get("file");
    if (titleFr.length < 2) return Response.json({ error: "Le titre français est obligatoire (2 caractères minimum)." }, { status: 400 });
    if (!(file instanceof File)) return Response.json({ error: "Aucun fichier PDF reçu." }, { status: 400 });
    if (file.size === 0 || file.size > MAX_DOCUMENT_BYTES) {
      return Response.json({ error: "Le fichier doit être un PDF de 4 Mo maximum." }, { status: 413 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isPdfFile(file.name, file.type, bytes)) {
      return Response.json({ error: "Seuls les fichiers PDF valides sont acceptés." }, { status: 415 });
    }
    const [created] = await db.insert(projectDocuments).values({
      titleFr,
      titleEn,
      projectSlug: projectSlug || null,
      fileName: file.name.slice(0, 240),
      mimeType: "application/pdf",
      dataBase64: bytes.toString("base64"),
      sizeBytes: bytes.byteLength,
      isPublished: form.get("isPublished") !== "off",
    }).returning({ id: projectDocuments.id });
    await logAdminAction(auth, "document.upload", "project_document", String(created.id), { title: titleFr, sizeBytes: bytes.byteLength });
    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch {
    return Response.json({ error: "Le téléversement a échoué. Réessayez avec un fichier plus léger." }, { status: 500 });
  }
}
