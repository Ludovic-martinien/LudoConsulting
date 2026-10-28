"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { KeyRound, Save, UserRound } from "lucide-react";

type Props = {
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
};

export function AdminProfileForm({ email, name, role, isActive, lastLoginAt, createdAt }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(name ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName.trim() }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Enregistrement impossible.");
      setMessage("Nom affiché enregistré.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Enregistrement impossible.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-layout">
      <div className="profile-identity">
        <span className="member-avatar-large">{(displayName || email).charAt(0).toUpperCase()}</span>
        <div>
          <h2>{displayName || email.split("@")[0]}</h2>
          <p>{email}</p>
          <span className="status-label">Administrateur · {role}</span>{" "}
          <span className="status-label">{isActive ? "Actif" : "Suspendu"}</span>
        </div>
      </div>
      {message && <div className={`admin-alert${error ? " error" : ""}`} role="status">{message}</div>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <tbody>
            <tr><td><strong>Adresse e-mail</strong></td><td>{email}<br /><small>Non modifiable : elle est liée à la configuration d'accès.</small></td></tr>
            <tr><td><strong>Rôle</strong></td><td>{role}<br /><small>Non modifiable depuis votre profil (anti-élévation de privilèges).</small></td></tr>
            <tr><td><strong>Création du compte</strong></td><td>{createdAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(createdAt)) : "—"}</td></tr>
            <tr><td><strong>Dernière connexion</strong></td><td>{lastLoginAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lastLoginAt)) : "—"}</td></tr>
          </tbody>
        </table>
      </div>
      <h2 className="admin-section-title" style={{ marginTop: 22 }}><UserRound size={15} style={{ display: "inline", marginRight: 6 }} />Nom affiché</h2>
      <form onSubmit={submit} className="admin-inline-form">
        <label className="hidden-field" htmlFor="admin-display-name">Nom affiché</label>
        <input id="admin-display-name" className="admin-input wide" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required minLength={2} maxLength={180} placeholder="Votre nom" />
        <button type="submit" className="button button-primary button-small" disabled={busy}><Save size={14} /> Enregistrer</button>
      </form>
      <h2 className="admin-section-title" style={{ marginTop: 22 }}><KeyRound size={15} style={{ display: "inline", marginRight: 6 }} />Mot de passe</h2>
      <div className="admin-alert" role="note">
        Le mot de passe administrateur est géré par les variables d'environnement du déploiement
        (<code>ADMIN_PASSWORD_HASH</code>, format <code>scrypt:&lt;sel&gt;:&lt;empreinte&gt;</code>) :
        il ne peut pas être modifié depuis cette interface, par sécurité. Générez une nouvelle
        empreinte depuis un terminal sécurisé, mettez à jour la variable d'environnement, puis
        redéployez. La procédure complète figure dans le README (section Compte administrateur).
      </div>
    </div>
  );
}
