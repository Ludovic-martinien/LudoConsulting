"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/language-provider";
import { MemberModal } from "@/components/member-modal";
import { MemberProvider } from "@/components/member-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return <LanguageProvider><MemberProvider><SiteHeader />{children}<SiteFooter /><MemberModal /></MemberProvider></LanguageProvider>;
}
