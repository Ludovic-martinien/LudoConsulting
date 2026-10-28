import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({ platform: socialLinks.platform, label: socialLinks.label, url: socialLinks.url })
      .from(socialLinks)
      .where(eq(socialLinks.isPublished, true))
      .orderBy(asc(socialLinks.displayOrder));
    return Response.json({ items: rows });
  } catch {
    return Response.json({ items: [] });
  }
}
