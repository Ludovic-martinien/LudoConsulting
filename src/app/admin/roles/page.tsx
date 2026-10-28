import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminRolesView } from "@/components/admin-roles-view";
import { requireAdminPage } from "@/lib/admin-page";
import { getRolesOverview } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rôles et permissions", robots: { index: false, follow: false } };

export default async function AdminRolesPage() {
  const session = await requireAdminPage(["admin"]);
  const overview = await getRolesOverview();
  return (
    <AdminShell email={session.email} role={session.role}>
      <section className="admin-content">
        <div className="admin-title-row">
          <div><h1>Rôles et permissions</h1><p>Rôles détectés depuis la base de données. Les permissions sont appliquées côté serveur.</p></div>
          <Link href="/admin" className="text-link">Retour au tableau de bord</Link>
        </div>
        <AdminRolesView overview={overview} ownEmail={session.email} />
      </section>
    </AdminShell>
  );
}
