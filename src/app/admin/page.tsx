import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, articles, contactMessages, projects, quoteRequests, registrations, services } from "@/db/schema";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord", robots: { index: false, follow: false } };
export default async function AdminDashboard() {
  const session = await requireAdminPage();
  const countRows = await Promise.all([
    db.select({ value: count() }).from(projects).where(eq(projects.isPublished, true)),
    db.select({ value: count() }).from(services).where(eq(services.isPublished, true)),
    db.select({ value: count() }).from(quoteRequests),
    db.select({ value: count() }).from(contactMessages),
    db.select({ value: count() }).from(articles).where(eq(articles.isPublished, true)),
    db.select({ value: count() }).from(registrations),
    db.select({ value: count() }).from(quoteRequests).where(eq(quoteRequests.status, "new")),
    db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
  ]);
  const activity = await db.select({ id: activityLogs.id, action: activityLogs.action, entityType: activityLogs.entityType, createdAt: activityLogs.createdAt }).from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(8);
  const metrics = [
    ["Projets publiés", countRows[0][0]?.value ?? 0], ["Services actifs", countRows[1][0]?.value ?? 0], ["Demandes de devis", countRows[2][0]?.value ?? 0], ["Messages reçus", countRows[3][0]?.value ?? 0], ["Articles publiés", countRows[4][0]?.value ?? 0], ["Demandes de formation", countRows[5][0]?.value ?? 0], ["Devis à traiter", countRows[6][0]?.value ?? 0], ["Messages nouveaux", countRows[7][0]?.value ?? 0],
  ] as const;
  return <AdminShell email={session.email} role={session.role}><section className="admin-content"><div className="admin-title-row"><div><h1>Vue d'ensemble</h1><p>Indicateurs issus des données enregistrées dans PostgreSQL.</p></div><Link className="button button-primary button-small" href="/admin/inbox">Consulter les demandes</Link></div><div className="admin-metric-grid">{metrics.map(([label, value]) => <article className="admin-metric" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><div className="admin-divider" /><div className="admin-subnav"><div><h2 className="admin-section-title">Activité récente</h2><p>Les actions sensibles sont journalisées sans contenu confidentiel.</p></div><Link href="/admin/services" className="text-link">Gérer les contenus</Link></div>{activity.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Action</th><th>Type</th><th>Date</th></tr></thead><tbody>{activity.map((item) => <tr key={item.id}><td><strong>{item.action}</strong></td><td>{item.entityType ?? "—"}</td><td>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(item.createdAt)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h3>Aucune activité administrative enregistrée</h3><p>Les actions apparaîtront ici lorsque l'espace sera utilisé.</p></div>}</section></AdminShell>;
}
