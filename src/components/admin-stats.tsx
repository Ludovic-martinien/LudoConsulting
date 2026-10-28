"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { adminFetch } from "@/components/admin-http";
import { AreaChart, BarChart, CHART_COLORS } from "@/components/admin-charts";

type Stats = {
  period: string;
  cards: {
    newMembers: { value: number; delta: number | null };
    quotes: { value: number; delta: number | null };
    activities: { value: number; delta: number | null };
    failedLogins: { value: number; delta: number | null };
    logins: { value: number; delta: number | null };
  };
  series: { label: string; signups: number; logins: number; failed: number; activity: number }[];
};

const PERIODS = [
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "12m", label: "12 mois" },
];

function previousValue(value: number, delta: number | null): string {
  if (delta === null) return "—";
  if (delta === 0) return String(value);
  const prev = value / (1 + delta / 100);
  return String(Math.max(0, Math.round(prev)));
}

export function AdminStats() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminFetch(`/api/admin/stats?period=${period}`);
      if (!response.ok) throw new Error("Chargement impossible.");
      setData(await response.json());
    } catch {
      setError("Les statistiques n'ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = data ? [
    { label: "Nouveaux membres", cur: data.cards.newMembers.value, delta: data.cards.newMembers.delta },
    { label: "Devis reçus", cur: data.cards.quotes.value, delta: data.cards.quotes.delta },
    { label: "Connexions réussies", cur: data.cards.logins.value, delta: data.cards.logins.delta },
    { label: "Échecs de connexion", cur: data.cards.failedLogins.value, delta: data.cards.failedLogins.delta },
    { label: "Activités enregistrées", cur: data.cards.activities.value, delta: data.cards.activities.delta },
  ] : [];

  return (
    <section className="admin-content">
      <div className="admin-title-row">
        <div><h1>Statistiques et rapports</h1><p>Comparaison avec la période précédente équivalente, calculée depuis les données réelles.</p></div>
        <div className="dash-toolbar">
          <div className="dash-period" role="group" aria-label="Période">
            {PERIODS.map((p) => (
              <button key={p.id} type="button" className={period === p.id ? "is-current" : ""} onClick={() => setPeriod(p.id)}>{p.label}</button>
            ))}
          </div>
          <button type="button" className="button button-outline-dark button-small" onClick={() => load()}><RefreshCw size={14} /> Actualiser</button>
        </div>
      </div>
      {error ? <div className="admin-alert error" role="alert">{error}</div> : null}
      {loading || !data ? (
        <div className="dash-skeleton dash-skeleton-table" aria-hidden="true" />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Indicateur</th><th>Période actuelle</th><th>Période précédente</th><th>Évolution</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td><strong>{row.label}</strong></td>
                    <td>{row.cur.toLocaleString("fr-FR")}</td>
                    <td>{previousValue(row.cur, row.delta)}</td>
                    <td>{row.delta === null ? <span className="dash-delta flat">—</span> : <span className={`dash-delta ${row.delta >= 0 ? "up" : "down"}`}>{row.delta >= 0 ? "+" : ""}{row.delta} %</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dash-grid-2">
            <article className="dash-panel">
              <h2>Inscriptions et connexions</h2>
              <AreaChart
                labels={data.series.map((s) => s.label)}
                series={[
                  { name: "Inscriptions", color: CHART_COLORS[0], values: data.series.map((s) => s.signups) },
                  { name: "Connexions", color: CHART_COLORS[1], values: data.series.map((s) => s.logins) },
                ]}
              />
            </article>
            <article className="dash-panel">
              <h2>Tentatives échouées</h2>
              <BarChart
                labels={data.series.map((s) => s.label)}
                series={[{ name: "Échecs", color: CHART_COLORS[3], values: data.series.map((s) => s.failed) }]}
              />
            </article>
          </div>
          <article className="dash-panel">
            <h2>Détail par {period === "12m" ? "mois" : "jour"}</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Période</th><th>Inscriptions</th><th>Connexions</th><th>Échecs</th><th>Activités</th></tr></thead>
                <tbody>
                  {data.series.map((row) => (
                    <tr key={row.label}>
                      <td><strong>{row.label}</strong></td>
                      <td>{row.signups}</td>
                      <td>{row.logins}</td>
                      <td>{row.failed}</td>
                      <td>{row.activity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </section>
  );
}
