import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";

export type SocialLink = { platform: string; label: string; url: string };

/** Liens officiels fournis — les paramètres de suivi ont été retirés des URL. */
export const SOCIAL_DEFAULTS: (SocialLink & { displayOrder: number })[] = [
  { platform: "github", label: "GitHub", url: "https://github.com/Lichtensteiner", displayOrder: 1 },
  { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=100088480505522", displayOrder: 2 },
  { platform: "whatsapp", label: "Chaîne WhatsApp", url: "https://whatsapp.com/channel/0029Vb89zwc84OmE3NfiNV28", displayOrder: 3 },
  { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/ludo-consulting-97ba30334", displayOrder: 4 },
  { platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@martinienmvezogo", displayOrder: 5 },
  { platform: "telegram", label: "Telegram", url: "https://t.me/Ludo_Consulting", displayOrder: 6 },
  { platform: "discord", label: "Discord", url: "https://discord.gg/FmKw6nhDH", displayOrder: 7 },
];

export async function getPublishedSocialLinks(): Promise<SocialLink[]> {
  try {
    return await db.select({ platform: socialLinks.platform, label: socialLinks.label, url: socialLinks.url })
      .from(socialLinks)
      .where(eq(socialLinks.isPublished, true))
      .orderBy(asc(socialLinks.displayOrder));
  } catch {
    return [];
  }
}
