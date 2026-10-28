"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { getRolesOverview } from "@/lib/admin-stats";

type Overview = Awaited<ReturnType<typeof getRolesOverview>>;

export function AdminRolesView({ overview, ownEmail }: { overview: Overview; ownEmail: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [staff, setStaff] = useState<{ id: number; email: string; role: string; isActive: boolean }[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function loadStaff() {
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { users?: { id: string; email: string; role: string; active: boolean; kind: string }[] };
      setStaff((data.users ?? []).filter((user) => user.kind === "staff").map((user) => ({
        id: Number(user.id.replace("staff-", "")),
        email: user.email,
        role: user.role,
        isActive: user.active,
      })));
      setLoaded(true);
    } catch {
      /* Liste optionnelle : la vue des rôles reste disponible. */
    }
  }

  async function updateStaff(id: number, payload: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Modification impossible.");
      setMessage("Modification enregistrée.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Modification impossible.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {message && <div className={`admin-alert${error ? " error" : ""}`} role="status">{message}</div>}
      <div className="stat-grid">
        {overview.roles.map((item) => (
          <article className="stat-card" key={item.role}>
            <span className="stat-icon"><ShieldCheck size={19} /></span>
            <div className="stat-body">
              <span className="stat-title">Rôle · {item.role}</span>
              <strong className="stat-value">{item.count}</strong>
              <span className="stat-foot"><small>{(overview.permissions[item.role] ?? []).length} permissions</small></span>
            </div>
          </article>
        ))}
      </div>
      {overview.roles.map((item) => (
        <div key={item.role} style={{ marginTop: 22 }}>
          <h2 className="admin-section-title">Rôle « {item.role} » — {item.count} utilisateur(s)</h2>
          <ul className="benefit-list" style={{ marginBottom: 12 }}>
            {(overview.permissions[item.role] ?? ["Permissions définies côté serveur."]).map((permission) => (
              <li key={permission}><i style={{ background: "#2f7d4f" }} />{permission}</li>
            ))}
          </ul>
          {item.users.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Nom</th><th>E-mail</th><th>Statut</th><th>Dernière connexion</th></tr></thead>
                <tbody>
                  {item.users.map((user) => (
                    <tr key={user.email}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className="status-label">{user.active ? "Actif" : "Suspendu"}</span></td>
                      <td>{user.lastLogin ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(user.lastLogin)) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      <div className="admin-divider" />
      <div className="admin-title-row">
        <div><h2>Gérer les comptes staff</h2><p>Rôles et suspensions — jamais sur votre propre compte. Chaque action est journalisée.</p></div>
        {!loaded && <button type="button" className="button button-outline-dark button-small" onClick={() => void loadStaff()}>Charger la liste</button>}
      </div>
      {loaded && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Compte</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.map((account) => {
                const isSelf = account.email.toLowerCase() === ownEmail.toLowerCase();
                return (
                  <tr key={account.id}>
                    <td><strong>{account.email}</strong>{isSelf && <><br /><small>Votre compte — non modifiable ici</small></>}</td>
                    <td>
                      <select className="admin-select" defaultValue={account.role} disabled={busy || isSelf} aria-label={`Rôle de ${account.email}`} onChange={(event) => void updateStaff(account.id, { role: event.target.value })}>
                        {["admin", "editor", "sales"].map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td><span className="status-label">{account.isActive ? "Actif" : "Suspendu"}</span></td>
                    <td>
                      <button type="button" className="button button-outline-dark button-small" disabled={busy || isSelf} onClick={() => void updateStaff(account.id, { isActive: !account.isActive })}>
                        {account.isActive ? "Suspendre" : "Réactiver"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="form-disclaimer">Les permissions sont vérifiées côté serveur à chaque requête : masquer un bouton ne suffit jamais à protéger une action.</p>
    </div>
  );
}
