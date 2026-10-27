import { desc } from "drizzle-orm";
import { db } from "@/db";
import { memberLoginEvents, memberSessions, memberUsers } from "@/db/schema";
import { AdminShell } from "@/components/admin-shell";
import { AdminMembers } from "@/components/admin-members";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des membres", robots: { index: false, follow: false } };

export default async function AdminMembersPage() {
  const session = await requireAdminPage(["admin"]);
  const [users, sessions, events] = await Promise.all([
    db.select().from(memberUsers).orderBy(desc(memberUsers.createdAt)),
    db.select({ userId: memberSessions.userId, expiresAt: memberSessions.expiresAt }).from(memberSessions),
    db.select({ userId: memberLoginEvents.userId, method: memberLoginEvents.method, createdAt: memberLoginEvents.createdAt })
      .from(memberLoginEvents).orderBy(desc(memberLoginEvents.createdAt)).limit(500),
  ]);
  const now = new Date();
  const activeSessions = new Map<number, number>();
  for (const item of sessions) {
    if (item.expiresAt > now) activeSessions.set(item.userId, (activeSessions.get(item.userId) ?? 0) + 1);
  }
  const eventsByUser = new Map<number, { method: string; createdAt: Date }[]>();
  for (const event of events) {
    const list = eventsByUser.get(event.userId) ?? [];
    if (list.length < 5) list.push({ method: event.method, createdAt: event.createdAt });
    eventsByUser.set(event.userId, list);
  }
  const members = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    googleLinked: Boolean(user.googleId),
    hasPassword: Boolean(user.passwordHash),
    emailVerified: user.emailVerified,
    activeSessions: activeSessions.get(user.id) ?? 0,
    lastLogin: eventsByUser.get(user.id)?.[0]?.createdAt ?? null,
    recentEvents: eventsByUser.get(user.id) ?? [],
    createdAt: user.createdAt,
  }));
  return <AdminShell email={session.email} role={session.role}><AdminMembers members={members} /></AdminShell>;
}
