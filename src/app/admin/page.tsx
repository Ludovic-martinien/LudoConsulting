import { AdminShell } from "@/components/admin-shell";
import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord", robots: { index: false, follow: false } };
export default async function AdminDashboardPage() {
  const session = await requireAdminPage();
  return <AdminShell email={session.email} role={session.role}><AdminDashboard /></AdminShell>;
}
