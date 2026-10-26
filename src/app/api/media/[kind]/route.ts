import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploadedImages } from "@/db/schema";
import { isMediaKind } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ kind: string }> }) {
  const { kind } = await context.params;
  if (!isMediaKind(kind)) return new Response("Not found", { status: 404 });
  try {
    const [image] = await db.select({ mimeType: uploadedImages.mimeType, dataBase64: uploadedImages.dataBase64 })
      .from(uploadedImages).where(eq(uploadedImages.kind, kind)).limit(1);
    if (!image) return new Response("Not found", { status: 404 });
    const bytes = Buffer.from(image.dataBase64, "base64");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": image.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=300, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
