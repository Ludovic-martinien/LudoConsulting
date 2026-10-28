import { AdminShell } from "@/components/admin-shell";
import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminPage } from "@/lib/admin-page";
import { getDashboardStats } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();
  const initial = await getDashboardStats("30d");
  return <AdminShell email={session.email} role={session.role}><AdminDashboard initial={initial} /></AdminShell>;
}
