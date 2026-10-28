import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { getActivityFeed } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  const params = new URL(request.url).searchParams;
  try {
    return Response.json(await getActivityFeed({
      page: Number(params.get("page")) || 1,
      action: params.get("action") || undefined,
      actor: params.get("actor") || undefined,
      from: params.get("from") || undefined,
      to: params.get("to") || undefined,
    }));
  } catch {
    return Response.json({ error: "Journal indisponible." }, { status: 500 });
  }
}
