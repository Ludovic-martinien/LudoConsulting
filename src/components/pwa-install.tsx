"use client";

import { useCallback, useEffect, useState } from "react";
import { AppWindow, Share, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ludo-pwa-dismissed";
const DISMISS_DAYS = 7;

function dismissedRecently() {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* stockage indisponible : la bannière pourra réapparaître. */
  }
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

/** Enregistre le service worker (production uniquement, pour éviter tout cache en développement). */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* Installation PWA indisponible : le site reste utilisable. */
    });
  }, []);
  return null;
}

/** Bannière d'installation automatique : Android/Chrome via beforeinstallprompt, iOS via consignes manuelles. */
export function InstallPrompt() {
  const { text } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandalone() || dismissedRecently()) return;
    setIsIos(isIosDevice());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      window.setTimeout(() => setVisible(true), 2500);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      rememberDismissed();
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // iOS ne déclenche jamais beforeinstallprompt : afficher les consignes manuelles.
    const fallback = window.setTimeout(() => {
      if (isIosDevice() && !isStandalone() && !dismissedRecently()) setVisible(true);
    }, 4000);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(fallback);
    };
  }, []);

  const dismiss = useCallback(() => {
    rememberDismissed();
    setVisible(false);
  }, []);

  async function install() {
    if (!deferred) return;
    setBusy(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setBusy(false);
      setDeferred(null);
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="pwa-banner" role="dialog" aria-live="polite" aria-label={text("Installer l'application", "Install the app")}>
      <span className="pwa-icon" aria-hidden="true"><AppWindow size={20} /></span>
      <div className="pwa-copy">
        <strong>{text("Installer l'application Ludo_Consulting ?", "Install the Ludo_Consulting app?")}</strong>
        {isIos && !deferred ? (
          <span>{text("Sur iPhone : touchez Partager puis « Sur l'écran d'accueil ».", "On iPhone: tap Share, then “Add to Home Screen”.")} <Share size={12} style={{ display: "inline", verticalAlign: "-2px" }} /></span>
        ) : (
          <span>{text("Accédez au site même hors connexion, depuis votre écran d'accueil.", "Use the site even offline, right from your home screen.")}</span>
        )}
      </div>
      {deferred && !isIos ? (
        <button type="button" className="button button-primary button-small" onClick={install} disabled={busy}>
          {text("Installer", "Install")}
        </button>
      ) : (
        <span className="pwa-ios-hint">{text("Gratuit", "Free")}</span>
      )}
      <button type="button" className="pwa-close" onClick={dismiss} aria-label={text("Fermer", "Close")}>
        <X size={16} />
      </button>
    </div>
  );
}
