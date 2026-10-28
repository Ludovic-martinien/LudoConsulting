"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";

type LoginEvent = { method: string; createdAt: string };
type QuoteRow = { referenceNumber: string; serviceFr: string; serviceEn: string; status: string; createdAt: string };
type MessageRow = { subject: string; status: string; createdAt: string };
type TrainingRow = { planFr: string; planEn: string; status: string; createdAt: string };

type Props = {
  id: number;
  name: string;
  email: string;
  image: string | null;
  googleLinked: boolean;
  hasPassword: boolean;
  createdAt: string;
  welcomed: boolean;
  logins: LoginEvent[];
  quotes: QuoteRow[];
  messages: MessageRow[];
  trainings: TrainingRow[];
};

function requestStatusLabel(status: string, text: (fr: string, en: string) => string) {
  const labels: Record<string, { fr: string; en: string }> = {
    new: { fr: "Nouveau", en: "New" },
    processing: { fr: "En cours de traitement", en: "In progress" },
    waiting: { fr: "En attente d'informations", en: "Awaiting information" },
    quote_preparation: { fr: "Devis à préparer", en: "Quote to prepare" },
    replied: { fr: "Répondu", en: "Replied" },
    accepted: { fr: "Accepté", en: "Accepted" },
    declined: { fr: "Refusé", en: "Declined" },
    closed: { fr: "Clôturé", en: "Closed" },
  };
  const label = labels[status];
  return label ? text(label.fr, label.en) : status;
}

function formatShortDate(value: string, text: (fr: string, en: string) => string) {
  return new Intl.DateTimeFormat(text("fr-FR", "en-GB"), { dateStyle: "medium" }).format(new Date(value));
}

function loginMethodLabel(method: string, text: (fr: string, en: string) => string) {
  if (method === "google") return "Google";
  if (method === "register") return text("Inscription", "Sign-up");
  return text("Mot de passe", "Password");
}

export function AccountClient({ name, email, image, googleLinked, hasPassword, createdAt, welcomed, logins, quotes, messages, trainings }: Props) {
  const { text } = useLanguage();
  const { refresh } = useMember();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [currentPasswordValue, setCurrentPasswordValue] = useState("");

  async function saveProfile(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/member/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || text("Modification impossible.", "Update failed."));
      setSuccess(text("Informations enregistrées.", "Information saved."));
      setEditingName(false);
      setEditingPassword(false);
      setPasswordValue("");
      setCurrentPasswordValue("");
      await refresh();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text("Modification impossible.", "Update failed."));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/member/logout", { method: "POST" });
    } finally {
      await refresh();
      router.push("/#espace-membre");
    }
  }

  async function removeAccount() {
    const confirmed = window.confirm(text("Supprimer définitivement votre compte et vos données ? Cette action est irréversible.", "Permanently delete your account and data? This cannot be undone."));
    if (!confirmed) return;
    const twice = window.confirm(text("Dernière confirmation : tout sera effacé.", "Final confirmation: everything will be erased."));
    if (!twice) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/member/account", { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || text("Suppression impossible.", "Deletion failed."));
      await refresh();
      window.location.href = "/";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text("Suppression impossible.", "Deletion failed."));
      setBusy(false);
    }
  }

  return (
    <div className="account-card">
      {welcomed && <div className="form-success" role="status"><strong>{text("Bienvenue !", "Welcome!")}</strong>{text("Votre compte est prêt. Votre profil pré-remplira vos prochaines demandes.", "Your account is ready. Your profile will pre-fill your future requests.")}</div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {success && <div className="form-success" role="status">{success}</div>}
      <div className="account-head">
        <span className="member-avatar-large">{image ? <img src={image} alt="" /> : name.charAt(0).toUpperCase()}</span>
        <div><h2>{name}</h2><p>{email}</p></div>
      </div>
      <div className="account-badges">
        {googleLinked && <span className="status-label"><ShieldCheck size={12} style={{ display: "inline", marginRight: 4 }} />Google</span>}
        {hasPassword && <span className="status-label">{text("Mot de passe", "Password")}</span>}
        <span className="status-label">{text("Membre depuis le", "Member since")} {new Intl.DateTimeFormat(text("fr-FR", "en-GB"), { dateStyle: "medium" }).format(new Date(createdAt))}</span>
      </div>
      <p className="form-disclaimer">{text("Votre profil sert uniquement à pré-remplir vos demandes. Vos données restent privées et ne sont jamais publiées.", "Your profile is only used to pre-fill your requests. Your data stays private and is never published.")}</p>
      {logins.length > 0 && (
        <div className="account-logins">
          <h3>{text("Dernières connexions", "Recent sign-ins")}</h3>
          <ul className="login-events">
            {logins.map((item, index) => (
              <li key={`${item.createdAt}-${index}`}>
                <span>{loginMethodLabel(item.method, text)}</span>
                <span>{new Intl.DateTimeFormat(text("fr-FR", "en-GB"), { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="profile-edit">
        <div className="profile-edit-row">
          <div>
            <strong>{text("Nom affiché", "Display name")}</strong>
            <span>{name}</span>
          </div>
          {!editingName && <button type="button" className="button button-outline-dark button-small" onClick={() => { setNameValue(name); setEditingName(true); }} disabled={busy}>{text("Modifier", "Edit")}</button>}
        </div>
        {editingName && (
          <form className="profile-edit-form" onSubmit={(event) => { event.preventDefault(); void saveProfile({ name: nameValue.trim() }); }}>
            <label className="hidden-field" htmlFor="profile-name">{text("Nom et prénom", "Full name")}</label>
            <input id="profile-name" className="admin-input wide" value={nameValue} onChange={(event) => setNameValue(event.target.value)} required minLength={2} maxLength={180} />
            <div className="admin-inline-form">
              <button type="submit" className="button button-primary button-small" disabled={busy}>{text("Enregistrer", "Save")}</button>
              <button type="button" className="button button-outline-dark button-small" onClick={() => setEditingName(false)} disabled={busy}>{text("Annuler", "Cancel")}</button>
            </div>
          </form>
        )}
        <div className="profile-edit-row">
          <div>
            <strong>{hasPassword ? text("Mot de passe", "Password") : text("Ajouter un mot de passe", "Add a password")}</strong>
            <span>{hasPassword ? "••••••••••" : text("Compte Google uniquement", "Google account only")}</span>
          </div>
          {!editingPassword && <button type="button" className="button button-outline-dark button-small" onClick={() => setEditingPassword(true)} disabled={busy}>{hasPassword ? text("Changer", "Change") : text("Ajouter", "Add")}</button>}
        </div>
        {editingPassword && (
          <form className="profile-edit-form" onSubmit={(event) => { event.preventDefault(); void saveProfile(hasPassword ? { password: passwordValue, currentPassword: currentPasswordValue } : { password: passwordValue }); }}>
            {hasPassword && (
              <>
                <label className="hidden-field" htmlFor="profile-current-password">{text("Mot de passe actuel", "Current password")}</label>
                <input id="profile-current-password" className="admin-input wide" type="password" value={currentPasswordValue} onChange={(event) => setCurrentPasswordValue(event.target.value)} required autoComplete="current-password" placeholder={text("Mot de passe actuel", "Current password")} />
              </>
            )}
            <label className="hidden-field" htmlFor="profile-new-password">{text("Nouveau mot de passe", "New password")}</label>
            <input id="profile-new-password" className="admin-input wide" type="password" value={passwordValue} onChange={(event) => setPasswordValue(event.target.value)} required minLength={10} maxLength={256} autoComplete="new-password" placeholder={text("Nouveau mot de passe (10 caractères minimum)", "New password (10 characters minimum)")} />
            <div className="admin-inline-form">
              <button type="submit" className="button button-primary button-small" disabled={busy}>{text("Enregistrer", "Save")}</button>
              <button type="button" className="button button-outline-dark button-small" onClick={() => setEditingPassword(false)} disabled={busy}>{text("Annuler", "Cancel")}</button>
            </div>
          </form>
        )}
      </div>
      <div className="account-requests">
        <h3>{text("Mes demandes", "My requests")}</h3>
        <p className="form-disclaimer">{text("Retrouvez ici vos demandes de devis, vos messages et vos inscriptions, avec leur statut de traitement.", "Find your quote requests, messages and registrations here, with their processing status.")}</p>
        {quotes.length === 0 && messages.length === 0 && trainings.length === 0 ? (
          <div className="empty-state" style={{ padding: "22px 16px" }}>
            <h3>{text("Aucune demande pour le moment", "No requests yet")}</h3>
            <p>{text("Vos prochaines demandes apparaîtront ici automatiquement.", "Your future requests will appear here automatically.")}</p>
          </div>
        ) : (
          <>
            {quotes.length > 0 && (
              <>
                <h4 className="request-group-title">{text("Devis demandés", "Requested quotes")}</h4>
                <div className="admin-table-wrap"><table className="admin-table">
                  <thead><tr><th>{text("Référence", "Reference")}</th><th>{text("Service", "Service")}</th><th>{text("Statut", "Status")}</th><th>{text("Date", "Date")}</th></tr></thead>
                  <tbody>
                    {quotes.map((item) => (
                      <tr key={item.referenceNumber}><td><strong>{item.referenceNumber}</strong></td><td>{text(item.serviceFr, item.serviceEn)}</td><td><span className="status-label">{requestStatusLabel(item.status, text)}</span></td><td>{formatShortDate(item.createdAt, text)}</td></tr>
                    ))}
                  </tbody>
                </table></div>
              </>
            )}
            {trainings.length > 0 && (
              <>
                <h4 className="request-group-title">{text("Formations", "Training")}</h4>
                <div className="admin-table-wrap"><table className="admin-table">
                  <thead><tr><th>{text("Formule", "Plan")}</th><th>{text("Statut", "Status")}</th><th>{text("Date", "Date")}</th></tr></thead>
                  <tbody>
                    {trainings.map((item, index) => (
                      <tr key={`${item.createdAt}-${index}`}><td>{text(item.planFr, item.planEn)}</td><td><span className="status-label">{requestStatusLabel(item.status, text)}</span></td><td>{formatShortDate(item.createdAt, text)}</td></tr>
                    ))}
                  </tbody>
                </table></div>
              </>
            )}
            {messages.length > 0 && (
              <>
                <h4 className="request-group-title">{text("Messages envoyés", "Sent messages")}</h4>
                <div className="admin-table-wrap"><table className="admin-table">
                  <thead><tr><th>{text("Objet", "Subject")}</th><th>{text("Statut", "Status")}</th><th>{text("Date", "Date")}</th></tr></thead>
                  <tbody>
                    {messages.map((item, index) => (
                      <tr key={`${item.createdAt}-${index}`}><td>{item.subject}</td><td><span className="status-label">{requestStatusLabel(item.status, text)}</span></td><td>{formatShortDate(item.createdAt, text)}</td></tr>
                    ))}
                  </tbody>
                </table></div>
              </>
            )}
          </>
        )}
      </div>
      <div className="account-actions">
        <button type="button" className="button button-outline-dark button-small" onClick={logout} disabled={busy}><LogOut size={14} /> {text("Se déconnecter", "Sign out")}</button>
        <button type="button" className="button button-danger button-small" onClick={removeAccount} disabled={busy}><Trash2 size={14} /> {text("Supprimer mon compte", "Delete my account")}</button>
      </div>
    </div>
  );
}
