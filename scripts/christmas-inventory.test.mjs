import { test } from "node:test";
import assert from "node:assert/strict";
import { claimSlot, overlaps, validSlot } from "../lib/christmas/inventory.ts";
const clone = o => structuredClone(o);
class Conflict extends Error {}
function memoryStore(slot) {
  let data = clone(slot), version = 0;
  return {
    async read() { return { data: clone(data), etag: String(version) }; },
    async write(_id, next, etag) { await Promise.resolve(); if (etag !== String(version)) throw new Conflict(); data = clone(next); version++; },
    conflict: e => e instanceof Conflict,
    value: () => clone(data),
  };
}
const slot = { id: "2026-12-05_1000", date: "2026-12-05", time: "10:00", santa: true, published: true };
const reservation = id => ({ id, tokenHash: "a".repeat(64), packageId: "santa", name: "Test family", email: "test@example.com", phone: "6045550100", createdAt: Date.now(), expiresAt: Date.now()+2100000, subtotalCents: 34900, status: "pending", bookingDetails: { studioAddress: "Test studio", postalCode: "V6G 1A1", arrivalNotes: "", cancellationPolicy: "Test policy" } });
test("simultaneous attempts allocate exactly one family to an appointment", async () => {
  const store = memoryStore(slot);
  const result = await Promise.allSettled(Array.from({ length: 20 }, (_, i) => claimSlot(store, slot.id, reservation(String(i)), true)));
  assert.equal(result.filter(x => x.status === "fulfilled").length, 1);
  assert.equal(result.filter(x => x.status === "rejected").length, 19);
  assert.ok(store.value().reservation);
});
test("Santa package cannot purchase a family-only appointment", async () => {
  const store = memoryStore({ ...slot, santa: false });
  await assert.rejects(claimSlot(store, slot.id, reservation("a"), true), /Santa is not available/);
  assert.equal(store.value().reservation, undefined);
});
test("family package can purchase a family-only appointment", async () => {
  const store = memoryStore({ ...slot, santa: false });
  await claimSlot(store, slot.id, { ...reservation("a"), packageId: "family", subtotalCents: 24900 }, false);
  assert.equal(store.value().reservation.packageId, "family");
});
test("unreleased and paid appointments cannot be reserved", async () => {
  for (const data of [{ ...slot, published: false }, { ...slot, reservation: { ...reservation("existing"), status: "paid" } }])
    await assert.rejects(claimSlot(memoryStore(data), slot.id, reservation("new"), true), /no longer available/);
});
test("an expired local deadline alone cannot make a possibly payable Stripe session available", async () => {
  const store = memoryStore({ ...slot, reservation: { ...reservation("existing"), expiresAt: 1 } });
  await assert.rejects(claimSlot(store, slot.id, reservation("new"), true), /no longer available/);
});
test("40-minute allocations reject overlaps and invalid seasonal dates", () => {
  assert.equal(overlaps(slot, { ...slot, time: "10:39" }), true);
  assert.equal(overlaps(slot, { ...slot, time: "10:40" }), false);
  assert.equal(overlaps(slot, { ...slot, date: "2026-12-06" }), false);
  assert.equal(validSlot("2026-11-31", "10:00"), false);
  assert.equal(validSlot("2026-12-24", "10:00"), false);
  assert.equal(validSlot("2026-12-05", "10:00"), true);
});
