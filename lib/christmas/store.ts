import "server-only";
import { ConflictError, readJson, writeJson } from "@/lib/portal/store";
import { seasonalSlots, BOOKING_POLICY } from "./catalog";
import { mergeSeasonalInventory, markOwnerSoldOutSlots, recalculateReservationBlocks, overlaps, reservationCapacity, validSlot, type Reservation, type ChristmasSettings, type Slot, type InventoryStore } from "./inventory";
export const SETTINGS_PATH = "christmas/2026/settings.json";
const INVENTORY_PATH = "christmas/2026/inventory.json";
const CALENDAR_PATH = "christmas/2026/calendar.json";
export const slotPath = (id: string) => `christmas/2026/slots/${id}.json`;
type Calendar = { season?: string; slots: Slot[] };
const SEASON_VERSION = "nov09-dec20-hourly-albums-v3";
const CALENDAR_VERSION = "nov09-dec20-half-hour-owner-blocks-v6";
const defaults: ChristmasSettings = { enabled: true, studioAddress: "583 E Kings Rd, North Vancouver, BC", postalCode: "V7N 1J2", arrivalNotes: "Plenty of street parking. Please arrive dressed and ready for your appointment.", cancellationPolicy: BOOKING_POLICY, publishableKey: "", launchVersion: SEASON_VERSION };
export async function settings() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const saved = await readJson<ChristmasSettings>(SETTINGS_PATH);
    if (saved?.data.launchVersion === SEASON_VERSION) return saved.data;
    // Apply the owner's November launch terms once; later admin changes are retained.
    const cfg = { ...defaults, publishableKey: saved?.data.publishableKey || "" };
    try { await writeJson(SETTINGS_PATH, cfg, saved ? { etag: saved.etag } : { createOnly: true }); return cfg; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("Booking settings changed. Please retry.");
}
async function calendar() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const saved = await readJson<Calendar>(CALENDAR_PATH);
    if (saved?.data.season === CALENDAR_VERSION) return saved;
    const index = saved ? null : (await readJson<{ ids: string[] }>(INVENTORY_PATH))?.data;
    const legacy = saved?.data.slots ?? (await Promise.all((index?.ids ?? []).map(id => readJson<Slot>(slotPath(id))))).flatMap(row => row ? [row.data] : []);
    const generated: Slot[] = seasonalSlots().map(({ available, status: _status, ...slot }) => ({ ...slot, published: available }));
    // The owner has opened all scheduled times. Preserve paid/held appointments
    // and explicit manual blocks; remove only the former automatic release limits.
    const prior = legacy.map(s => ({ ...s, published: s.manuallyBlocked ? false : true }));
    const slots = markOwnerSoldOutSlots(mergeSeasonalInventory(prior, generated));
    try { await writeJson(CALENDAR_PATH, { season: CALENDAR_VERSION, slots }, saved ? { etag: saved.etag } : { createOnly: true }); }
    catch (error) { if (error instanceof ConflictError) continue; throw error; }
    const result = await readJson<Calendar>(CALENDAR_PATH);
    if (result) return result;
  }
  throw Error("Calendar could not be initialized. Please retry.");
}
export async function allSlots(): Promise<Slot[]> { return (await calendar()).data.slots; }
// The same compare-and-swap document contains dated bookings and undated
// reservations, so two customers cannot buy the final capacity unit.
export async function claimFlexibleReservation(reservation: Reservation): Promise<Slot> {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (Date.now() >= new Date("2026-12-14T16:30:00-08:00").getTime()) throw Error("Bookings are not open for this Christmas collection anymore.");
    const row = await calendar();
    if (!reservationCapacity(row.data.slots, !!reservation.testMode).checkoutAvailable) throw Error("All remaining sessions are sold out or currently in checkout. Please try again shortly.");
    const slot: Slot = { id: `2026-reservation_${reservation.id.slice(-20)}`, flexible: true, date: "", time: "", santa: true, published: false, reservation };
    row.data.slots.push(slot);
    try { await writeJson(CALENDAR_PATH, row.data, { etag: row.etag }); return slot; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("The reservation count is updating. Please try again.");
}
export async function assignFlexibleReservation(id: string, date: string, time: string) {
  if (date < "2026-12-01" || date > "2026-12-14" || !validSlot(date, time) || new Date(`${date}T${time}:00-08:00`).getTime() <= Date.now()) throw Error("Choose a future appointment from December 1–14 within your Christmas opening hours.");
  for (let attempt = 0; attempt < 10; attempt++) {
    const row = await calendar(), slot = row.data.slots.find(s => s.id === id);
    if (!slot?.flexible || slot.reservation?.status !== "paid") throw Error("Choose a paid reservation awaiting scheduling.");
    if (slot.date === date && slot.time === time) return;
    const target = row.data.slots.find(s => s.date === date && s.time === time && !s.flexible);
    if (!target || target.manuallyBlocked || target.manuallySoldOut || row.data.slots.some(s => s.id !== id && s.reservation && overlaps(s, { date, time, reservation: slot.reservation }))) throw Error("That appointment is sold out or blocked. Choose another time.");
    slot.date = date; slot.time = time; slot.reservation.scheduleVersion = (slot.reservation.scheduleVersion ?? 0) + 1;
    delete slot.reservation.googleCalendarSyncedAt;
    if (slot.reservation.paymentPlan) slot.reservation.paymentPlan.balanceDueAt = new Date(`${date}T${time}:00-08:00`).getTime();
    recalculateReservationBlocks(row.data.slots);
    try { await writeJson(CALENDAR_PATH, row.data, { etag: row.etag }); return; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("The calendar is updating. Please try again.");
}
export const inventoryStore: InventoryStore = {
  read: async id => { const row = await calendar(); const data = row.data.slots.find(s => s.id === id); return data ? { data, etag: row.etag } : null; },
  write: async (id, data, etag) => {
    const row = await calendar();
    if (row.etag !== etag) throw new ConflictError();
    const at = row.data.slots.findIndex(s => s.id === id);
    if (at < 0) throw Error("Appointment not found.");
    if (data.reservation && !row.data.slots[at].reservation && row.data.slots.some(s => s.id !== id && s.reservation && overlaps(s, data))) throw Error("That appointment overlaps an existing booking. Choose another time.");
    row.data.slots[at] = data;
    recalculateReservationBlocks(row.data.slots);
    await writeJson(CALENDAR_PATH, row.data, { etag });
  },
  conflict: error => error instanceof ConflictError,
};
export async function updateSlot(id: string, change: (s: Slot) => void) {
  for (let n = 0; n < 5; n++) {
    const current = await inventoryStore.read(id);
    if (!current) throw Error("Appointment not found.");
    change(current.data);
    try { await inventoryStore.write(id, current.data, current.etag); return current.data; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("Appointment changed. Please retry.");
}
export async function addSlot(slot: Slot) {
  for (let n = 0; n < 5; n++) {
    const row = await calendar();
    const existing = row.data.slots.find(s => s.id === slot.id);
    if (existing?.reservation) throw Error("A reserved appointment cannot be changed.");
    if (row.data.slots.some(s => s.id !== slot.id && overlaps(s, slot))) throw Error("Appointments must be at least 30 minutes apart and cannot overlap existing bookings.");
    if (existing) Object.assign(existing, slot); else row.data.slots.push(slot);
    row.data.slots.sort((a, b) => a.id.localeCompare(b.id));
    try { await writeJson(CALENDAR_PATH, row.data, { etag: row.etag }); return; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("Calendar changed. Retry adding this appointment.");
}
