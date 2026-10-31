import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projectDocuments } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { getMemberSession } from "@/lib/member-auth";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

/** Fichier réservé aux membres connectés (et au staff) : sans session valide, 401. */
export async function GET(_request: Request, context: Context) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("Not found", { status: 404 });
  const [memberSession, adminSession] = await Promise.all([getMemberSession(), getAdminSession()]);
  if (!memberSession && !adminSession) return new Response("Authentification requise.", { status: 401 });
  try {
    const [doc] = await db.select({
      fileName: projectDocuments.fileName,
      mimeType: projectDocuments.mimeType,
      dataBase64: projectDocuments.dataBase64,
      sizeBytes: projectDocuments.sizeBytes,
      isPublished: projectDocuments.isPublished,
    }).from(projectDocuments).where(eq(projectDocuments.id, id)).limit(1);
    if (!doc) return new Response("Not found", { status: 404 });
    if (!doc.isPublished && !adminSession) return new Response("Not found", { status: 404 });
    const bytes = Buffer.from(doc.dataBase64, "base64");
    const safeName = encodeURIComponent(doc.fileName).replace(/['()]/g, "");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename*=UTF-8''${safeName}`,
        "Cache-Control": "private, max-age=3600, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
