import type { PackageId } from "./catalog";
import { createHash } from "node:crypto";
import { isSeasonDate, scheduledTime, type PublicSlot, type RecentBooking } from "./catalog.ts";
import type { FamilyQuestionnaire } from "./questionnaire-schema";
export interface ChristmasSettings {
  enabled: boolean; studioAddress: string; postalCode: string; arrivalNotes: string;
  cancellationPolicy: string; publishableKey: string;
  launchVersion?: string;
}
export interface Reservation {
  id: string; tokenHash: string; packageId: PackageId; name: string; email: string; phone: string;
  createdAt: number; expiresAt: number; subtotalCents: number; status: "pending" | "paid";
  grinch?: boolean; totalCents?: number; delivery?: { letterNames: string; line1: string; line2: string; city: string; postalCode: string; province: "BC"; country: "CA" };
  albums?: number; shareActivity?: boolean; paidAt?: number; gstCents?: number; pstCents?: number;
  testMode?: boolean; ownerPaymentCheck?: boolean;
  packageSnapshot?: { name: string; minutes: number; images: number; sets: number; santa: boolean };
  sessionId?: string; invoiceId?: string; invoiceUrl?: string; paidCents?: number; paymentIntent?: string; emailsSent?: boolean;
  welcomeSentAt?: number; questionnaireSentAt?: number; studioSentAt?: number;
  googleCalendarEventId?: string; googleCalendarFingerprint?: string; googleCalendarSyncedAt?: number; googleCalendarEventUrl?: string; googleCalendarLastError?: string;
  questionnaire?: { answers: FamilyQuestionnaire; submittedAt: number; updatedAt: number };
  bookingDetails: { studioAddress: string; postalCode: string; arrivalNotes: string; cancellationPolicy: string };
}
export interface Slot {
  id: string; date: string; time: string; santa: boolean; published: boolean; reservation?: Reservation;
  manuallyBlocked?: boolean;
  reservationBlocked?: boolean;
}
export interface Versioned<T> { data: T; etag: string }
export interface InventoryStore {
  read(id: string): Promise<Versioned<Slot> | null>;
  write(id: string, data: Slot, etag: string): Promise<void>;
  conflict(error: unknown): boolean;
}
export const SLOT_PATTERN = /^2026-(?:11|12)-\d{2}_\d{4}$/;
export function validSlot(date: string, time: string) {
  return isSeasonDate(date) && scheduledTime(date, time);
}
export function allocatedMinutes(reservation?: Pick<Reservation, "packageSnapshot">) {
  if (!reservation) return 30;
  const minutes = reservation.packageSnapshot?.minutes ?? 20;
  // Honour the time already promised to legacy 20/45-minute bookings.
  return minutes === 30 ? 30 : minutes + (minutes <= 20 ? 10 : 15);
}
export function overlaps(a: Pick<Slot, "date" | "time" | "reservation">, b: Pick<Slot, "date" | "time" | "reservation">) {
  const minutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const duration = (s: typeof a) => allocatedMinutes(s.reservation);
  return a.date === b.date && minutes(a.time) < minutes(b.time) + duration(b) && minutes(b.time) < minutes(a.time) + duration(a);
}
export async function claimSlot(store: InventoryStore, id: string, booking: Reservation, needsSanta: boolean): Promise<Slot> {
  if (!SLOT_PATTERN.test(id)) throw Error("Choose a valid appointment.");
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await store.read(id);
    if (!current || current.data.id !== id || !validSlot(current.data.date, current.data.time)) throw Error("Choose a valid appointment.");
    if (!current?.data.published || current.data.reservation) throw Error("That appointment is no longer available. Please choose another time.");
    if (needsSanta && !current.data.santa) throw Error("Santa is not available for this appointment.");
    if (new Date(`${current.data.date}T${current.data.time}:00-08:00`).getTime() <= Date.now()) throw Error("That appointment has passed.");
    const next = { ...current.data, reservation: booking };
    try { await store.write(id, next, current.etag); return next; }
    catch (error) { if (!store.conflict(error)) throw error; }
  }
  throw Error("The calendar is updating. Please try again.");
}

export function recalculateReservationBlocks(rows: Slot[]) {
  for (const s of rows) if (s.reservationBlocked) {
    s.published = !s.manuallyBlocked && validSlot(s.date, s.time);
    delete s.reservationBlocked;
  }
  for (const reserved of rows.filter(s => s.reservation)) for (const s of rows) {
    if (s.id !== reserved.id && !s.reservation && s.published && overlaps(s, reserved)) { s.published = false; s.reservationBlocked = true; }
  }
  return rows;
}

// Retain every purchased/held appointment and release decision when the season changes.
export function mergeSeasonalInventory(existing: Slot[], generated: Slot[]): Slot[] {
  const byId = new Map(existing.map(s => [s.id, structuredClone(s)]));
  const rows = generated.map(s => {
    const old = byId.get(s.id);
    return old ? { ...old, published: s.published && old.published && validSlot(s.date, s.time) } : s;
  });
  const ids = new Set(rows.map(s => s.id));
  for (const old of existing) if (!ids.has(old.id)) rows.push({ ...old, published: false });
  return recalculateReservationBlocks(rows).sort((a, b) => a.id.localeCompare(b.id));
}

export function publicSlots(rows: Slot[], now = Date.now()): PublicSlot[] {
  return rows.filter(s => (scheduledTime(s.date, s.time) || s.reservation) && s.date >= "2026-11-01" && s.date <= "2026-12-20").map(s => {
    const past = new Date(`${s.date}T${s.time}:00-08:00`).getTime() <= now;
    const status = s.reservation?.status === "paid" ? "sold" : s.reservation ? "reserved" : !validSlot(s.date, s.time) || past ? "unavailable" : !s.published ? "unreleased" : "available";
    return { id: s.id, date: s.date, time: s.time, santa: s.santa, available: status === "available", status };
  });
}

// No synthetic bookings or personal details without the buyer's separate opt-in.
export function recentBookings(rows: Slot[], now = Date.now()): RecentBooking[] {
  return rows.filter(s => s.reservation?.status === "paid" && !s.reservation.ownerPaymentCheck && s.reservation.paidAt && s.reservation.paidAt <= now && s.reservation.paidAt > now - 86400000)
    .sort((a, b) => b.reservation!.paidAt! - a.reservation!.paidAt!).slice(0, 5).map(s => {
      const r = s.reservation!;
      const first = r.name.trim().split(/\s+/)[0].slice(0, 30);
      const city = r.delivery?.city.trim().slice(0, 50);
      return { id: createHash("sha256").update(r.id).digest("hex").slice(0, 24), text: r.shareActivity && first && city ? `${first} from ${city} booked a Christmas session` : "A family recently booked a Christmas session" };
    });
}
