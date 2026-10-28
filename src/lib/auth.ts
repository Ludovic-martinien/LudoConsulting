import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ludo_admin_session";
export type AdminRole = "admin" | "editor" | "sales";
export type AdminSession = { email: string; role: AdminRole; issuedAt: number; expiresAt: number };
const SESSION_DURATION = 8 * 60 * 60;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(email: string, role: AdminRole) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = { email, role, issuedAt: now, expiresAt: now + SESSION_DURATION };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;
  try {
    const expected = Buffer.from(sign(encoded));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    if (!session.email || !session.expiresAt || session.expiresAt <= now || session.issuedAt > now + 30) return null;
    if (!["admin", "editor", "sales"].includes(session.role)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export function verifyAdminPassword(password: string, encodedHash: string) {
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

export const sessionCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_DURATION,
});
