import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export const MEMBER_COOKIE = "ludo_member_session";
const MEMBER_SESSION_DURATION = 30 * 24 * 60 * 60; // 30 jours

export type MemberSession = {
  uid: number;
  email: string;
  name: string;
  avatar: string | null;
  tv: number;
  iat: number;
  exp: number;
};

/* Le secret de session membre est persistant : variable d'environnement
   d'abord, sinon secret auto-généré conservé en base (survit aux
   réinitialisations du fichier .env de l'environnement). */
let cachedMemberSecret: string | null = null;

export async function memberSecret(): Promise<string> {
  const fromEnv = process.env.MEMBER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (cachedMemberSecret) return cachedMemberSecret;
  const [row] = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "member_session_secret"))
    .limit(1);
  const stored = (row?.value as { secret?: unknown } | undefined)?.secret;
  if (typeof stored === "string" && stored.length >= 32) {
    cachedMemberSecret = stored;
    return stored;
  }
  const fresh = randomBytes(48).toString("base64");
  await db
    .insert(siteSettings)
    .values({ key: "member_session_secret", value: { secret: fresh } })
    .onConflictDoNothing();
  const [again] = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "member_session_secret"))
    .limit(1);
  const finalSecret = (again?.value as { secret?: unknown } | undefined)?.secret;
  if (typeof finalSecret !== "string" || finalSecret.length < 32) {
    throw new Error("Secret de session membre indisponible.");
  }
  cachedMemberSecret = finalSecret;
  return finalSecret;
}

export async function memberSecretAvailable() {
  try {
    await memberSecret();
    return true;
  } catch {
    return false;
  }
}

async function sign(value: string) {
  return createHmac("sha256", await memberSecret()).update(value).digest("base64url");
}

export function hashMemberPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyMemberPassword(password: string, encodedHash: string | null) {
  if (!encodedHash) return false;
  const parts = encodedHash.includes(":") ? encodedHash.split(":") : encodedHash.split("$");
  const [algorithm, salt, expectedHex, extra] = parts;
  if (algorithm !== "scrypt" || !salt || !expectedHex || extra || !/^[0-9a-f]{32,128}$/i.test(salt) || !/^[0-9a-f]{128}$/i.test(expectedHex)) return false;
  try {
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function createMemberToken(member: { id: number; email: string; name: string; avatarUrl: string | null; tokenVersion: number }) {
  const now = Math.floor(Date.now() / 1000);
  const payload: MemberSession = {
    uid: member.id,
    email: member.email,
    name: member.name,
    avatar: member.avatarUrl,
    tv: member.tokenVersion,
    iat: now,
    exp: now + MEMBER_SESSION_DURATION,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${await sign(encoded)}`;
}

export async function verifyMemberToken(token: string | undefined): Promise<MemberSession | null> {
  if (!token) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;
  try {
    const expected = Buffer.from(await sign(encoded));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as MemberSession;
    const now = Math.floor(Date.now() / 1000);
    if (!session.uid || !session.exp || session.exp <= now || session.iat > now + 30) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getMemberSession() {
  const cookieStore = await cookies();
  return verifyMemberToken(cookieStore.get(MEMBER_COOKIE)?.value);
}

export const memberCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: "lax" as const, // lax : requis pour le retour du callback OAuth Google
  path: "/",
  maxAge: MEMBER_SESSION_DURATION,
});

/* ------------------------------ Google OAuth ------------------------------ */

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

/** URL publique du site : variable configurée d'abord, sinon hôte de la requête. */
export function publicBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || url.host;
  const isLocal = /^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(host);
  // Les proxys terminent souvent TLS en http interne : tout hôte public est en https.
  // (Google exige d'ailleurs une URI de redirection https, sauf localhost.)
  const proto = isLocal ? "http" : "https";
  return `${proto}://${host}`;
}

export function googleRedirectUri(request: Request) {
  return `${publicBaseUrl(request)}/api/auth/google/callback`;
}

export async function googleStateToken() {
  const nonce = randomBytes(16).toString("hex");
  const issuedAt = String(Date.now());
  const payload = `${nonce}.${issuedAt}`;
  return `${payload}.${createHmac("sha256", await memberSecret()).update(payload).digest("base64url")}`;
}

export async function verifyGoogleState(state: string | null) {
  if (!state) return false;
  const [nonce, issuedAt, signature, extra] = state.split(".");
  if (!nonce || !issuedAt || !signature || extra) return false;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > 10 * 60 * 1000) return false;
  const expected = Buffer.from(createHmac("sha256", await memberSecret()).update(`${nonce}.${issuedAt}`).digest("base64url"));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export type GoogleProfile = { sub: string; email: string; name: string; picture: string | null; emailVerified: boolean };

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) throw new Error(`Échange du code Google refusé (${tokenResponse.status}). Vérifiez GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et l'URI de redirection enregistrée.`);
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Google n'a pas renvoyé de jeton d'accès.");
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileResponse.ok) throw new Error("Profil Google illisible.");
  const profile = (await profileResponse.json()) as { sub?: string; email?: string; name?: string; picture?: string; email_verified?: boolean };
  if (!profile.sub || !profile.email) throw new Error("Profil Google incomplet.");
  return {
    sub: profile.sub,
    email: profile.email.toLowerCase(),
    name: profile.name?.trim() || profile.email.split("@")[0],
    picture: profile.picture || null,
    emailVerified: profile.email_verified === true,
  };
}
