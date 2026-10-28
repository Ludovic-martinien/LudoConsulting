"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { DashboardStats, PeriodKey } from "@/lib/admin-stats";
import { BarChart, ComparisonBars, DonutChart, LineChart } from "@/components/admin-charts";

const ROLE_COLORS: Record<string, string> = { admin: "#0b483e", editor: "#2f7d4f", sales: "#b6893d", member: "#5b8dd9" };

export function AdminStatsView({ initial }: { initial: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initial);
  const [period, setPeriod] = useState<PeriodKey>(initial.period);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (nextPeriod: PeriodKey) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/stats?period=${nextPeriod}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Statistiques indisponibles.");
      setStats(await response.json() as DashboardStats);
      setPeriod(nextPeriod);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => { void load(period); }, 60_000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodLabel = period === "7d" ? "7 derniers jours" : period === "30d" ? "30 derniers jours" : "12 derniers mois";

  return (
    <div>
      <div className="dashboard-toolbar">
        <div className="period-tabs" role="tablist" aria-label="Période d'analyse">
          {(["7d", "30d", "12m"] as PeriodKey[]).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={period === key} className={period === key ? "is-active" : ""} onClick={() => void load(key)} disabled={loading}>
              {key === "7d" ? "7 jours" : key === "30d" ? "30 jours" : "12 mois"}
            </button>
          ))}
        </div>
        <button type="button" className="button button-outline-dark button-small" onClick={() => void load(period)} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin-icon" : ""} /> Actualiser
        </button>
      </div>
      {error && <div className="admin-alert error" role="alert">{error}</div>}
      <div className="stat-grid">
        {[
          { title: "Inscriptions", value: stats.comparison.current.registrations },
          { title: "Connexions", value: stats.comparison.current.logins },
          { title: "Demandes", value: stats.comparison.current.requests },
        ].map((item) => (
          <article className="stat-card" key={item.title}>
            <div className="stat-body">
              <span className="stat-title">{item.title} · {periodLabel}</span>
              <strong className="stat-value">{new Intl.NumberFormat("fr-FR").format(item.value)}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section>
          <h2 className="admin-section-title">Évolution des inscriptions</h2>
          {stats.series.registrations.every((point) => point.count === 0)
            ? <div className="empty-state"><h3>Aucune donnée sur la période</h3></div>
            : <LineChart data={stats.series.registrations} />}
        </section>
        <section>
          <h2 className="admin-section-title">Évolution des connexions</h2>
          {stats.series.logins.every((point) => point.count === 0)
            ? <div className="empty-state"><h3>Aucune donnée sur la période</h3></div>
            : <LineChart data={stats.series.logins} color="#2f7d4f" />}
        </section>
        <section>
          <h2 className="admin-section-title">Répartition par rôle</h2>
          <DonutChart data={stats.roles.map((item) => ({ label: item.role, count: item.count, color: ROLE_COLORS[item.role] ?? "#7a8a80" }))} />
        </section>
        <section>
          <h2 className="admin-section-title">Activité par type d'événement</h2>
          {stats.actions.length === 0
            ? <div className="empty-state"><h3>Aucune donnée sur la période</h3></div>
            : <BarChart data={stats.actions.map((item) => ({ label: item.action, count: item.count }))} />}
        </section>
      </div>
      <h2 className="admin-section-title" style={{ marginTop: 8 }}>Comparaison avec la période précédente</h2>
      <ComparisonBars
        current={[stats.comparison.current.registrations, stats.comparison.current.logins, stats.comparison.current.requests]}
        previous={[stats.comparison.previous.registrations, stats.comparison.previous.logins, stats.comparison.previous.requests]}
        labels={["Inscriptions", "Connexions", "Demandes"]}
      />
      <h2 className="admin-section-title" style={{ marginTop: 26 }}>Évolution détaillée</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Période</th><th>Inscriptions</th><th>Connexions</th></tr></thead>
          <tbody>
            {stats.series.registrations.map((point, index) => (
              <tr key={point.key}>
                <td><strong>{point.label}</strong></td>
                <td>{point.count}</td>
                <td>{stats.series.logins[index]?.count ?? 0}</td>
              </tr>
            ))}
            <tr><td><strong>Total</strong></td><td><strong>{stats.series.registrations.reduce((sum, point) => sum + point.count, 0)}</strong></td><td><strong>{stats.series.logins.reduce((sum, point) => sum + point.count, 0)}</strong></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
