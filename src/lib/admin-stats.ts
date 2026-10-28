import "server-only";
import { and, count, desc, eq, gte, ilike, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  activityLogs,
  adminUsers,
  contactMessages,
  memberLoginEvents,
  memberSessions,
  memberUsers,
  quoteRequests,
  registrations,
} from "@/db/schema";

export type PeriodKey = "7d" | "30d" | "12m";

export function periodRange(period: PeriodKey) {
  const end = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 365;
  const start = new Date(end.getTime() - days * 86_400_000);
  const prevStart = new Date(start.getTime() - days * 86_400_000);
  return { start, end, prevStart, bucket: (period === "12m" ? "month" : "day") as "month" | "day" };
}

type BucketRow = { bucket: string; count: string | number };

async function seriesFor(kind: "members" | "logins", start: Date, end: Date, bucket: "day" | "month") {
  const table = kind === "members" ? memberUsers : memberLoginEvents;
  const column = kind === "members" ? memberUsers.createdAt : memberLoginEvents.createdAt;
  const rows = (await db.select({
    bucket: sql<string>`to_char(date_trunc(${sql.raw(`'${bucket}'`)}, ${column}), 'YYYY-MM-DD')`,
    count: count(),
  }).from(table).where(and(gte(column, start), lt(column, end))).groupBy(sql`1`)) as BucketRow[];
  return rows.map((row) => ({ bucket: row.bucket, count: Number(row.count) }));
}

function fillSeries(
  data: { bucket: string; count: number }[],
  start: Date,
  end: Date,
  bucket: "day" | "month",
) {
  const width = bucket === "month" ? 7 : 10;
  const byKey = new Map(data.map((row) => [row.bucket.slice(0, width), row.count]));
  const points: { key: string; label: string; count: number }[] = [];
  if (bucket === "month") {
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    while (cursor <= last) {
      const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
      points.push({
        key,
        label: new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(cursor),
        count: byKey.get(key) ?? 0,
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return points;
  }
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cursor <= last) {
    const key = cursor.toISOString().slice(0, 10);
    points.push({
      key,
      label: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(cursor),
      count: byKey.get(key) ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return points;
}

async function rangeCount(
  table: typeof quoteRequests | typeof contactMessages | typeof registrations | typeof memberUsers | typeof memberLoginEvents | typeof activityLogs,
  start: Date,
  end: Date,
) {
  const column = table.createdAt;
  const [row] = await db.select({ value: count() }).from(table)
    .where(and(gte(column, start), lt(column, end)));
  return row?.value ?? 0;
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export async function getDashboardStats(period: PeriodKey) {
  const { start, end, prevStart, bucket } = periodRange(period);

  const [
    regCur, regPrev, loginCur, loginPrev,
    quoteCur, quotePrev, msgCur, msgPrev, trainCur, trainPrev, actCur, actPrev,
    totalMembers, activeSessions, admins, totalActivities,
  ] = await Promise.all([
    rangeCount(memberUsers, start, end), rangeCount(memberUsers, prevStart, start),
    rangeCount(memberLoginEvents, start, end), rangeCount(memberLoginEvents, prevStart, start),
    rangeCount(quoteRequests, start, end), rangeCount(quoteRequests, prevStart, start),
    rangeCount(contactMessages, start, end), rangeCount(contactMessages, prevStart, start),
    rangeCount(registrations, start, end), rangeCount(registrations, prevStart, start),
    rangeCount(activityLogs, start, end), rangeCount(activityLogs, prevStart, start),
    db.select({ value: count() }).from(memberUsers).then((rows) => rows[0]?.value ?? 0),
    db.select({ value: count() }).from(memberSessions).where(gte(memberSessions.expiresAt, new Date())).then((rows) => rows[0]?.value ?? 0),
    db.select({ value: count() }).from(adminUsers).then((rows) => rows[0]?.value ?? 0),
    db.select({ value: count() }).from(activityLogs).then((rows) => rows[0]?.value ?? 0),
  ]);

  const [regSeriesRaw, loginSeriesRaw, rolesRows, actionsRaw, newQuotes, newMessages, newTrainings, newQuotesCount] = await Promise.all([
    seriesFor("members", start, end, bucket),
    seriesFor("logins", start, end, bucket),
    db.select({ role: adminUsers.role, value: count() }).from(adminUsers).groupBy(adminUsers.role),
    db.select({ action: activityLogs.action, value: count() }).from(activityLogs)
      .where(and(gte(activityLogs.createdAt, start), lt(activityLogs.createdAt, end)))
      .groupBy(activityLogs.action).orderBy(desc(count())).limit(8),
    db.select({ id: quoteRequests.id, label: quoteRequests.referenceNumber, sub: quoteRequests.name, createdAt: quoteRequests.createdAt }).from(quoteRequests).where(eq(quoteRequests.status, "new")).orderBy(desc(quoteRequests.createdAt)).limit(4),
    db.select({ id: contactMessages.id, label: contactMessages.subject, sub: contactMessages.name, createdAt: contactMessages.createdAt }).from(contactMessages).where(eq(contactMessages.status, "new")).orderBy(desc(contactMessages.createdAt)).limit(4),
    db.select({ id: registrations.id, label: registrations.name, sub: registrations.email, createdAt: registrations.createdAt }).from(registrations).where(eq(registrations.status, "new")).orderBy(desc(registrations.createdAt)).limit(4),
    db.select({ value: count() }).from(quoteRequests).where(eq(quoteRequests.status, "new")).then((rows) => rows[0]?.value ?? 0),
  ]);

  const delta = (cur: number, prev: number) => (prev === 0 ? (cur === 0 ? null : 100) : Math.round(((cur - prev) / prev) * 100));

  const requestsCur = quoteCur + msgCur + trainCur;
  const requestsPrev = quotePrev + msgPrev + trainPrev;

  const notifications = [
    ...newQuotes.map((item) => ({ kind: "quote" as const, ...item })),
    ...newMessages.map((item) => ({ kind: "message" as const, ...item })),
    ...newTrainings.map((item) => ({ kind: "training" as const, ...item })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);

  return {
    period,
    cards: {
      members: { total: totalMembers, current: regCur, delta: delta(regCur, regPrev) },
      activeSessions: { total: activeSessions, current: activeSessions, delta: null as number | null },
      admins: { total: admins, current: admins, delta: null as number | null },
      registrations: { total: regCur, current: regCur, delta: delta(regCur, regPrev) },
      logins: { total: loginCur, current: loginCur, delta: delta(loginCur, loginPrev) },
      requests: { total: requestsCur, current: requestsCur, delta: delta(requestsCur, requestsPrev) },
      activities: { total: totalActivities, current: actCur, delta: delta(actCur, actPrev) },
    },
    series: {
      registrations: fillSeries(regSeriesRaw, start, end, bucket),
      logins: fillSeries(loginSeriesRaw, start, end, bucket),
    },
    roles: [
      ...rolesRows.map((row) => ({ role: row.role, count: Number(row.value) })),
      { role: "member", count: totalMembers },
    ],
    actions: actionsRaw.map((row) => ({ action: row.action, count: Number(row.value) })),
    comparison: {
      current: { registrations: regCur, logins: loginCur, requests: requestsCur },
      previous: { registrations: regPrev, logins: loginPrev, requests: requestsPrev },
    },
    notifications,
    notificationCount: newQuotesCount
      + await db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "new")).then((rows) => rows[0]?.value ?? 0)
      + await db.select({ value: count() }).from(registrations).where(eq(registrations.status, "new")).then((rows) => rows[0]?.value ?? 0),
  };
}

export type CombinedUser = {
  kind: "member" | "staff";
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: Date;
  lastLogin: Date | null;
  active: boolean;
};

export async function getUsersOverview(): Promise<CombinedUser[]> {
  const [members, staff, lastLogins] = await Promise.all([
    db.select().from(memberUsers).orderBy(desc(memberUsers.createdAt)),
    db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt)),
    db.select({ userId: memberLoginEvents.userId, last: sql<Date>`max(${memberLoginEvents.createdAt})` })
      .from(memberLoginEvents).groupBy(memberLoginEvents.userId),
  ]);
  const lastByUser = new Map<number, Date>(lastLogins.map((row) => [row.userId, new Date(row.last as unknown as string)]));
  return [
    ...staff.map((user) => ({
      kind: "staff" as const,
      id: `staff-${user.id}`,
      name: user.name ?? user.email.split("@")[0],
      email: user.email,
      role: user.role,
      verified: true,
      createdAt: user.createdAt,
      lastLogin: user.lastLoginAt,
      active: user.isActive,
    })),
    ...members.map((user) => ({
      kind: "member" as const,
      id: `member-${user.id}`,
      name: user.name,
      email: user.email,
      role: "member",
      verified: user.emailVerified,
      createdAt: user.createdAt,
      lastLogin: lastByUser.get(user.id) ?? null,
      active: true,
    })),
  ];
}

export type RoleOverview = {
  role: string;
  count: number;
  users: { name: string; email: string; active: boolean; createdAt: Date; lastLogin: Date | null }[];
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["Tout le tableau de bord et les statistiques", "Gestion des utilisateurs et des rôles", "Gestion des contenus (services, projets, articles, médias)", "Traitement des demandes et suppression de comptes", "Journal d'activité complet"],
  editor: ["Gestion des contenus (services, projets, articles, médias)", "Tableau de bord et statistiques"],
  sales: ["Traitement des demandes (devis, messages, inscriptions)", "Tableau de bord et statistiques"],
  member: ["Espace personnel Mon compte", "Formulaires pré-remplis", "Suivi de ses propres demandes", "Suppression de son propre compte"],
};

export async function getRolesOverview(): Promise<{ roles: RoleOverview[]; permissions: Record<string, string[]> }> {
  const users = await getUsersOverview();
  const byRole = new Map<string, CombinedUser[]>();
  for (const user of users) {
    const list = byRole.get(user.role) ?? [];
    list.push(user);
    byRole.set(user.role, list);
  }
  return {
    roles: [...byRole.entries()].map(([role, list]) => ({
      role,
      count: list.length,
      users: list.slice(0, 50).map((user) => ({ name: user.name, email: user.email, active: user.active, createdAt: user.createdAt, lastLogin: user.lastLogin })),
    })),
    permissions: ROLE_PERMISSIONS,
  };
}

export async function searchAll(query: string) {
  const like = `%${query.slice(0, 80).replace(/[%_]/g, "")}%`;
  if (!like.replace(/%/g, "").trim()) return { members: [], quotes: [], messages: [] };
  const [members, quotes, messages] = await Promise.all([
    db.select({ id: memberUsers.id, name: memberUsers.name, email: memberUsers.email }).from(memberUsers)
      .where(or(ilike(memberUsers.name, like), ilike(memberUsers.email, like))).limit(5),
    db.select({ id: quoteRequests.id, referenceNumber: quoteRequests.referenceNumber, name: quoteRequests.name }).from(quoteRequests)
      .where(or(ilike(quoteRequests.referenceNumber, like), ilike(quoteRequests.name, like), ilike(quoteRequests.email, like))).limit(5),
    db.select({ id: contactMessages.id, subject: contactMessages.subject, name: contactMessages.name }).from(contactMessages)
      .where(or(ilike(contactMessages.subject, like), ilike(contactMessages.name, like), ilike(contactMessages.email, like))).limit(5),
  ]);
  return { members, quotes, messages };
}

export async function getActivityFeed(params: { page: number; action?: string; actor?: string; from?: string; to?: string }) {
  const perPage = 20;
  const page = Math.max(1, params.page || 1);
  const conditions = [];
  if (params.action) conditions.push(eq(activityLogs.action, params.action));
  if (params.actor) conditions.push(ilike(activityLogs.adminEmail, `%${params.actor.slice(0, 80).replace(/[%_]/g, "")}%`));
  if (params.from) conditions.push(gte(activityLogs.createdAt, new Date(`${params.from}T00:00:00Z`)));
  if (params.to) conditions.push(lt(activityLogs.createdAt, new Date(`${params.to}T00:00:00Z`)));
  const where = conditions.length ? and(...conditions) : undefined;
  const [items, totalRows, actionRows] = await Promise.all([
    db.select().from(activityLogs).where(where as never).orderBy(desc(activityLogs.createdAt)).limit(perPage).offset((page - 1) * perPage),
    db.select({ value: count() }).from(activityLogs).where(where as never).then((rows) => rows[0]?.value ?? 0),
    db.select({ action: activityLogs.action }).from(activityLogs).groupBy(activityLogs.action).orderBy(activityLogs.action),
  ]);
  return { items, total: totalRows, pages: Math.max(1, Math.ceil(totalRows / perPage)), page, actions: actionRows.map((row) => row.action) };
}
