"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";

type LoginEvent = { method: string; createdAt: string };

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
};

function loginMethodLabel(method: string, text: (fr: string, en: string) => string) {
  if (method === "google") return "Google";
  if (method === "register") return text("Inscription", "Sign-up");
  return text("Mot de passe", "Password");
}

export function AccountClient({ name, email, image, googleLinked, hasPassword, createdAt, welcomed, logins }: Props) {
  const { text } = useLanguage();
  const { refresh } = useMember();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      <div className="account-actions">
        <button type="button" className="button button-outline-dark button-small" onClick={logout} disabled={busy}><LogOut size={14} /> {text("Se déconnecter", "Sign out")}</button>
        <button type="button" className="button button-danger button-small" onClick={removeAccount} disabled={busy}><Trash2 size={14} /> {text("Supprimer mon compte", "Delete my account")}</button>
      </div>
    </div>
  );
}
