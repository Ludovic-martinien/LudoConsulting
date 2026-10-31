"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function hashOf(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return String(hash);
}

/**
 * Synchronisation automatique avec le serveur.
 * - Interroge un instantané léger des contenus publics (aucune donnée privée).
 * - Si la version change (admin a publié/modifié), la page se régénère seule.
 * - Si l'onglet redevient actif ou si la connexion revient, resynchronisation immédiate.
 * - Aucune écriture locale : la base reste l'unique source de vérité.
 */
export function AutoRefresh({ intervalMs = 45_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  const lastVersion = useRef<string | null>(null);

  const check = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    try {
      const response = await fetch("/api/public/version", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { version?: string };
      if (!data.version) return;
      if (lastVersion.current === null) {
        lastVersion.current = data.version;
        return;
      }
      if (lastVersion.current !== data.version) {
        lastVersion.current = data.version;
        router.refresh();
      }
    } catch {
      /* Réseau momentanément indisponible : nouvel essai au prochain cycle. */
    }
  }, [router]);

  useEffect(() => {
    void check();
    const timer = window.setInterval(() => { void check(); }, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    const onOnline = () => { setOffline(false); void check(); };
    const onOffline = () => setOffline(true);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check, intervalMs]);

  // Re-vérifier à chaque changement de page (navigation interne).
  useEffect(() => {
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!offline) return null;
  return (
    <div className="sync-banner" role="status" aria-live="polite">
      <span className="sync-dot" aria-hidden="true" />
      Hors connexion — les données seront resynchronisées dès le retour du réseau.
    </div>
  );
}

export function useStableHash(value: unknown) {
  return hashOf(JSON.stringify(value));
}
