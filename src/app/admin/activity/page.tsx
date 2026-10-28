import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminActivityTable } from "@/components/admin-activity-table";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Journal d'activité", robots: { index: false, follow: false } };

export default async function AdminActivityPage() {
  const session = await requireAdminPage(["admin", "editor", "sales"]);
  return (
    <AdminShell email={session.email} role={session.role}>
      <section className="admin-content">
        <div className="admin-title-row">
          <div><h1>Journal d'activité</h1><p>Qui a fait quoi, quand et sur quel élément — événements réellement enregistrés côté serveur.</p></div>
          <Link href="/admin" className="text-link">Retour au tableau de bord</Link>
        </div>
        <AdminActivityTable />
        <p className="form-disclaimer">Les mots de passe, jetons et secrets ne sont jamais consignés. Les administrateurs ne peuvent pas effacer ce journal depuis l'interface.</p>
      </section>
    </AdminShell>
  );
}
