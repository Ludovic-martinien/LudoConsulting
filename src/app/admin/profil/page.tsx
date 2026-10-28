import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { AdminShell } from "@/components/admin-shell";
import { AdminProfileForm } from "@/components/admin-profile-form";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon profil administrateur", robots: { index: false, follow: false } };

export default async function AdminProfilePage() {
  const session = await requireAdminPage(["admin", "editor", "sales"]);
  const [user] = await db.select({
    email: adminUsers.email,
    name: adminUsers.name,
    role: adminUsers.role,
    isActive: adminUsers.isActive,
    lastLoginAt: adminUsers.lastLoginAt,
    createdAt: adminUsers.createdAt,
  }).from(adminUsers).where(eq(adminUsers.email, session.email)).limit(1);
  return (
    <AdminShell email={session.email} role={session.role}>
      <section className="admin-content">
        <div className="admin-title-row">
          <div><h1>Mon profil</h1><p>Informations de votre compte administrateur.</p></div>
          <Link href="/admin" className="text-link">Retour au tableau de bord</Link>
        </div>
        <AdminProfileForm
          email={user?.email ?? session.email}
          name={user?.name ?? null}
          role={session.role}
          isActive={user?.isActive ?? true}
          lastLoginAt={user?.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null}
          createdAt={user?.createdAt ? new Date(user.createdAt).toISOString() : null}
        />
      </section>
    </AdminShell>
  );
}
