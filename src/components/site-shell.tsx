"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/language-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PwaInstall } from "@/components/pwa-install";

export function SiteShell({ children }: { children: ReactNode }) {
  return <LanguageProvider><SiteHeader />{children}<SiteFooter /><PwaInstall /></LanguageProvider>;
}
