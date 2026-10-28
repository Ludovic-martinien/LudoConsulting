"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import type { CombinedUser } from "@/lib/admin-stats";

type SortKey = "name" | "role" | "createdAt" | "lastLogin";

export function AdminUsersTable({ users }: { users: CombinedUser[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const roles = useMemo(() => [...new Set(users.map((user) => user.role))].sort(), [users]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const list = users.filter((user) => {
      if (role !== "all" && user.role !== role) return false;
      if (status === "active" && !user.active) return false;
      if (status === "suspended" && user.active) return false;
      if (search && !`${user.name} ${user.email}`.toLowerCase().includes(search)) return false;
      return true;
    });
    const valueOf = (user: CombinedUser) => {
      if (sortKey === "name") return user.name.toLowerCase();
      if (sortKey === "role") return user.role;
      if (sortKey === "lastLogin") return user.lastLogin ? +new Date(user.lastLogin) : 0;
      return +new Date(user.createdAt);
    };
    return [...list].sort((a, b) => {
      const left = valueOf(a);
      const right = valueOf(b);
      if (left < right) return -1 * sortDir;
      if (left > right) return 1 * sortDir;
      return 0;
    });
  }, [users, query, role, status, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * perPage, current * perPage);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <button type="button" className="table-sort" onClick={() => toggleSort(column)}>
      {label} <ArrowDownUp size={11} />
    </button>
  );

  return (
    <div>
      <div className="filter-row">
        <label className="hidden-field" htmlFor="users-search">Rechercher un utilisateur</label>
        <input id="users-search" className="search-input" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Rechercher nom ou e-mail…" />
        <label className="hidden-field" htmlFor="users-role">Filtrer par rôle</label>
        <select id="users-role" className="admin-select" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}>
          <option value="all">Tous les rôles</option>
          {roles.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="hidden-field" htmlFor="users-status">Filtrer par statut</label>
        <select id="users-status" className="admin-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
        </select>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state"><h3>Aucun utilisateur correspondant</h3><p>Modifiez la recherche ou les filtres.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th><SortButton column="name" label="Nom / e-mail" /></th><th><SortButton column="role" label="Rôle" /></th><th><SortButton column="createdAt" label="Inscription" /></th><th><SortButton column="lastLogin" label="Dernière connexion" /></th><th>Statut</th></tr></thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>{user.kind === "staff" ? "Staff" : "Membre"}</td>
                  <td><strong>{user.name}</strong><br /><small>{user.email}</small></td>
                  <td><span className="status-label">{user.role}</span></td>
                  <td>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(user.createdAt))}</td>
                  <td>{user.lastLogin ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(user.lastLogin)) : "—"}</td>
                  <td><span className="status-label">{user.active ? "Actif" : "Suspendu"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="pager">
          <button type="button" className="button button-outline-dark button-small" disabled={current <= 1} onClick={() => setPage((value) => value - 1)}>Précédent</button>
          <span>Page {current} / {pages} · {filtered.length} utilisateur(s)</span>
          <button type="button" className="button button-outline-dark button-small" disabled={current >= pages} onClick={() => setPage((value) => value + 1)}>Suivant</button>
        </div>
      )}
    </div>
  );
}
