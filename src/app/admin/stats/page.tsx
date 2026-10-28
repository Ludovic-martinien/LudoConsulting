import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminStatsView } from "@/components/admin-stats-view";
import { requireAdminPage } from "@/lib/admin-page";
import { getDashboardStats } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Statistiques et rapports", robots: { index: false, follow: false } };

export default async function AdminStatsPage() {
  const session = await requireAdminPage(["admin", "editor", "sales"]);
  const initial = await getDashboardStats("30d");
  return (
    <AdminShell email={session.email} role={session.role}>
      <section className="admin-content">
        <div className="admin-title-row">
          <div><h1>Statistiques et rapports</h1><p>Toutes les valeurs sont calculées depuis la base PostgreSQL. Aucune donnée de démonstration.</p></div>
          <Link href="/admin" className="text-link">Retour au tableau de bord</Link>
        </div>
        <AdminStatsView initial={initial} />
      </section>
    </AdminShell>
  );
}
