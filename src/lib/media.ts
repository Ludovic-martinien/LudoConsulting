export type MediaKind =
  | "profile-photo"
  | "logo-hydro-track"
  | "logo-ludoconnect"
  | "logo-safegabon"
  | "logo-taf-gab"
  | "logo-edu-nify"
  | "logo-edulink"
  | "logo-site"
  | "logo-dis-school"
  | "image-gestcom"
  | "image-ludoconnect-alt"
  | "cover-edu-nify-app"
  | "cover-edulink-app"
  | "cover-dis-school-app";

export type MediaDefinition = {
  kind: MediaKind;
  group: "profile" | "logo" | "cover";
  labelFr: string;
  labelEn: string;
  maxBytes: number;
};

export const mediaKinds: MediaDefinition[] = [
  { kind: "profile-photo", group: "profile", labelFr: "Photo du responsable", labelEn: "Lead's portrait", maxBytes: 5 * 1024 * 1024 },
  { kind: "logo-hydro-track", group: "logo", labelFr: "Logo officiel — Hydro-Track", labelEn: "Official logo — Hydro-Track", maxBytes: 2 * 1024 * 1024 },
  { kind: "logo-ludoconnect", group: "logo", labelFr: "Logo officiel — LudoConnect", labelEn: "Official logo — LudoConnect", maxBytes: 2 * 1024 * 1024 },
  { kind: "logo-safegabon", group: "logo", labelFr: "Logo officiel — SafeGabon", labelEn: "Official logo — SafeGabon", maxBytes: 2 * 1024 * 1024 },
  { kind: "logo-taf-gab", group: "logo", labelFr: "Logo officiel — TAF-GAB 2.0", labelEn: "Official logo — TAF-GAB 2.0", maxBytes: 2 * 1024 * 1024 },
  { kind: "logo-edu-nify", group: "logo", labelFr: "Logo officiel — Edu-Nify", labelEn: "Official logo — Edu-Nify", maxBytes: 2 * 1024 * 1024 },
  { kind: "logo-site", group: "logo", labelFr: "Logo du site — Ludo_Consulting", labelEn: "Site logo — Ludo_Consulting", maxBytes: 2 * 1024 * 1024 },
  { kind: "logo-edulink", group: "logo", labelFr: "Logo officiel — EduLink", labelEn: "Official logo — EduLink", maxBytes: 2 * 1024 * 1024 },
  { kind: "logo-dis-school", group: "logo", labelFr: "Logo officiel — Dis'School", labelEn: "Official logo — Dis'School", maxBytes: 2 * 1024 * 1024 },
  { kind: "image-gestcom", group: "cover", labelFr: "Visuel — Gestion commerciale", labelEn: "Visual — Business management", maxBytes: 5 * 1024 * 1024 },
  { kind: "image-ludoconnect-alt", group: "cover", labelFr: "Visuel complémentaire — LudoConnect", labelEn: "Extra visual — LudoConnect", maxBytes: 5 * 1024 * 1024 },
  { kind: "cover-edu-nify-app", group: "cover", labelFr: "Capture — application Edu-Nify", labelEn: "Screenshot — Edu-Nify app", maxBytes: 5 * 1024 * 1024 },
  { kind: "cover-edulink-app", group: "cover", labelFr: "Capture — application EduLink", labelEn: "Screenshot — EduLink app", maxBytes: 5 * 1024 * 1024 },
  { kind: "cover-dis-school-app", group: "cover", labelFr: "Capture — application Dis'School", labelEn: "Screenshot — Dis'School app", maxBytes: 5 * 1024 * 1024 },
];

export const mediaKindValues = mediaKinds.map((item) => item.kind);

export function isMediaKind(value: string): value is MediaKind {
  return (mediaKindValues as string[]).includes(value);
}

export function mediaUrl(kind: MediaKind, version?: Date | string | null) {
  const stamp = version ? new Date(version).getTime() : null;
  return `/api/media/${kind}${stamp ? `?v=${stamp}` : ""}`;
}

export const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const acceptedImageLabel = "JPG, PNG ou WebP";
