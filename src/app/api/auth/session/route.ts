import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession().catch(() => null);
  if (!session) return Response.json({ admin: false, role: null });
  return Response.json({ admin: true, role: session.role });
}
