"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Search, UserCheck, UserX, X } from "lucide-react";
import { adminFetch } from "@/components/admin-http";

type Row = {
  key: string; kind: "member" | "admin"; id: number; name: string; email: string;
  role: string; isActive: boolean; lastLoginAt: string | null; createdAt: string;
};

type AccountDetail = {
  user: Record<string, string | number | boolean | null>;
  quotes: { id: number; referenceNumber: string; status: string; createdAt: string }[];
  registrations: { id: number; status: string; createdAt: string }[];
};

const roleLabels: Record<string, string> = { member: "Membre", admin: "Administrateur", editor: "Éditeur", sales: "Commercial" };

export function AdminUsers({ initialQuery, initialRole }: { initialQuery: string; initialRole: string }) {
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState(["member", "admin", "editor", "sales"].includes(initialRole) ? initialRole : "all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Row[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(input);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [input]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q: query, role, status, sort, order, page: String(page), perPage: "10" });
      const response = await adminFetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error("Chargement impossible.");
      setData(await response.json());
    } catch {
      setError("La liste des utilisateurs n'a pas pu être chargée.");
    } finally {
      setLoading(false);
    }
  }, [query, role, status, sort, order, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(key: string) {
    setDetailKey(key);
    setAccount(null);
    setAccountLoading(true);
    setMessage("");
    try {
      const response = await adminFetch(`/api/admin/users/${encodeURIComponent(key)}`);
      if (!response.ok) throw new Error("Fiche introuvable.");
      setAccount(await response.json());
    } catch {
      setDetailKey(null);
      setMessage("La fiche n'a pas pu être chargée.");
    } finally {
      setAccountLoading(false);
    }
  }

  async function patchUser(patch: Record<string, unknown>, confirmText?: string) {
    if (!detailKey) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setMessage("");
    try {
      const response = await adminFetch(`/api/admin/users/${encodeURIComponent(detailKey)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Opération refusée.");
      setMessage("Modification enregistrée.");
      load();
      openDetail(detailKey);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Opération impossible.");
    }
  }

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <section className="admin-content">
      <div className="admin-title-row"><div><h1>Utilisateurs</h1><p>Membres inscrits et comptes d'administration, avec leurs rôles et statuts réels.</p></div></div>
      {message ? <div className="admin-alert" role="status">{message}</div> : null}
      <div className="dash-filters">
        <label className="dash-search dash-search-inline"><Search size={15} aria-hidden="true" /><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Rechercher nom ou e-mail…" aria-label="Rechercher" maxLength={120} /></label>
        <select className="admin-select" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Filtrer par rôle">
          <option value="all">Tous les rôles</option>
          <option value="member">Membre</option>
          <option value="admin">Administrateur</option>
          <option value="editor">Éditeur</option>
          <option value="sales">Commercial</option>
        </select>
        <select className="admin-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filtrer par statut">
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Désactivés</option>
        </select>
        <select className="admin-select" value={`${sort}:${order}`} onChange={(e) => { const [s, o] = e.target.value.split(":"); setSort(s); setOrder(o as "asc" | "desc"); }} aria-label="Trier par">
          <option value="recent:desc">Inscription ↓</option>
          <option value="recent:asc">Inscription ↑</option>
          <option value="name:asc">Nom A→Z</option>
          <option value="name:desc">Nom Z→A</option>
          <option value="email:asc">E-mail A→Z</option>
          <option value="lastLogin:desc">Dernière connexion ↓</option>
        </select>
      </div>

      {error ? <div className="admin-alert error" role="alert">{error}</div> : null}
      {loading || !data ? (
        <div className="dash-skeleton dash-skeleton-table" aria-hidden="true" />
      ) : data.total === 0 ? (
        <div className="empty-state"><h3>Aucun compte trouvé</h3><p>Modifiez la recherche ou les filtres.</p></div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Compte</th><th>Rôle</th><th>Statut</th><th>Inscription</th><th>Dernière connexion</th><th>Actions</th></tr></thead>
              <tbody>
                {data.items.map((row) => (
                  <tr key={row.key}>
                    <td><strong>{row.name}</strong><br /><small>{row.email}</small></td>
                    <td><span className={`role-badge is-${row.role}`}>{roleLabels[row.role] ?? row.role}</span></td>
                    <td>{row.isActive ? <span className="status-pill is-good">Actif</span> : <span className="status-pill is-bad">Désactivé</span>}</td>
                    <td>{fmtDate(row.createdAt)}</td>
                    <td>{fmtDate(row.lastLoginAt)}</td>
                    <td><button type="button" className="button button-outline-dark button-small" onClick={() => openDetail(row.key)}><Eye size={14} /> Voir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dash-pagination">
            <button type="button" className="button button-outline-dark button-small" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>← Précédent</button>
            <span>Page {data.page} / {data.totalPages} · {data.total} compte{data.total > 1 ? "s" : ""}</span>
            <button type="button" className="button button-outline-dark button-small" disabled={data.page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Suivant →</button>
          </div>
        </>
      )}

      {detailKey ? (
        <div className="dash-drawer-backdrop" onClick={() => setDetailKey(null)} role="presentation">
          <aside className="dash-drawer" role="dialog" aria-label="Fiche du compte" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="dash-icon-btn" onClick={() => setDetailKey(null)} aria-label="Fermer"><X size={18} /></button>
            {accountLoading || !account ? (
              <p className="dash-empty">Chargement de la fiche…</p>
            ) : (
              <AccountDetailView
                detail={account}
                isAdminKind={detailKey.startsWith("admin:")}
                fmtDate={fmtDate}
                patchUser={patchUser}
              />
            )}
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function AccountDetailView({
  detail, isAdminKind, fmtDate, patchUser,
}: {
  detail: AccountDetail;
  isAdminKind: boolean;
  fmtDate: (iso: string | null) => string;
  patchUser: (patch: Record<string, unknown>, confirmText?: string) => void;
}) {
  const active = Boolean(detail.user.isActive);
  return (
    <>
      <h2>{String(detail.user.name || detail.user.email)}</h2>
      <p className="dash-drawer-sub">{String(detail.user.email)} · {String(detail.user.role)}</p>
      <dl className="dash-definition">
        <div><dt>Statut</dt><dd>{active ? "Actif" : "Désactivé"}</dd></div>
        <div><dt>Inscription</dt><dd>{fmtDate(String(detail.user.createdAt ?? ""))}</dd></div>
        <div><dt>Dernière connexion</dt><dd>{detail.user.lastLoginAt ? fmtDate(String(detail.user.lastLoginAt)) : "Jamais"}</dd></div>
        {"phone" in detail.user ? <div><dt>Téléphone</dt><dd>{String(detail.user.phone || "—")}</dd></div> : null}
        {"provider" in detail.user ? <div><dt>Fournisseur</dt><dd>{String(detail.user.provider)}</dd></div> : null}
      </dl>
      {detail.quotes.length > 0 || detail.registrations.length > 0 ? (
        <div className="dash-drawer-activity">
          <h3>Activité du compte</h3>
          {detail.quotes.map((q) => <p key={`q${q.id}`}>Devis {q.referenceNumber} · {q.status} · {fmtDate(q.createdAt)}</p>)}
          {detail.registrations.map((r) => <p key={`r${r.id}`}>Formation #{r.id} · {r.status} · {fmtDate(r.createdAt)}</p>)}
        </div>
      ) : null}
      <div className="dash-drawer-actions">
        {active ? (
          <button type="button" className="button button-outline-dark button-small" onClick={() => patchUser({ isActive: false }, "Désactiver ce compte ? Il ne pourra plus se connecter.")}>
            <UserX size={14} /> Désactiver
          </button>
        ) : (
          <button type="button" className="button button-primary button-small" onClick={() => patchUser({ isActive: true })}>
            <UserCheck size={14} /> Réactiver
          </button>
        )}
        {isAdminKind ? (
          <label className="dash-role-label">Rôle
            <select
              className="admin-select"
              value={String(detail.user.role)}
              onChange={(e) => patchUser({ role: e.target.value }, `Passer ce compte au rôle « ${e.target.selectedOptions[0].text} » ?`)}
            >
              <option value="admin">Administrateur</option>
              <option value="editor">Éditeur</option>
              <option value="sales">Commercial</option>
            </select>
          </label>
        ) : null}
      </div>
    </>
  );
}
