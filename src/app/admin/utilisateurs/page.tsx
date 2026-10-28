import { AdminShell } from "@/components/admin-shell";
import { AdminUsers } from "@/components/admin-users";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Utilisateurs", robots: { index: false, follow: false } };
export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const session = await requireAdminPage(["admin"]);
  const params = await searchParams;
  return <AdminShell email={session.email} role={session.role}><AdminUsers initialQuery={params.q ?? ""} initialRole={params.role ?? "all"} /></AdminShell>;
}
