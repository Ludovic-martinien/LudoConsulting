"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin-http";
import { ACTIVITY_CATEGORIES, describeAction } from "@/lib/activity-labels";

type Item = {
  id: number; action: string; category: string; actorType: string; actorEmail: string | null;
  actorId: string | null; entityType: string | null; entityId: string | null;
  details: Record<string, string | number | boolean | null>; success: boolean; ip: string | null; createdAt: string;
};

export function AdminActivity() {
  const [q, setQ] = useState("");
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("all");
  const [action, setAction] = useState("all");
  const [result, setResult] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Item[]; actions: string[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(input);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [input]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q, category, action, result, from, to, page: String(page), perPage: "15" });
      const response = await adminFetch(`/api/admin/activity?${params.toString()}`);
      if (!response.ok) throw new Error("Chargement impossible.");
      setData(await response.json());
    } catch {
      setError("Le journal n'a pas pu être chargé.");
    } finally {
      setLoading(false);
    }
  }, [q, category, action, result, from, to, page]);

  useEffect(() => {
    load();
  }, [load]);

  function resetPage() {
    setPage(1);
  }

  return (
    <section className="admin-content">
      <div className="admin-title-row"><div><h1>Activités récentes</h1><p>Journal réel des événements : acteur, action, élément concerné et résultat. Aucun mot de passe ni secret n'y figure.</p></div></div>
      <div className="dash-filters">
        <input className="search-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Rechercher e-mail, action, identifiant…" aria-label="Rechercher" maxLength={120} />
        <select className="admin-select" value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} aria-label="Filtrer par catégorie">
          <option value="all">Toutes catégories</option>
          {ACTIVITY_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.fr}</option>)}
        </select>
        <select className="admin-select" value={action} onChange={(e) => { setAction(e.target.value); resetPage(); }} aria-label="Filtrer par action">
          <option value="all">Toutes actions</option>
          {(data?.actions ?? []).map((a) => <option key={a} value={a}>{describeAction(a).fr}</option>)}
        </select>
        <select className="admin-select" value={result} onChange={(e) => { setResult(e.target.value); resetPage(); }} aria-label="Filtrer par résultat">
          <option value="all">Succès + échecs</option>
          <option value="success">Succès</option>
          <option value="failed">Échecs</option>
        </select>
        <input className="admin-input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); resetPage(); }} aria-label="Depuis le" />
        <input className="admin-input" type="date" value={to} onChange={(e) => { setTo(e.target.value); resetPage(); }} aria-label="Jusqu'au" />
      </div>
      {error ? <div className="admin-alert error" role="alert">{error}</div> : null}
      {loading || !data ? (
        <div className="dash-skeleton dash-skeleton-table" aria-hidden="true" />
      ) : data.total === 0 ? (
        <div className="empty-state"><h3>Aucun événement trouvé</h3><p>Modifiez les filtres ou la période.</p></div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Date</th><th>Acteur</th><th>Action</th><th>Élément</th><th>Résultat</th><th>IP</th></tr></thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td><strong>{item.actorEmail || (item.actorType === "anonymous" ? "Anonyme" : item.actorType)}</strong><br /><small>{item.actorType}{item.actorId ? ` · #${item.actorId}` : ""}</small></td>
                    <td>{describeAction(item.action).fr}</td>
                    <td>{item.entityType ? `${item.entityType}${item.entityId ? ` #${item.entityId}` : ""}` : "—"}</td>
                    <td>{item.success === false ? <span className="status-pill is-bad">Échec</span> : <span className="status-pill is-good">Succès</span>}</td>
                    <td><small>{item.ip || "—"}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dash-pagination">
            <button type="button" className="button button-outline-dark button-small" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>← Précédent</button>
            <span>Page {data.page} / {data.totalPages} · {data.total} événement{data.total > 1 ? "s" : ""}</span>
            <button type="button" className="button button-outline-dark button-small" disabled={data.page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Suivant →</button>
          </div>
        </>
      )}
    </section>
  );
}
