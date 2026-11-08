import "server-only";
import { createHash } from "node:crypto";
import { getToken, startAuthorization } from "@vercel/connect";
import { APP_URL, BUSINESS } from "@/lib/portal/business";
import { money } from "./catalog";
import { allocatedMinutes, type Slot } from "./inventory";
import { inventoryStore, updateSlot } from "./store";

const SCOPE = "https://www.googleapis.com/auth/calendar.events.owned";
const tokenParams = { subject: { type: "user" as const, id: BUSINESS.email }, scopes: [SCOPE] };
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function calendarConnectionState() {
  const connector = process.env.CHRISTMAS_GOOGLE_CONNECTOR_UID || "";
  return { connector, configured: /^(?:(?:google|oauth)\/[a-z0-9][a-z0-9_-]{1,100}|scl_[a-zA-Z0-9]+)$/.test(connector), activeEnvironment: process.env.VERCEL_ENV === "production", calendarEmail: BUSINESS.email };
}
export async function calendarAuthorizationUrl() {
  const state = calendarConnectionState();
  if (!state.activeEnvironment) throw Error("Google authorization becomes available after this preview is approved and launched.");
  if (!state.configured) throw Error("The website’s Google connection needs its one-time setup first.");
  const result = await startAuthorization(state.connector, tokenParams, { callbackUrl: `${APP_URL}/admin/christmas?google=returned`, expiresInMs: 600000 });
  const url = new URL(result.url);
  if (url.protocol !== "https:" || !(url.hostname === "vercel.com" || url.hostname.endsWith(".vercel.com") || url.hostname === "accounts.google.com")) throw Error("Google returned an unexpected authorization address.");
  return result.url;
}

/** Verify the website's grant against the intended calendar. The field mask
 * returns only the access role; personal event contents are never requested. */
export async function calendarConnectionHealth() {
  const state = calendarConnectionState();
  if (!state.activeEnvironment) return { status: "preview" as const };
  if (!state.configured) return { status: "setup_required" as const };
  try {
    const token = await getToken(state.connector, tokenParams, { forceRefresh: true });
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(BUSINESS.email)}/events?maxResults=1&fields=accessRole`;
    const response = await request(token, url, "GET");
    if (!response.ok) return { status: "not_connected" as const };
    const calendar = await response.json() as { accessRole?: string };
    return { status: calendar.accessRole === "owner" ? "connected" as const : "not_connected" as const };
  } catch {
    return { status: "not_connected" as const };
  }
}

export function christmasCalendarEvent(slot: Slot) {
  const r = slot.reservation;
  if (!r || r.status !== "paid") throw Error("Only paid Christmas bookings can enter Google Calendar.");
  const start = new Date(`${slot.date}T${slot.time}:00-08:00`);
  if (!Number.isFinite(start.getTime())) throw Error("The booked appointment has an invalid date.");
  const minutes = r.packageSnapshot?.minutes ?? 20, allocation = allocatedMinutes(r);
  const id = "aa" + hash(`christmas-2026:calendar:${r.id}`);
  return {
    id,
    summary: `Christmas with Santa · ${r.name}`,
    location: `${r.bookingDetails.studioAddress}, ${r.bookingDetails.postalCode}`,
    description: [
      `${minutes}-minute photo session${allocation > minutes ? ` + ${allocation - minutes}-minute changeover` : ""}.`,
      `Family: ${r.name}`, `Email: ${r.email}`, `Phone: ${r.phone}`,
      `Package: ${r.packageSnapshot?.name ?? "Christmas with Santa"}`,
      `Digital photos: ${r.packageSnapshot?.images ?? 10} · Printed albums: ${r.albums ?? 0}`,
      `Paid: ${money(r.paidCents ?? r.totalCents ?? r.subtotalCents)} CAD`,
      `Booking reference: ${r.id}`, `${APP_URL}/admin/christmas?date=${slot.date}`,
    ].join("\n"),
    start: { dateTime: start.toISOString(), timeZone: "America/Vancouver" },
    end: { dateTime: new Date(start.getTime() + allocation * 60000).toISOString(), timeZone: "America/Vancouver" },
    visibility: "private", transparency: "opaque",
    extendedProperties: { private: { christmasBookingId: r.id, service: "christmas-2026" } },
  };
}

type GoogleEvent = { id?: string; htmlLink?: string; extendedProperties?: { private?: { christmasBookingId?: string } } };
async function request(token: string, url: string, method: string, body?: unknown) {
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", signal: AbortSignal.timeout(10000) });
  return response;
}

export async function syncChristmasCalendar(slotId: string) {
  const state = calendarConnectionState();
  // Test deployments never write real calendar events, even if a token is present.
  if (!state.activeEnvironment) return { status: "preview" as const };
  if (!state.configured) return { status: "setup_required" as const };
  const slot = (await inventoryStore.read(slotId))?.data, r = slot?.reservation;
  if (!slot || !r || r.status !== "paid") return { status: "not_paid" as const };
  const event = christmasCalendarEvent(slot), fingerprint = hash(JSON.stringify(event));
  if (r.googleCalendarEventId === event.id && r.googleCalendarFingerprint === fingerprint && r.googleCalendarSyncedAt) return { status: "synced" as const };
  try {
    const token = await getToken(state.connector, tokenParams);
    const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(BUSINESS.email)}/events`;
    let response = await request(token, `${base}?sendUpdates=none`, "POST", event);
    if (response.status === 409) {
      const existing = await request(token, `${base}/${event.id}`, "GET");
      if (!existing.ok) throw Error(`Google Calendar could not verify the existing event (${existing.status}).`);
      const data = await existing.json() as GoogleEvent;
      if (data.extendedProperties?.private?.christmasBookingId !== r.id) throw Error("An unrelated Google event already uses this booking identifier.");
      const { id: _id, ...updates } = event;
      response = await request(token, `${base}/${event.id}?sendUpdates=none`, "PATCH", updates);
    }
    if (!response.ok) throw Error(`Google Calendar rejected the booking (${response.status}). Reconnect or retry from the admin calendar.`);
    const saved = await response.json() as GoogleEvent;
    if (saved.id !== event.id) throw Error("Google Calendar returned an unexpected booking identifier.");
    let eventUrl: string | undefined;
    try { const u = new URL(saved.htmlLink || ""); if (u.protocol === "https:" && (u.hostname === "calendar.google.com" || u.hostname === "www.google.com" && u.pathname.startsWith("/calendar/"))) eventUrl = u.href; } catch { /* The event remains valid without an optional link. */ }
    await updateSlot(slotId, s => { if (s.reservation?.id === r.id) Object.assign(s.reservation, { googleCalendarEventId: event.id, googleCalendarFingerprint: fingerprint, googleCalendarSyncedAt: Date.now(), googleCalendarEventUrl: eventUrl, googleCalendarLastError: undefined }); });
    return { status: "synced" as const };
  } catch (error) {
    const latest = (await inventoryStore.read(slotId))?.data.reservation;
    if (latest?.id === r.id && latest.googleCalendarFingerprint === fingerprint && latest.googleCalendarSyncedAt) return { status: "synced" as const };
    await updateSlot(slotId, s => { if (s.reservation?.id === r.id) s.reservation.googleCalendarLastError = "Google Calendar needs a connection check or retry. Payment and appointment remain confirmed."; });
    // No provider response bodies, OAuth tokens or questionnaire answers are logged.
    throw error;
  }
}
