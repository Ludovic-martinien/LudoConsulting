import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { memberLoginEvents, memberSessions, memberUsers } from "@/db/schema";

export const MEMBER_COOKIE = "ludo_member_session";
const OAUTH_STATE_COOKIE = "ludo_oauth_state";
const MEMBER_SESSION_DAYS = 30;

export type MemberProfile = {
  id: number;
  name: string;
  email: string;
  image: string | null;
  googleLinked: boolean;
  hasPassword: boolean;
  createdAt: Date;
};

export type MemberSession = { user: MemberProfile; expiresAt: Date };

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeCompare(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Origine publique (schéma + hôte) déduite de la requête, compatible proxy / preview. */
export function getOrigin(request: Request) {
  try {
    const headers = request.headers;
    const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || headers.get("host") || new URL(request.url).host;
    const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const proto = forwardedProto || new URL(request.url).protocol.replace(":", "") || "https";
    return `${proto}://${host}`;
  } catch {
    return null;
  }
}

export function isSecureRequest(request: Request) {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
    || new URL(request.url).protocol.replace(":", "");
  return proto === "https" || process.env.NODE_ENV === "production";
}

export type GoogleOAuthConfig = { clientId: string; clientSecret: string; redirectUri: string };

export function googleOAuthConfig(origin: string | null): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret || !origin) return null;
  return { clientId, clientSecret, redirectUri: `${origin}/api/member/google/callback` };
}

export function googleAuthUrl(config: GoogleOAuthConfig, state: string) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(config: GoogleOAuthConfig, code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }).toString(),
  });
  const data = await response.json() as { access_token?: string; error?: string };
  if (!response.ok || !data.access_token) throw new Error("Échange du code Google impossible.");
  return data.access_token;
}

export type GoogleProfile = { sub: string; email: string; verified: boolean; name: string; picture: string | null };

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json() as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email : "";
  const verified = data.verified_email === true || data.email_verified === true;
  const sub = typeof data.sub === "string" ? data.sub : "";
  if (!response.ok || !sub || !email) throw new Error("Profil Google illisible.");
  return {
    sub,
    email: email.toLowerCase(),
    verified,
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim().slice(0, 180) : email.split("@")[0],
    picture: typeof data.picture === "string" ? data.picture.slice(0, 1000) : null,
  };
}

export function memberCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MEMBER_SESSION_DAYS * 24 * 60 * 60,
  };
}

export function oauthStateCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
}

export async function createMemberSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + MEMBER_SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(memberSessions).values({
    tokenHash: sha256Hex(token),
    userId,
    expiresAt,
  });
  return { token, expiresAt };
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const store = await cookies();
  const token = store.get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = sha256Hex(token);
  const [row] = await db.select({
    expiresAt: memberSessions.expiresAt,
    id: memberUsers.id,
    name: memberUsers.name,
    email: memberUsers.email,
    image: memberUsers.image,
    googleId: memberUsers.googleId,
    passwordHash: memberUsers.passwordHash,
    createdAt: memberUsers.createdAt,
  }).from(memberSessions).innerJoin(memberUsers, eq(memberSessions.userId, memberUsers.id))
    .where(eq(memberSessions.tokenHash, tokenHash)).limit(1);
  if (!row) return null;
  if (row.expiresAt <= new Date()) {
    await db.delete(memberSessions).where(eq(memberSessions.tokenHash, tokenHash));
    return null;
  }
  return {
    expiresAt: row.expiresAt,
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      googleLinked: Boolean(row.googleId),
      hasPassword: Boolean(row.passwordHash),
      createdAt: row.createdAt,
    },
  };
}

export async function destroyMemberSession() {
  const store = await cookies();
  const token = store.get(MEMBER_COOKIE)?.value;
  if (token) await db.delete(memberSessions).where(eq(memberSessions.tokenHash, sha256Hex(token)));
}

export async function getOAuthState() {
  const store = await cookies();
  return store.get(OAUTH_STATE_COOKIE)?.value ?? null;
}

export type LoginMethod = "register" | "password" | "google";

/** Journal non bloquant des connexions (transparence et sécurité du compte). */
export async function logMemberEvent(userId: number, method: LoginMethod, request: Request) {
  try {
    await db.insert(memberLoginEvents).values({
      userId,
      method,
      userAgent: request.headers.get("user-agent")?.slice(0, 200) ?? null,
    });
  } catch {
    /* Le journal ne doit jamais bloquer une connexion. */
  }
}

export async function getRecentLogins(userId: number, limit = 5) {
  return db.select({
    method: memberLoginEvents.method,
    createdAt: memberLoginEvents.createdAt,
  }).from(memberLoginEvents).where(eq(memberLoginEvents.userId, userId))
    .orderBy(desc(memberLoginEvents.createdAt)).limit(limit);
}
