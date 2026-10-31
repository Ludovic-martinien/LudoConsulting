import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Instantané de version des contenus publics : permet au navigateur de détecter
 * qu'une mise à jour a été publiée côté serveur, sans exposer de données privées.
 * Ne renvoie qu'un compteur et des horodatages agrégés.
 */
export async function GET() {
  try {
    const result = await db.execute<{
      services: string;
      projects: string;
      articles: string;
      documents: string;
      socials: string;
    }>(sql`
      SELECT
        (SELECT coalesce(max(updated_at), to_timestamp(0))::text FROM services) AS services,
        (SELECT coalesce(max(updated_at), to_timestamp(0))::text FROM projects) AS projects,
        (SELECT coalesce(max(updated_at), to_timestamp(0))::text FROM articles) AS articles,
        (SELECT coalesce(max(updated_at), to_timestamp(0))::text FROM project_documents) AS documents,
        (SELECT count(*)::text FROM social_links) AS socials
    `);
    const row = result.rows[0];
    const version = [row?.services, row?.projects, row?.articles, row?.documents, row?.socials].join("|");
    return Response.json({ version, ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
