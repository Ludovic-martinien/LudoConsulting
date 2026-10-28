"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity, ClipboardList, Inbox, LogIn, RefreshCw, ShieldCheck,
  UserPlus, Users, Wifi,
} from "lucide-react";
import type { DashboardStats, PeriodKey } from "@/lib/admin-stats";
import { actionLabel } from "@/lib/activity-labels";
import { BarChart, ComparisonBars, DonutChart, LineChart } from "@/components/admin-charts";

type UsersResponse = { users?: { id: string; name: string; email: string; role: string; createdAt: string }[] };
type ActivityResponse = {
  items?: { id: number; adminEmail: string; action: string; entityType: string | null; entityId: string | null; createdAt: string; details: Record<string, unknown> }[];
};

const ROLE_COLORS: Record<string, string> = { admin: "#0b483e", editor: "#2f7d4f", sales: "#b6893d", member: "#5b8dd9" };

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="stat-delta is-neutral">—</span>;
  if (value === 0) return <span className="stat-delta is-neutral">±0 %</span>;
  return <span className={`stat-delta ${value > 0 ? "is-up" : "is-down"}`}>{value > 0 ? `+${value} %` : `${value} %`}</span>;
}

function StatCard({ icon: Icon, title, value, delta, hint, progress }: {
  icon: typeof Users; title: string; value: number; delta: number | null; hint: string; progress: number;
}) {
  return (
    <article className="stat-card">
      <span className="stat-icon"><Icon size={19} /></span>
      <div className="stat-body">
        <span className="stat-title">{title}</span>
        <strong className="stat-value">{new Intl.NumberFormat("fr-FR").format(value)}</strong>
        <span className="stat-foot"><Delta value={delta} /><small>{hint}</small></span>
        <span className="stat-bar"><i style={{ width: `${Math.max(4, Math.min(100, Math.round(progress * 100)))}%` }} /></span>
      </div>
    </article>
  );
}

export function AdminDashboard({ initial }: { initial: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initial);
  const [period, setPeriod] = useState<PeriodKey>(initial.period);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [recentUsers, setRecentUsers] = useState<NonNullable<UsersResponse["users"]>>([]);
  const [recentActivity, setRecentActivity] = useState<NonNullable<ActivityResponse["items"]>>([]);

  const load = useCallback(async (nextPeriod: PeriodKey) => {
    setLoading(true);
    setError("");
    try {
      const [statsResponse, usersResponse, activityResponse] = await Promise.all([
        fetch(`/api/admin/stats?period=${nextPeriod}`, { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/activity?page=1", { cache: "no-store" }),
      ]);
      if (!statsResponse.ok) throw new Error("Statistiques indisponibles.");
      const data = await statsResponse.json() as DashboardStats;
      setStats(data);
      setPeriod(nextPeriod);
      setUpdatedAt(new Date());
      if (usersResponse.ok) {
        const usersData = await usersResponse.json() as UsersResponse;
        setRecentUsers((usersData.users ?? []).slice(0, 5));
      }
      if (activityResponse.ok) {
        const activityData = await activityResponse.json() as ActivityResponse;
        setRecentActivity((activityData.items ?? []).slice(0, 8));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Actualisation impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load("30d");
    const timer = window.setInterval(() => { void load(period); }, 60_000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = stats.cards;
  const progressOf = (current: number, total: number) => (total <= 0 ? 0 : current / total);
  const periodLabel = period === "7d" ? "7 derniers jours" : period === "30d" ? "30 derniers jours" : "12 derniers mois";

  return (
    <div className="dashboard">
      <div className="dashboard-toolbar">
        <div className="period-tabs" role="tablist" aria-label="Période d'analyse">
          {(["7d", "30d", "12m"] as PeriodKey[]).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={period === key} className={period === key ? "is-active" : ""} onClick={() => void load(key)} disabled={loading}>
              {key === "7d" ? "7 jours" : key === "30d" ? "30 jours" : "12 mois"}
            </button>
          ))}
        </div>
        <div className="dashboard-refresh">
          <small>Actualisé à {new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(updatedAt)} · auto 60 s</small>
          <button type="button" className="button button-outline-dark button-small" onClick={() => void load(period)} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} /> Actualiser
          </button>
        </div>
      </div>
      {error && <div className="admin-alert error" role="alert">{error}</div>}

      <div className="stat-grid">
        <StatCard icon={Users} title="Membres inscrits" value={cards.members.total} delta={cards.members.delta} hint={`période : ${periodLabel}`} progress={progressOf(cards.members.current, Math.max(cards.members.total, 1))} />
        <StatCard icon={Wifi} title="Sessions actives" value={cards.activeSessions.total} delta={null} hint="jetons non expirés" progress={progressOf(cards.activeSessions.total, Math.max(cards.members.total, 1))} />
        <StatCard icon={UserPlus} title="Inscriptions" value={cards.registrations.current} delta={cards.registrations.delta} hint={`période : ${periodLabel}`} progress={progressOf(cards.registrations.current, Math.max(cards.members.total, 1))} />
        <StatCard icon={LogIn} title="Connexions" value={cards.logins.current} delta={cards.logins.delta} hint={`période : ${periodLabel}`} progress={progressOf(cards.logins.current, Math.max(cards.logins.current, 1))} />
        <StatCard icon={Inbox} title="Demandes reçues" value={cards.requests.current} delta={cards.requests.delta} hint={`période : ${periodLabel}`} progress={progressOf(cards.requests.current, Math.max(cards.requests.current, 1))} />
        <StatCard icon={ClipboardList} title="Actions journalisées" value={cards.activities.total} delta={cards.activities.delta} hint={`période : ${periodLabel}`} progress={progressOf(cards.activities.current, Math.max(cards.activities.total, 1))} />
        <StatCard icon={ShieldCheck} title="Comptes staff" value={cards.admins.total} delta={null} hint="admin · editor · sales" progress={1} />
      </div>

      <div className="dashboard-grid">
        <section className="admin-content dashboard-panel">
          <div className="admin-title-row"><div><h2>Inscriptions</h2><p>{periodLabel} · données réelles</p></div></div>
          {stats.series.registrations.every((point) => point.count === 0)
            ? <div className="empty-state"><h3>Aucune inscription sur la période</h3><p>La courbe apparaîtra dès les premières inscriptions.</p></div>
            : <LineChart data={stats.series.registrations} />}
        </section>
        <section className="admin-content dashboard-panel">
          <div className="admin-title-row"><div><h2>Répartition par rôle</h2><p>détectée depuis la base</p></div></div>
          <DonutChart data={stats.roles.map((item) => ({ label: item.role, count: item.count, color: ROLE_COLORS[item.role] ?? "#7a8a80" }))} />
        </section>
        <section className="admin-content dashboard-panel">
          <div className="admin-title-row"><div><h2>Connexions</h2><p>{periodLabel} · journal des connexions</p></div></div>
          {stats.series.logins.every((point) => point.count === 0)
            ? <div className="empty-state"><h3>Aucune connexion sur la période</h3><p>Les connexions des membres alimentent cette courbe.</p></div>
            : <LineChart data={stats.series.logins} color="#2f7d4f" />}
        </section>
        <section className="admin-content dashboard-panel">
          <div className="admin-title-row"><div><h2>Activité par type</h2><p>{periodLabel}</p></div><Link href="/admin/activity" className="text-link">Journal complet</Link></div>
          {stats.actions.length === 0
            ? <div className="empty-state"><h3>Aucune activité sur la période</h3><p>Les actions du site alimentent ce graphique.</p></div>
            : <BarChart data={stats.actions.map((item) => ({ label: item.action, count: item.count }))} />}
        </section>
      </div>

      <section className="admin-content dashboard-panel">
        <div className="admin-title-row"><div><h2>Comparaison des périodes</h2><p>actuelle contre précédente de même durée</p></div><Link href="/admin/stats" className="text-link">Statistiques détaillées</Link></div>
        <ComparisonBars
          current={[stats.comparison.current.registrations, stats.comparison.current.logins, stats.comparison.current.requests]}
          previous={[stats.comparison.previous.registrations, stats.comparison.previous.logins, stats.comparison.previous.requests]}
          labels={["Inscriptions", "Connexions", "Demandes"]}
        />
      </section>

      <div className="dashboard-grid">
        <section className="admin-content dashboard-panel">
          <div className="admin-title-row"><div><h2>Derniers utilisateurs</h2></div><Link href="/admin/members" className="text-link">Tous les utilisateurs</Link></div>
          {recentUsers.length === 0
            ? <div className="empty-state"><h3>Aucun utilisateur pour le moment</h3></div>
            : (
              <div className="admin-table-wrap"><table className="admin-table">
                <thead><tr><th>Nom</th><th>Rôle</th><th>Inscription</th></tr></thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.role}</td><td>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(user.createdAt))}</td></tr>
                  ))}
                </tbody>
              </table></div>
            )}
        </section>
        <section className="admin-content dashboard-panel">
          <div className="admin-title-row"><div><h2>Activité récente</h2></div><Link href="/admin/activity" className="text-link">Journal complet</Link></div>
          {recentActivity.length === 0
            ? <div className="empty-state"><h3>Aucune activité enregistrée</h3></div>
            : (
              <ul className="activity-list">
                {recentActivity.map((item) => (
                  <li key={item.id}>
                    <span className="activity-dot" />
                    <div><strong>{actionLabel(item.action, "fr")}</strong><small>{item.adminEmail} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}</small></div>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>
      <p className="form-disclaimer"><Activity size={11} style={{ display: "inline", marginRight: 5 }} />Toutes les valeurs proviennent de la base PostgreSQL. Aucune donnée de démonstration.</p>
    </div>
  );
}
