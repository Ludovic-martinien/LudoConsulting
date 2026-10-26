"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/site";

type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void; text: (fr: string, en: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("ludo-locale");
    if (saved === "en" || saved === "fr") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("ludo-locale", locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const text = useCallback((fr: string, en: string) => locale === "fr" ? fr : en, [locale]);
  const value = useMemo(() => ({ locale, setLocale, text }), [locale, setLocale, text]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage();
  return (
    <div className={`language-toggle${compact ? " language-toggle-compact" : ""}`} role="group" aria-label="Select language / Choisir la langue">
      <button type="button" onClick={() => setLocale("fr")} aria-pressed={locale === "fr"} className={locale === "fr" ? "is-active" : ""}>FR</button>
      <span aria-hidden="true">/</span>
      <button type="button" onClick={() => setLocale("en")} aria-pressed={locale === "en"} className={locale === "en" ? "is-active" : ""}>EN</button>
    </div>
  );
}
