import { desc } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, users } from "@/db/schema";
import { authorizeAdmin, isResponse } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type Row = {
  key: string;
  kind: "member" | "admin";
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") || "").trim().toLowerCase();
  const role = params.get("role") || "all";
  const status = params.get("status") || "all";
  const sort = params.get("sort") || "recent";
  const order = params.get("order") === "asc" ? 1 : -1;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const perPage = Math.min(50, Math.max(5, Number(params.get("perPage")) || 10));

  const [memberRows, adminRows] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(2000),
    db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt)).limit(200),
  ]);
  let items: Row[] = [
    ...memberRows.map((u) => ({
      key: `member:${u.id}`,
      kind: "member" as const,
      id: u.id,
      name: u.name,
      email: u.email,
      role: "member",
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    })),
    ...adminRows.map((u) => ({
      key: `admin:${u.id}`,
      kind: "admin" as const,
      id: u.id,
      name: u.name || u.email.split("@")[0],
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    })),
  ];
  if (q) items = items.filter((i) => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
  if (role !== "all") items = items.filter((i) => i.role === role);
  if (status === "active") items = items.filter((i) => i.isActive);
  if (status === "inactive") items = items.filter((i) => !i.isActive);
  const by: Record<string, (a: Row, b: Row) => number> = {
    recent: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
    name: (a, b) => a.name.localeCompare(b.name, "fr"),
    email: (a, b) => a.email.localeCompare(b.email),
    lastLogin: (a, b) => (a.lastLoginAt || "") < (b.lastLoginAt || "") ? 1 : -1,
  };
  const sorter = by[sort] ?? by.recent;
  items = [...items].sort((a, b) => sorter(a, b) * order);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  return Response.json({
    items: items.slice((safePage - 1) * perPage, safePage * perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
  });
}
