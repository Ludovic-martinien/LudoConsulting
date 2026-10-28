import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { getDashboardStats, type PeriodKey } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  const period = new URL(request.url).searchParams.get("period");
  const key: PeriodKey = period === "7d" || period === "12m" ? period : "30d";
  try {
    return Response.json(await getDashboardStats(key));
  } catch {
    return Response.json({ error: "Statistiques indisponibles." }, { status: 500 });
  }
}
