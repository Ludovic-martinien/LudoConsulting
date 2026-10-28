"use client";

import { useCallback, useEffect, useState } from "react";
import { actionLabel } from "@/lib/activity-labels";

type FeedItem = {
  id: number;
  adminEmail: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  details: Record<string, unknown>;
};

type FeedResponse = { items: FeedItem[]; total: number; pages: number; page: number; actions: string[] };

export function AdminActivityTable() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (nextPage: number, filters: { action: string; actor: string; from: string; to: string }) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(nextPage) });
      if (filters.action) params.set("action", filters.action);
      if (filters.actor.trim()) params.set("actor", filters.actor.trim());
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const response = await fetch(`/api/admin/activity?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Journal indisponible.");
      const data = await response.json() as FeedResponse;
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
      setActions(data.actions);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1, { action: "", actor: "", from: "", to: "" });
  }, [load]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    void load(1, { action, actor, from, to });
  }

  function resetFilters() {
    setAction("");
    setActor("");
    setFrom("");
    setTo("");
    void load(1, { action: "", actor: "", from: "", to: "" });
  }

  return (
    <div>
      <form className="filter-row" onSubmit={applyFilters}>
        <label className="hidden-field" htmlFor="activity-action">Type d'action</label>
        <select id="activity-action" className="admin-select" value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="">Toutes les actions</option>
          {actions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="hidden-field" htmlFor="activity-actor">Acteur</label>
        <input id="activity-actor" className="search-input" value={actor} onChange={(event) => setActor(event.target.value)} placeholder="Acteur (e-mail)…" />
        <label className="hidden-field" htmlFor="activity-from">Depuis le</label>
        <input id="activity-from" className="admin-input" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <label className="hidden-field" htmlFor="activity-to">Jusqu'au</label>
        <input id="activity-to" className="admin-input" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <button type="submit" className="button button-primary button-small" disabled={loading}>Filtrer</button>
        <button type="button" className="button button-outline-dark button-small" onClick={resetFilters} disabled={loading}>Réinitialiser</button>
      </form>
      {error && <div className="admin-alert error" role="alert">{error}</div>}
      {loading ? (
        <div className="empty-state"><h3>Chargement du journal…</h3></div>
      ) : items.length === 0 ? (
        <div className="empty-state"><h3>Aucun événement correspondant</h3><p>Les actions du site apparaîtront ici dès qu'elles seront enregistrées.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date et heure</th><th>Acteur</th><th>Action</th><th>Objet</th><th>Résultat</th></tr></thead>
            <tbody>
              {items.map((item) => {
                const details = item.details ?? {};
                const actorType = typeof details.actorType === "string" ? details.actorType : "admin";
                const result = typeof details.result === "string" ? details.result : "success";
                return (
                  <tr key={item.id}>
                    <td>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}</td>
                    <td><strong>{item.adminEmail}</strong><br /><small>{actorType}</small></td>
                    <td>{actionLabel(item.action, "fr")}<br /><small>{item.action}</small></td>
                    <td>{item.entityType ? `${item.entityType}${item.entityId ? ` #${item.entityId}` : ""}` : "—"}</td>
                    <td><span className="status-label">{result === "failure" ? "Échec" : "Succès"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="pager">
        <button type="button" className="button button-outline-dark button-small" disabled={page <= 1 || loading} onClick={() => void load(page - 1, { action, actor, from, to })}>Précédent</button>
        <span>Page {page} / {pages} · {total} événement(s)</span>
        <button type="button" className="button button-outline-dark button-small" disabled={page >= pages || loading} onClick={() => void load(page + 1, { action, actor, from, to })}>Suivant</button>
      </div>
    </div>
  );
}
