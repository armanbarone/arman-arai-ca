import "server-only";
import { ConflictError, readJson, writeJson } from "@/lib/portal/store";
import { overlaps, type ChristmasSettings, type Slot, type InventoryStore } from "./inventory";
export const SETTINGS_PATH = "christmas/2026/settings.json";
const INVENTORY_PATH = "christmas/2026/inventory.json";
export const slotPath = (id: string) => `christmas/2026/slots/${id}.json`;
const defaults: ChristmasSettings = { enabled: false, studioAddress: "", postalCode: "", arrivalNotes: "", cancellationPolicy: "", publishableKey: "" };
export async function settings() { return (await readJson<ChristmasSettings>(SETTINGS_PATH))?.data ?? defaults; }
export async function allSlots(): Promise<Slot[]> {
  const index = (await readJson<{ ids: string[] }>(INVENTORY_PATH))?.data;
  const rows = await Promise.all((index?.ids ?? []).map(id => readJson<Slot>(slotPath(id))));
  return rows.flatMap(row => row ? [row.data] : []).sort((a, b) => a.id.localeCompare(b.id));
}
export const inventoryStore: InventoryStore = {
  read: id => readJson<Slot>(slotPath(id)),
  write: async (id, data, etag) => { await writeJson(slotPath(id), data, { etag }); },
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
  // Adding the slot first is safe: it is invisible until the index references it.
  try { await writeJson(slotPath(slot.id), slot, { createOnly: true }); }
  catch (e) { if (!(e instanceof ConflictError)) throw e; }
  for (let n = 0; n < 5; n++) {
    const current = await readJson<{ ids: string[] }>(INVENTORY_PATH);
    for (const id of current?.data.ids ?? []) {
      if (id === slot.id) continue;
      const [date, hhmm] = id.split("_");
      if (overlaps(slot, { date, time: hhmm.slice(0, 2) + ":" + hhmm.slice(2) }))
        throw Error("Appointments must be at least 40 minutes apart, including unreleased appointments.");
    }
    const ids = Array.from(new Set([...(current?.data.ids ?? []), slot.id]));
    try { await writeJson(INVENTORY_PATH, { ids }, current ? { etag: current.etag } : { createOnly: true }); return; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("Calendar changed. Retry adding this appointment.");
}
