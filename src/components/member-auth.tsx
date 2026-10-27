"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Member = { id: number; name: string; email: string; avatar: string | null };
type Mode = "login" | "signup";

export const AUTH_EVENT = "ludo:open-auth";

export function openAuth(mode: Mode = "login") {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { mode } }));
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .8-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5.1l-.1.1-3.6 2.8v.1C3.5 21.3 7.5 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3l-.1-.1-3.5-2.7-.1.1C.5 8.9 0 10.4 0 12s.5 3.1 1.4 4.5l3.8-2.2z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.4 6.9l3.8 2.9c.9-2.9 3.6-5.1 6.8-5.1z" />
    </svg>
  );
}

export function AuthButtons() {
  const { text } = useLanguage();
  const [user, setUser] = useState<Member | null>(null);
  const [modal, setModal] = useState<{ open: boolean; mode: Mode }>({ open: false, mode: "login" });
  const [toast, setToast] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/user/me", { credentials: "same-origin" });
      const data = (await response.json()) as { user: Member | null };
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onOpen = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: Mode }>).detail?.mode;
      setModal({ open: true, mode: mode === "signup" ? "signup" : "login" });
    };
    window.addEventListener(AUTH_EVENT, onOpen);
    const params = new URLSearchParams(window.location.search);
    const authFlag = params.get("auth");
    const memberFlag = params.get("member");
    if (authFlag === "google-unavailable") {
      setModal({ open: true, mode: "login" });
      setToast(text("La connexion Google n'est pas encore configurée sur ce site.", "Google sign-in is not configured on this site yet."));
    } else if (authFlag === "cancelled") {
      setToast(text("Connexion Google annulée.", "Google sign-in cancelled."));
    } else if (authFlag === "error") {
      setModal({ open: true, mode: "login" });
      setToast(text("La connexion Google a échoué. Réessayez ou utilisez votre e-mail.", "Google sign-in failed. Try again or use your email."));
    } else if (memberFlag === "welcome") {
      refresh();
      setToast(text("Bienvenue ! Vous êtes connecté.", "Welcome! You are signed in."));
    }
    if (authFlag || memberFlag) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("member");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    return () => window.removeEventListener(AUTH_EVENT, onOpen);
  }, [refresh, text]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function logout() {
    await fetch("/api/user/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    setUser(null);
  }

  return (
    <>
      <div className="auth-buttons">
        {user ? (
          <span className="auth-user-chip" title={user.email}>
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" width={26} height={26} referrerPolicy="no-referrer" />
            ) : (
              <span className="auth-avatar-fallback" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase() || "•"}</span>
            )}
            <span className="auth-user-name">{user.name.split(" ")[0]}</span>
            <button type="button" className="auth-logout" onClick={logout} aria-label={text("Se déconnecter", "Sign out")} title={text("Se déconnecter", "Sign out")}>
              <LogOut size={15} />
            </button>
          </span>
        ) : (
          <>
            <button type="button" className="auth-link" onClick={() => setModal({ open: true, mode: "login" })}>
              {text("Se connecter", "Sign in")}
            </button>
            <button type="button" className="button button-primary auth-cta" onClick={() => setModal({ open: true, mode: "signup" })}>
              {text("S'inscrire", "Sign up")}
            </button>
          </>
        )}
      </div>
      {toast ? (
        <div className="auth-toast" role="status">{toast}</div>
      ) : null}
      <AuthModal
        open={modal.open}
        mode={modal.mode}
        onMode={setModal}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onDone={() => {
          refresh();
          setModal((m) => ({ ...m, open: false }));
        }}
      />
    </>
  );
}

function AuthModal({
  open,
  mode,
  onMode,
  onClose,
  onDone,
}: {
  open: boolean;
  mode: Mode;
  onMode: (m: { open: boolean; mode: Mode }) => void;
  onClose: () => void;
  onDone: () => void;
}) {
  const { text } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setGoogleAvailable(null);
    fetch("/api/auth/providers", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d: { google?: boolean }) => setGoogleAvailable(d.google === true))
      .catch(() => setGoogleAvailable(false));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(mode === "signup" ? "/api/user/signup" : "/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || text("Une erreur est survenue.", "Something went wrong."));
        setBusy(false);
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setBusy(false);
      onDone();
    } catch {
      setError(text("Connexion impossible. Vérifiez votre réseau.", "Cannot connect. Check your network."));
      setBusy(false);
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose} role="presentation">
      <div className="auth-modal" role="dialog" aria-modal="true" aria-label={text("Espace membre", "Member area")} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-close" onClick={onClose} aria-label={text("Fermer", "Close")}>
          <X size={18} />
        </button>
        <h2>{text("Espace membre", "Member area")}</h2>
        <p className="auth-sub">
          {mode === "signup"
            ? text("Créez votre compte pour suivre vos demandes et rester en contact.", "Create your account to track your requests and stay in touch.")
            : text("Connectez-vous pour retrouver votre espace.", "Sign in to access your space.")}
        </p>
        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => onMode({ open: true, mode: "login" })}>
            {text("Connexion", "Sign in")}
          </button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "is-active" : ""} onClick={() => onMode({ open: true, mode: "signup" })}>
            {text("Inscription", "Sign up")}
          </button>
        </div>

        {googleAvailable === null ? (
          <div className="auth-google-loading">{text("Chargement…", "Loading…")}</div>
        ) : googleAvailable ? (
          <a className="auth-google-btn" href="/api/auth/google">
            <GoogleMark />
            {mode === "signup"
              ? text("S'inscrire avec Google", "Sign up with Google")
              : text("Continuer avec Google", "Continue with Google")}
          </a>
        ) : (
          <p className="auth-note">{text("Connexion Google bientôt disponible : utilisez votre e-mail pour le moment.", "Google sign-in coming soon — please use your email for now.")}</p>
        )}

        <div className="auth-divider"><span>{text("ou", "or")}</span></div>

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" ? (
            <label>
              <span>{text("Nom complet", "Full name")}</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={180} autoComplete="name" placeholder={text("Ex. : Aïcha Nguema", "E.g.: Aïcha Nguema")} />
            </label>
          ) : null}
          <label>
            <span>{text("Adresse e-mail", "Email address")}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" placeholder="vous@exemple.com" />
          </label>
          <label>
            <span>{text("Mot de passe", "Password")}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={256} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={text("8 caractères minimum", "8 characters minimum")} />
          </label>
          {error ? (
            <p className="auth-error" role="alert">{error}</p>
          ) : null}
          <button type="submit" className="button button-primary auth-submit" disabled={busy}>
            {busy ? text("Veuillez patienter…", "Please wait…") : mode === "signup" ? text("Créer mon compte", "Create my account") : text("Se connecter", "Sign in")}
          </button>
        </form>
        <p className="auth-privacy">
          {text("Vos données restent confidentielles et ne sont jamais revendues.", "Your data stays private and is never sold.")}
        </p>
      </div>
    </div>
  );
}
