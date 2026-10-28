"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/language-provider";
import { InstallPrompt, PwaRegister } from "@/components/pwa-install";
import { MemberModal } from "@/components/member-modal";
import { MemberProvider } from "@/components/member-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { SocialLink } from "@/lib/social";

export function SiteShell({ children, socials }: { children: ReactNode; socials?: SocialLink[] }) {
  return <LanguageProvider><MemberProvider><PwaRegister /><SiteHeader />{children}<SiteFooter socials={socials} /><MemberModal /><InstallPrompt /></MemberProvider></LanguageProvider>;
}
