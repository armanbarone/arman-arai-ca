import type { PackageId } from "./catalog";
export interface ChristmasSettings {
  enabled: boolean; studioAddress: string; postalCode: string; arrivalNotes: string;
  cancellationPolicy: string; publishableKey: string;
}
export interface Reservation {
  id: string; tokenHash: string; packageId: PackageId; name: string; email: string; phone: string;
  createdAt: number; expiresAt: number; subtotalCents: number; status: "pending" | "paid";
  sessionId?: string; paidCents?: number; paymentIntent?: string; emailsSent?: boolean;
  bookingDetails: { studioAddress: string; postalCode: string; arrivalNotes: string; cancellationPolicy: string };
}
export interface Slot {
  id: string; date: string; time: string; santa: boolean; published: boolean; reservation?: Reservation;
}
export interface Versioned<T> { data: T; etag: string }
export interface InventoryStore {
  read(id: string): Promise<Versioned<Slot> | null>;
  write(id: string, data: Slot, etag: string): Promise<void>;
  conflict(error: unknown): boolean;
}
export const SLOT_PATTERN = /^2026-(?:11|12)-\d{2}_\d{4}$/;
export function validSlot(date: string, time: string) {
  if (!/^2026-(11|12)-\d{2}$/.test(date) || !/^(?:0[9]|1[0-6]):[0-5]\d$/.test(time)) return false;
  const d = new Date(date + "T12:00:00Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === date && date >= "2026-11-27" && date <= "2026-12-23";
}
// A 40-minute appointment safely contains the 20-minute Santa package with generous turnover time.
export function overlaps(a: Pick<Slot, "date" | "time">, b: Pick<Slot, "date" | "time">) {
  const minutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  return a.date === b.date && Math.abs(minutes(a.time) - minutes(b.time)) < 40;
}
export async function claimSlot(store: InventoryStore, id: string, booking: Reservation, needsSanta: boolean): Promise<Slot> {
  if (!SLOT_PATTERN.test(id)) throw Error("Choose a valid appointment.");
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await store.read(id);
    if (!current?.data.published || current.data.reservation) throw Error("That appointment is no longer available. Please choose another time.");
    if (needsSanta && !current.data.santa) throw Error("Santa is not available for this appointment.");
    if (new Date(`${current.data.date}T${current.data.time}:00-08:00`).getTime() <= Date.now()) throw Error("That appointment has passed.");
    const next = { ...current.data, reservation: booking };
    try { await store.write(id, next, current.etag); return next; }
    catch (error) { if (!store.conflict(error)) throw error; }
  }
  throw Error("The calendar is updating. Please try again.");
}
