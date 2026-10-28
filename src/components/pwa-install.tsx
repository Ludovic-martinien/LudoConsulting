"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

const DISMISSED_KEY = "ludo-pwa-dismissed";

export function PwaInstall() {
  const { text } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    try {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (standalone || sessionStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      // Safari iOS n'envoie pas d'événement d'installation : afficher le mode d'emploi.
      const timer = setTimeout(() => {
        setIosMode(true);
        setVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      try {
        sessionStorage.setItem(DISMISSED_KEY, "1");
      } catch {
        /* stockage indisponible : ignorer */
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt().catch(() => undefined);
    try {
      await deferred.userChoice;
    } catch {
      /* choix indisponible : ignorer */
    }
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* stockage indisponible : ignorer */
    }
  }

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* stockage indisponible : ignorer */
    }
  }

  return (
    <div className="pwa-banner" role="dialog" aria-live="polite" aria-label={text("Installer l'application", "Install the app")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={44} height={44} />
      <div className="pwa-text">
        <strong>{text("Installer Ludo_Consulting", "Install Ludo_Consulting")}</strong>
        <span>
          {iosMode
            ? text("Touchez Partager puis « Sur l'écran d'accueil ».", "Tap Share, then “Add to Home Screen”.")
            : text("Ajoutez l'application à votre appareil pour y accéder plus vite.", "Add the app to your device for faster access.")}
        </span>
      </div>
      {iosMode ? (
        <span className="pwa-ios-hint" aria-hidden="true"><Share size={17} /></span>
      ) : (
        <button type="button" className="button button-primary button-small" onClick={install}>
          <Download size={15} /> {text("Installer", "Install")}
        </button>
      )}
      <button type="button" className="pwa-dismiss" onClick={dismiss} aria-label={text("Fermer", "Close")}>
        <X size={16} />
      </button>
    </div>
  );
}
