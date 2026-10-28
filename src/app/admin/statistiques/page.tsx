import { AdminShell } from "@/components/admin-shell";
import { AdminStats } from "@/components/admin-stats";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Statistiques", robots: { index: false, follow: false } };
export default async function AdminStatsPage() {
  const session = await requireAdminPage(["admin"]);
  return <AdminShell email={session.email} role={session.role}><AdminStats /></AdminShell>;
}
