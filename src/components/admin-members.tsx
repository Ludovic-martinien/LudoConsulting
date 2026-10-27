"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";

type MemberRow = {
  id: number;
  name: string;
  email: string;
  image: string | null;
  googleLinked: boolean;
  hasPassword: boolean;
  emailVerified: boolean;
  activeSessions: number;
  lastLogin: Date | null;
  recentEvents: { method: string; createdAt: Date }[];
  createdAt: Date;
};

const methodLabel: Record<string, string> = { register: "Inscription", password: "Mot de passe", google: "Google" };

export function AdminMembers({ members }: { members: MemberRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function remove(member: MemberRow) {
    if (!window.confirm(`Supprimer définitivement le compte de « ${member.name} » (${member.email}) ?`)) return;
    setBusyId(member.id);
    setMessage("");
    setError(false);
    try {
      const response = await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Suppression impossible.");
      setMessage(`Compte de « ${member.name} » supprimé.`);
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Suppression impossible.");
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-content">
      <div className="admin-title-row">
        <div><h1>Membres</h1><p>Comptes des visiteurs inscrits : profils, moyens de connexion, sessions et historique.</p></div>
        <span className="status-label">{members.length} membre(s)</span>
      </div>
      {message && <div className={`admin-alert${error ? " error" : ""}`} role="status">{message}</div>}
      {members.length === 0 ? (
        <div className="empty-state"><h3>Aucun membre inscrit</h3><p>Les comptes créés depuis l'espace membre apparaîtront ici.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Membre</th><th>Connexion</th><th>Sessions actives</th><th>Dernière activité</th><th>Inscrit le</th><th>Actions</th></tr></thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td><strong>{member.name}</strong><br /><small>{member.email}</small></td>
                  <td>
                    {member.googleLinked && <span className="status-label"><ShieldCheck size={11} style={{ display: "inline", marginRight: 3 }} />Google</span>}{" "}
                    {member.hasPassword && <span className="status-label">Mot de passe</span>}{" "}
                    {member.emailVerified && <span className="status-label">E-mail vérifié</span>}
                  </td>
                  <td>{member.activeSessions}</td>
                  <td>{member.lastLogin ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(member.lastLogin)) : "—"}</td>
                  <td>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(member.createdAt))}</td>
                  <td>
                    <button type="button" className="button button-outline-dark button-small" onClick={() => remove(member)} disabled={busyId === member.id}>
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {members.length > 0 && (
        <>
          <div className="admin-divider" />
          <h2 className="admin-section-title">Historique récent par membre</h2>
          {members.map((member) => (
            <details className="service-admin-details" key={`events-${member.id}`}>
              <summary><span><strong>{member.name}</strong><small>{member.email}</small></span><span>{member.recentEvents.length} événement(s)</span></summary>
              {member.recentEvents.length === 0 ? (
                <p className="form-disclaimer" style={{ padding: "0 16px 12px" }}>Aucun événement enregistré.</p>
              ) : (
                <div className="admin-table-wrap" style={{ padding: "0 16px 12px" }}>
                  <table className="admin-table">
                    <thead><tr><th>Méthode</th><th>Date</th></tr></thead>
                    <tbody>
                      {member.recentEvents.map((event, index) => (
                        <tr key={index}><td>{methodLabel[event.method] ?? event.method}</td><td>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </details>
          ))}
        </>
      )}
    </section>
  );
}
