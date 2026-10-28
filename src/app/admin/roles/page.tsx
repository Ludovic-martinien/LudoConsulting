import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, users } from "@/db/schema";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Rôles", robots: { index: false, follow: false } };

const PERMISSIONS: Record<string, { title: string; desc: string; points: string[] }> = {
  member: {
    title: "Membre",
    desc: "Visiteur inscrit depuis le site public. Compte personnel sans accès à l'administration.",
    points: ["Profil personnel", "Demandes de devis liées", "Inscriptions formations liées"],
  },
  sales: {
    title: "Commercial",
    desc: "Accès aux demandes commerciales et au tableau de bord. Sans gestion des contenus ni des utilisateurs.",
    points: ["Tableau de bord", "Demandes reçues", "Mon profil"],
  },
  editor: {
    title: "Éditeur",
    desc: "Gestion des contenus éditoriaux, sans accès aux demandes ni aux utilisateurs.",
    points: ["Services & tarifs", "Projets", "Articles", "Photo & logos"],
  },
  admin: {
    title: "Administrateur",
    desc: "Accès complet : contenus, demandes, utilisateurs, rôles, journal et profil.",
    points: ["Tout l'espace admin", "Gestion des utilisateurs", "Journal d'activité"],
  },
};

export default async function AdminRolesPage() {
  const session = await requireAdminPage(["admin"]);
  const [members, admins, editors, sales] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(adminUsers).where(eq(adminUsers.role, "admin")),
    db.select({ value: count() }).from(adminUsers).where(eq(adminUsers.role, "editor")),
    db.select({ value: count() }).from(adminUsers).where(eq(adminUsers.role, "sales")),
  ]);
  const rows = [
    { role: "member", count: members[0]?.value ?? 0 },
    { role: "sales", count: sales[0]?.value ?? 0 },
    { role: "editor", count: editors[0]?.value ?? 0 },
    { role: "admin", count: admins[0]?.value ?? 0 },
  ];
  return (
    <AdminShell email={session.email} role={session.role}>
      <section className="admin-content">
        <div className="admin-title-row"><div><h1>Types d'utilisateurs et rôles</h1><p>Rôles détectés dans le modèle de données. Les permissions sont appliquées côté serveur.</p></div></div>
        <div className="roles-grid">
          {rows.map((row) => {
            const info = PERMISSIONS[row.role];
            return (
              <article className="role-card" key={row.role}>
                <div className="role-card-head"><h2>{info.title}</h2><span className="role-count">{row.count} compte{row.count > 1 ? "s" : ""}</span></div>
                <p>{info.desc}</p>
                <ul>{info.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <Link href={`/admin/utilisateurs?role=${row.role}`} className="text-link">Voir les comptes</Link>
              </article>
            );
          })}
        </div>
        <p className="form-disclaimer">La modification d'un rôle s'effectue depuis la fiche du compte, avec journalisation. Un administrateur ne peut ni modifier son propre rôle ni rétrograder le dernier administrateur.</p>
      </section>
    </AdminShell>
  );
}
