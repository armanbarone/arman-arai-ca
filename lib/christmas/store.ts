import "server-only";
import { ConflictError, readJson, writeJson } from "@/lib/portal/store";
import { seasonalSlots } from "./catalog";
import { overlaps, type ChristmasSettings, type Slot, type InventoryStore } from "./inventory";
export const SETTINGS_PATH = "christmas/2026/settings.json";
const INVENTORY_PATH = "christmas/2026/inventory.json";
const CALENDAR_PATH = "christmas/2026/calendar.json";
export const slotPath = (id: string) => `christmas/2026/slots/${id}.json`;
type Calendar = { slots: Slot[] };
const defaults: ChristmasSettings = { enabled: false, studioAddress: "", postalCode: "", arrivalNotes: "", cancellationPolicy: "", publishableKey: "" };
export async function settings() { return (await readJson<ChristmasSettings>(SETTINGS_PATH))?.data ?? defaults; }
async function calendar() {
  const saved = await readJson<Calendar>(CALENDAR_PATH);
  if (saved) return saved;
  // Upgrade once to a single CAS ledger: one read per refresh rather than 486 reads.
  // Preserve legacy reservations and actual release decisions during the migration.
  const index = (await readJson<{ ids: string[] }>(INVENTORY_PATH))?.data;
  const old = (await Promise.all((index?.ids ?? []).map(id => readJson<Slot>(slotPath(id))))).flatMap(row => row ? [row.data] : []);
  const slots: Slot[] = seasonalSlots().map(({ available: _available, ...slot }) => ({ ...slot, published: true }));
  for (const legacy of old) {
    const existing = slots.findIndex(s => s.id === legacy.id);
    if (existing >= 0) slots[existing] = { ...legacy, santa: legacy.reservation ? legacy.santa : true };
    else slots.push(legacy);
    if (legacy.reservation) for (const slot of slots) if (slot.id !== legacy.id && overlaps(slot, legacy)) slot.published = false;
  }
  slots.sort((a, b) => a.id.localeCompare(b.id));
  try { await writeJson(CALENDAR_PATH, { slots }, { createOnly: true }); }
  catch (error) { if (!(error instanceof ConflictError)) throw error; }
  const result = await readJson<Calendar>(CALENDAR_PATH);
  if (!result) throw Error("Calendar could not be initialized.");
  return result;
}
export async function allSlots(): Promise<Slot[]> { return (await calendar()).data.slots; }
export const inventoryStore: InventoryStore = {
  read: async id => { const row = await calendar(); const data = row.data.slots.find(s => s.id === id); return data ? { data, etag: row.etag } : null; },
  write: async (id, data, etag) => {
    const row = await calendar();
    if (row.etag !== etag) throw new ConflictError();
    const at = row.data.slots.findIndex(s => s.id === id);
    if (at < 0) throw Error("Appointment not found.");
    row.data.slots[at] = data;
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
    if (row.data.slots.some(s => s.id !== slot.id && overlaps(s, slot))) throw Error("Appointments must be at least 30 minutes apart.");
    if (existing) Object.assign(existing, slot); else row.data.slots.push(slot);
    row.data.slots.sort((a, b) => a.id.localeCompare(b.id));
    try { await writeJson(CALENDAR_PATH, row.data, { etag: row.etag }); return; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("Calendar changed. Retry adding this appointment.");
}
