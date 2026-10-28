import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { getUsersOverview } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  try {
    return Response.json({ users: await getUsersOverview() });
  } catch {
    return Response.json({ error: "Liste indisponible." }, { status: 500 });
  }
}
