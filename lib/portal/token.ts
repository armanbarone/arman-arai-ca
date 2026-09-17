// Signed tokens for magic links and sessions. Web Crypto only, so the same code
// verifies a session in middleware (edge) and in server components (node).

export type Role = "client" | "admin";

export interface TokenPayload {
  k: "login" | "session";
  e: string; // email, lower-case
  r: Role;
  x: number; // expiry, ms since epoch
  j: string; // unique id
  n?: string; // where to land after login
}

export const SESSION_COOKIE = "aa_portal";
export const CLIENT_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;
export const LOGIN_LINK_MS = 15 * 60 * 1000;
export const INVITE_LINK_MS = 7 * 24 * 60 * 60 * 1000;

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function secret(): string {
  const s = process.env.PORTAL_SECRET;
  if (!s || s.length < 32) throw new Error("PORTAL_SECRET is not set");
  return s;
}

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function randomId(bytes = 18): string {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function signToken(payload: TokenPayload): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return `${body}.${b64url(await hmac(body))}`;
}

export async function verifyToken(token: string | undefined | null, kind: TokenPayload["k"]): Promise<TokenPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const expected = await hmac(body);
    if (!timingSafeEqual(expected, fromB64url(sig))) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as TokenPayload;
    if (payload.k !== kind || typeof payload.x !== "number" || payload.x < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
