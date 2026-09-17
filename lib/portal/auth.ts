import "server-only";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { APP_URL, isAdminEmail } from "./business";
import { esc, footerText, layout, sendEmail } from "./email";
import { ConflictError, getBooking, listBookings, readJson, writeJson } from "./store";
import type { Booking } from "./types";
import {
  ADMIN_SESSION_MS, CLIENT_SESSION_MS, INVITE_LINK_MS, LOGIN_LINK_MS, SESSION_COOKIE,
  randomId, sha256Hex, signToken, verifyToken, type Role, type TokenPayload,
} from "./token";

export interface Session { email: string; role: Role }

export async function requestMeta() {
  const h = await headers();
  return {
    ip: (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown",
    userAgent: h.get("user-agent") || "unknown",
  };
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const payload = await verifyToken(jar.get(SESSION_COOKIE)?.value, "session");
  if (!payload) return null;
  // A session minted for an admin stops being one the moment the address is
  // removed from ADMIN_EMAILS.
  if (payload.r === "admin" && !isAdminEmail(payload.e)) return null;
  return { email: payload.e, role: payload.r };
}

export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s || s.role !== "admin") redirect("/portal/login?next=/admin");
  return s;
}

/**
 * The only way a portal page gets a booking. A signed-in client who is not one
 * of the two people on it gets a 404, the same response as a booking that does
 * not exist, so references cannot be probed.
 */
export async function requireBookingAccess(ref: string): Promise<{ session: Session; booking: Booking }> {
  const session = await getSession();
  if (!session) redirect(`/portal/login?next=/portal/${encodeURIComponent(ref)}`);
  const booking = await getBooking(ref);
  if (!booking) notFound();
  if (session.role !== "admin" && !booking.clients.some((c) => c.email === session.email)) notFound();
  return { session, booking };
}

export async function bookingsForEmail(email: string): Promise<Booking[]> {
  const all = await listBookings();
  return all.filter((b) => b.status !== "cancelled" && b.clients.some((c) => c.email === email));
}

// ------------------------------------------------------------ magic links

async function underRateLimit(key: string, max: number): Promise<boolean> {
  const windowStart = Math.floor(Date.now() / (15 * 60 * 1000));
  const p = `auth/rate/${(await sha256Hex(key)).slice(0, 32)}-${windowStart}.json`;
  const current = await readJson<{ count: number }>(p);
  const count = (current?.data.count ?? 0) + 1;
  try {
    await writeJson(p, { count }, current ? { etag: current.etag } : { createOnly: true });
  } catch (err) {
    if (!(err instanceof ConflictError)) throw err;
  }
  return count <= max;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function loginUrl(email: string, role: Role, ttl: number, next?: string): Promise<string> {
  const token = await signToken({ k: "login", e: email, r: role, x: Date.now() + ttl, j: randomId(), n: next });
  return `${APP_URL}/portal/verify?t=${encodeURIComponent(token)}`;
}

/** Sends a sign-in link if the address belongs to an admin or a booked couple. Never says which. */
export async function requestLoginLink(rawEmail: string, next?: string): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  const { ip } = await requestMeta();
  if (!(await underRateLimit(`email:${email}`, 5)) || !(await underRateLimit(`ip:${ip}`, 20))) return;

  const admin = isAdminEmail(email);
  if (!admin && (await bookingsForEmail(email)).length === 0) return;

  const url = await loginUrl(email, admin ? "admin" : "client", LOGIN_LINK_MS, safeNext(next));
  await sendEmail({
    to: email,
    subject: "Your sign-in link for your Arman Arai portal",
    html: layout({
      heading: "Sign in to your portal",
      bodyHtml: `<p>Use the button below to open your planning portal. The link works once and expires in 15 minutes.</p><p style="font-size:14px;color:#6B5A48">If you did not ask for this, you can ignore this email.</p>`,
      button: { label: "Open my portal", href: url },
    }),
    text: `Open your planning portal (works once, expires in 15 minutes):\n${url}\n\nIf you did not ask for this, ignore this email.${footerText()}`,
  });
}

/** Admin-initiated invitation: a longer-lived link sent to one partner on a booking. */
export async function sendInvite(booking: Booking, clientEmail: string): Promise<void> {
  const client = booking.clients.find((c) => c.email === clientEmail);
  if (!client) throw new Error("That email is not on this booking.");
  const url = await loginUrl(client.email, "client", INVITE_LINK_MS, `/portal/${booking.ref}`);
  const name = client.preferredName || client.legalName.split(" ")[0];
  await sendEmail({
    to: client.email,
    subject: `Your elopement portal is ready (${booking.ref})`,
    html: layout({
      heading: `${esc(name)}, your portal is ready`,
      bodyHtml: `<p>Everything for your elopement lives in one private place: your agreement and work order to review and sign, your payment schedule, and a live planning checklist showing what has been arranged and what is still to come.</p><p>The button below signs you in directly. It works once and stays valid for 7 days. After that, you can request a fresh link from the sign-in page with this email address.</p>`,
      button: { label: "Open my portal", href: url },
    }),
    text: `${name}, your elopement portal is ready.\n\nYour agreement and work order, payment schedule and planning checklist are here (link works once, valid 7 days):\n${url}${footerText()}`,
  });
}

export function safeNext(next?: string | null): string | undefined {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return undefined;
  return next.startsWith("/portal") || next.startsWith("/admin") ? next : undefined;
}

export async function inspectLoginToken(token: string): Promise<TokenPayload | null> {
  return verifyToken(token, "login");
}

/** Consumes a login token exactly once and starts a session. Returns where to go, or null. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  const payload = await verifyToken(token, "login");
  if (!payload) return null;
  const role: Role = payload.r === "admin" && isAdminEmail(payload.e) ? "admin" : "client";
  try {
    await writeJson(`auth/used/${payload.j}.json`, { at: new Date().toISOString() }, { createOnly: true });
  } catch (err) {
    if (err instanceof ConflictError) return null;
    throw err;
  }
  const ttl = role === "admin" ? ADMIN_SESSION_MS : CLIENT_SESSION_MS;
  const session = await signToken({ k: "session", e: payload.e, r: role, x: Date.now() + ttl, j: randomId() });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ttl / 1000),
  });
  return payload.n || (role === "admin" ? "/admin" : "/portal");
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
