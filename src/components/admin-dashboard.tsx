"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Activity, FileText, GraduationCap, Mail, Minus, RefreshCw, ShieldAlert, TrendingDown, TrendingUp, UserCheck, UserPlus, Users } from "lucide-react";
import { adminFetch } from "@/components/admin-http";
import { AreaChart, BarChart, CHART_COLORS, DonutChart } from "@/components/admin-charts";
import { describeAction } from "@/lib/activity-labels";

type Stats = {
  period: string;
  cards: {
    totalMembers: number; activeMembers: number; totalAdmins: number; totalQuotes: number;
    totalMessages: number; totalRegistrations: number;
    newMembers: { value: number; delta: number | null };
    quotes: { value: number; delta: number | null };
    activities: { value: number; delta: number | null };
    failedLogins: { value: number; delta: number | null };
    logins: { value: number; delta: number | null };
  };
  series: { label: string; signups: number; logins: number; failed: number; activity: number }[];
  roles: { role: string; count: number }[];
  recent: { id: number; action: string; actorType: string; actorEmail: string | null; success: boolean; createdAt: string }[];
};

function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) return <span className="dash-delta flat"><Minus size={12} /> —</span>;
  if (value === 0) return <span className="dash-delta flat"><Minus size={12} /> 0 %</span>;
  const good = invert ? value < 0 : value > 0;
  return (
    <span className={`dash-delta ${good ? "up" : "down"}`}>
      {value > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {value > 0 ? "+" : ""}{value} %
    </span>
  );
}

const PERIODS = [
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "12m", label: "12 mois" },
];

export function AdminDashboard() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const response = await adminFetch(`/api/admin/stats?period=${period}`);
      if (!response.ok) throw new Error("Chargement impossible.");
      setData((await response.json()) as Stats);
      setUpdatedAt(new Date());
    } catch {
      setError("Les statistiques n'ont pas pu être chargées. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => load(false), 60000);
    return () => clearInterval(timer);
  }, [load]);

  const cards = data ? [
    { label: "Membres inscrits", value: data.cards.totalMembers, icon: Users, delta: null as number | null, invert: false },
    { label: "Membres actifs", value: data.cards.activeMembers, icon: UserCheck, delta: null, invert: false },
    { label: "Nouveaux membres", value: data.cards.newMembers.value, icon: UserPlus, delta: data.cards.newMembers.delta, invert: false },
    { label: "Devis reçus", value: data.cards.quotes.value, icon: FileText, delta: data.cards.quotes.delta, invert: false },
    { label: "Messages reçus", value: data.cards.totalMessages, icon: Mail, delta: null, invert: false },
    { label: "Inscriptions formations", value: data.cards.totalRegistrations, icon: GraduationCap, delta: null, invert: false },
    { label: "Activités", value: data.cards.activities.value, icon: Activity, delta: data.cards.activities.delta, invert: false },
    { label: "Échecs de connexion", value: data.cards.failedLogins.value, icon: ShieldAlert, delta: data.cards.failedLogins.delta, invert: true },
  ] : [];

  return (
    <section className="admin-content dash-page">
      <div className="admin-title-row">
        <div><h1>Vue d'ensemble</h1><p>Indicateurs calculés en direct depuis PostgreSQL{updatedAt ? ` · actualisé à ${updatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}.</p></div>
        <div className="dash-toolbar">
          <div className="dash-period" role="group" aria-label="Période">
            {PERIODS.map((p) => (
              <button key={p.id} type="button" className={period === p.id ? "is-current" : ""} onClick={() => setPeriod(p.id)}>{p.label}</button>
            ))}
          </div>
          <button type="button" className="button button-outline-dark button-small" onClick={() => load(true)}><RefreshCw size={14} /> Actualiser</button>
        </div>
      </div>

      {error ? (
        <div className="admin-alert error" role="alert">{error} <button type="button" className="text-link" onClick={() => load(true)}>Réessayer</button></div>
      ) : null}

      {loading || !data ? (
        <div className="dash-grid-cards">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="dash-skeleton dash-skeleton-card" aria-hidden="true" />)}</div>
      ) : (
        <>
          <div className="dash-grid-cards">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="dash-card" key={card.label}>
                  <span className="dash-card-icon" aria-hidden="true"><Icon size={18} /></span>
                  <div><p>{card.label}</p><strong>{card.value.toLocaleString("fr-FR")}</strong></div>
                  <Delta value={card.delta} invert={card.invert} />
                </article>
              );
            })}
          </div>

          <div className="dash-grid-2">
            <article className="dash-panel">
              <h2>Inscriptions et connexions</h2>
              {data.series.every((s) => s.signups === 0 && s.logins === 0) ? (
                <p className="dash-empty">Aucune inscription ni connexion sur cette période.</p>
              ) : (
                <AreaChart
                  labels={data.series.map((s) => s.label)}
                  series={[
                    { name: "Inscriptions", color: CHART_COLORS[0], values: data.series.map((s) => s.signups) },
                    { name: "Connexions", color: CHART_COLORS[1], values: data.series.map((s) => s.logins) },
                  ]}
                />
              )}
            </article>
            <article className="dash-panel">
              <h2>Répartition par rôle</h2>
              <DonutChart
                data={[
                  { label: "Membres", value: data.roles.find((r) => r.role === "member")?.count ?? 0, color: CHART_COLORS[0] },
                  { label: "Admins", value: data.roles.find((r) => r.role === "admin")?.count ?? 0, color: CHART_COLORS[2] },
                  { label: "Éditeurs", value: data.roles.find((r) => r.role === "editor")?.count ?? 0, color: CHART_COLORS[1] },
                  { label: "Commerciaux", value: data.roles.find((r) => r.role === "sales")?.count ?? 0, color: CHART_COLORS[4] },
                ]}
              />
            </article>
          </div>

          <div className="dash-grid-2">
            <article className="dash-panel">
              <h2>Activité et échecs de connexion</h2>
              {data.series.every((s) => s.activity === 0 && s.failed === 0) ? (
                <p className="dash-empty">Aucune activité enregistrée sur cette période.</p>
              ) : (
                <BarChart
                  labels={data.series.map((s) => s.label)}
                  series={[
                    { name: "Activités", color: CHART_COLORS[0], values: data.series.map((s) => s.activity) },
                    { name: "Échecs", color: CHART_COLORS[3], values: data.series.map((s) => s.failed) },
                  ]}
                />
              )}
            </article>
            <article className="dash-panel">
              <div className="dash-panel-head"><h2>Activité récente</h2><Link href="/admin/activites" className="text-link">Tout voir</Link></div>
              {data.recent.length === 0 ? (
                <p className="dash-empty">Aucun événement enregistré pour le moment.</p>
              ) : (
                <ul className="dash-recent">
                  {data.recent.map((item) => (
                    <li key={item.id}>
                      <span className={`dash-dot ${item.success === false ? "is-bad" : "is-ok"}`} aria-hidden="true" />
                      <div>
                        <strong>{describeAction(item.action).fr}</strong>
                        <small>{item.actorEmail || (item.actorType === "anonymous" ? "Anonyme" : item.actorType)} · {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}
