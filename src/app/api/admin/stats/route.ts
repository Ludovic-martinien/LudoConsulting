import { and, count, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, adminUsers, contactMessages, quoteRequests, registrations, users } from "@/db/schema";
import { authorizeAdmin, isResponse } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type Bucket = { start: Date; end: Date; label: string };

function buildRange(period: string): { start: Date; prevStart: Date; buckets: Bucket[] } {
  const now = new Date();
  const buckets: Bucket[] = [];
  let start: Date;
  if (period === "12m") {
    start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    for (let i = 0; i < 12; i++) {
      const s = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - 11 + i + 1, 1);
      buckets.push({ start: s, end: e, label: s.toLocaleDateString("fr-FR", { month: "short" }) });
    }
  } else {
    const days = period === "7d" ? 7 : 30;
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    for (let i = 0; i < days; i++) {
      const s = new Date(start);
      s.setDate(start.getDate() + i);
      const e = new Date(start);
      e.setDate(start.getDate() + i + 1);
      buckets.push({ start: s, end: e, label: s.toLocaleDateString("fr-FR", { day: "numeric", month: days === 7 ? "short" : "numeric" }) });
    }
  }
  const prevStart = new Date(start.getTime() - (now.getTime() - start.getTime()));
  return { start, prevStart, buckets };
}

function delta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin", "editor", "sales"]);
  if (isResponse(auth)) return auth;
  const period = new URL(request.url).searchParams.get("period") || "30d";
  const { start, prevStart, buckets } = buildRange(period === "7d" || period === "12m" ? period : "30d");

  const [totals, memberRows, adminRows, activityRows, quoteRows, messageRows, registrationRows, recentRows] = await Promise.all([
    Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(users).where(eq(users.isActive, true)),
      db.select({ value: count() }).from(adminUsers),
      db.select({ value: count() }).from(quoteRequests),
      db.select({ value: count() }).from(contactMessages),
      db.select({ value: count() }).from(registrations),
    ]),
    db.select({ createdAt: users.createdAt }).from(users).where(gte(users.createdAt, prevStart)),
    db.select({ role: adminUsers.role }).from(adminUsers),
    db.select({ action: activityLogs.action, success: activityLogs.success, createdAt: activityLogs.createdAt }).from(activityLogs).where(gte(activityLogs.createdAt, prevStart)).orderBy(desc(activityLogs.createdAt)).limit(2000),
    db.select({ createdAt: quoteRequests.createdAt }).from(quoteRequests).where(gte(quoteRequests.createdAt, prevStart)),
    db.select({ createdAt: contactMessages.createdAt }).from(contactMessages).where(gte(contactMessages.createdAt, prevStart)),
    db.select({ createdAt: registrations.createdAt }).from(registrations).where(gte(registrations.createdAt, prevStart)),
    db.select({ id: activityLogs.id, action: activityLogs.action, actorType: activityLogs.actorType, actorEmail: activityLogs.adminEmail, entityType: activityLogs.entityType, success: activityLogs.success, createdAt: activityLogs.createdAt }).from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(8),
  ]);

  const inCur = (d: Date) => d >= start;
  const inPrev = (d: Date) => d >= prevStart && d < start;
  const newMembers = memberRows.filter((r) => inCur(r.createdAt)).length;
  const newMembersPrev = memberRows.filter((r) => inPrev(r.createdAt)).length;
  const curActivity = activityRows.filter((r) => inCur(r.createdAt));
  const prevActivity = activityRows.filter((r) => inPrev(r.createdAt));
  const failed = (rows: typeof activityRows) => rows.filter((r) => r.action.endsWith("login_failed")).length;
  const logins = (rows: typeof activityRows) => rows.filter((r) => ["member.login", "member.google_login", "admin.login"].includes(r.action) && r.success !== false).length;

  const series = buckets.map((b) => {
    const inBucket = (d: Date) => d >= b.start && d < b.end;
    return {
      label: b.label,
      signups: memberRows.filter((r) => inBucket(r.createdAt)).length,
      logins: activityRows.filter((r) => inBucket(r.createdAt) && ["member.login", "member.google_login", "admin.login"].includes(r.action) && r.success !== false).length,
      failed: activityRows.filter((r) => inBucket(r.createdAt) && r.action.endsWith("login_failed")).length,
      activity: activityRows.filter((r) => inBucket(r.createdAt)).length,
    };
  });

  const roleCounts: Record<string, number> = { member: 0, admin: 0, editor: 0, sales: 0 };
  roleCounts.member = totals[0][0]?.value ?? 0;
  for (const row of adminRows) {
    if (row.role === "admin" || row.role === "editor" || row.role === "sales") roleCounts[row.role] += 1;
  }

  const [newQuotes, newMessages, newRegs] = await Promise.all([
    db.select({ value: count() }).from(quoteRequests).where(and(eq(quoteRequests.status, "new"))),
    db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.select({ value: count() }).from(registrations).where(eq(registrations.status, "new")),
  ]);
  const [latestQuotes, latestMessages, latestRegs] = await Promise.all([
    db.select({ id: quoteRequests.id, referenceNumber: quoteRequests.referenceNumber, name: quoteRequests.name, createdAt: quoteRequests.createdAt }).from(quoteRequests).where(eq(quoteRequests.status, "new")).orderBy(desc(quoteRequests.createdAt)).limit(5),
    db.select({ id: contactMessages.id, name: contactMessages.name, createdAt: contactMessages.createdAt }).from(contactMessages).where(eq(contactMessages.status, "new")).orderBy(desc(contactMessages.createdAt)).limit(5),
    db.select({ id: registrations.id, name: registrations.name, createdAt: registrations.createdAt }).from(registrations).where(eq(registrations.status, "new")).orderBy(desc(registrations.createdAt)).limit(5),
  ]);
  const notifications = [
    ...latestQuotes.map((q) => ({ kind: "quote", id: q.id, label: `Devis ${q.referenceNumber} · ${q.name}`, date: q.createdAt.toISOString() })),
    ...latestMessages.map((m) => ({ kind: "message", id: m.id, label: `Message · ${m.name}`, date: m.createdAt.toISOString() })),
    ...latestRegs.map((r) => ({ kind: "registration", id: r.id, label: `Formation · ${r.name}`, date: r.createdAt.toISOString() })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  return Response.json({
    period,
    cards: {
      totalMembers: totals[0][0]?.value ?? 0,
      activeMembers: totals[1][0]?.value ?? 0,
      totalAdmins: totals[2][0]?.value ?? 0,
      totalQuotes: totals[3][0]?.value ?? 0,
      totalMessages: totals[4][0]?.value ?? 0,
      totalRegistrations: totals[5][0]?.value ?? 0,
      newMembers: { value: newMembers, delta: delta(newMembers, newMembersPrev) },
      quotes: { value: quoteRows.filter((r) => inCur(r.createdAt)).length, delta: delta(quoteRows.filter((r) => inCur(r.createdAt)).length, quoteRows.filter((r) => inPrev(r.createdAt)).length) },
      activities: { value: curActivity.length, delta: delta(curActivity.length, prevActivity.length) },
      failedLogins: { value: failed(curActivity), delta: delta(failed(curActivity), failed(prevActivity)) },
      logins: { value: logins(curActivity), delta: delta(logins(curActivity), logins(prevActivity)) },
    },
    series,
    roles: Object.entries(roleCounts).map(([role, countValue]) => ({ role, count: countValue })),
    recent: recentRows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    notifications: {
      totalNew: (newQuotes[0]?.value ?? 0) + (newMessages[0]?.value ?? 0) + (newRegs[0]?.value ?? 0),
      items: notifications,
    },
  });
}
