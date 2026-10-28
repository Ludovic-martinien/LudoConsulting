import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { searchAll } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "sales"]);
  if (isResponse(auth)) return auth;
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (query.trim().length < 2) return Response.json({ members: [], quotes: [], messages: [] });
  try {
    return Response.json(await searchAll(query));
  } catch {
    return Response.json({ error: "Recherche indisponible." }, { status: 500 });
  }
}
