import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession, type AdminRole } from "@/lib/auth";

export async function requireAdminPage(roles: AdminRole[] = ["admin", "editor", "sales"]) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roles.includes(session.role)) redirect("/admin");
  return session;
}
