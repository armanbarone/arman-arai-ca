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
const slot = { id: "2026-12-05_1100", date: "2026-12-05", time: "11:00", santa: true, published: true };
const reservation = id => ({ id, tokenHash: "a".repeat(64), packageId: "santa", name: "Test family", email: "test@example.com", phone: "6045550100", createdAt: Date.now(), expiresAt: Date.now()+2100000, subtotalCents: 30000, status: "pending", bookingDetails: { studioAddress: "Test studio", postalCode: "V6G 1A1", arrivalNotes: "", cancellationPolicy: "Test policy" } });
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
test("unreleased and paid appointments cannot be reserved", async () => {
  for (const data of [{ ...slot, published: false }, { ...slot, reservation: { ...reservation("existing"), status: "paid" } }])
    await assert.rejects(claimSlot(memoryStore(data), slot.id, reservation("new"), true), /no longer available/);
});
test("an expired local deadline alone cannot make a possibly payable Stripe session available", async () => {
  const store = memoryStore({ ...slot, reservation: { ...reservation("existing"), expiresAt: 1 } });
  await assert.rejects(claimSlot(store, slot.id, reservation("new"), true), /no longer available/);
});
test("30-minute allocations reject overlaps and invalid seasonal dates", () => {
  assert.equal(overlaps(slot, { ...slot, time: "11:29" }), true);
  assert.equal(overlaps(slot, { ...slot, time: "11:30" }), false);
  assert.equal(overlaps(slot, { ...slot, date: "2026-12-06" }), false);
  assert.equal(validSlot("2026-11-31", "11:00"), false);
  assert.equal(validSlot("2026-12-24", "11:00"), false);
  assert.equal(validSlot("2026-12-05", "11:00"), true);
});

import { PACKAGES, money, gstCents, totalCents, seasonalSlots } from "../lib/christmas/catalog.ts";
test("one $300 Santa package; cents format correctly, including $15 GST", () => {
  assert.equal(PACKAGES.length, 1); assert.equal(PACKAGES[0].id, "santa");
  assert.equal(PACKAGES[0].santa, true); assert.equal(PACKAGES[0].price, 30000);
  assert.equal(money(30000), "$300"); assert.equal(money(1500), "$15"); assert.equal(money(31500), "$315");
  assert.equal(gstCents(30000),1500); assert.equal(totalCents(30000),31500);
});
test("daily 11am–8pm calendar covers all 27 days and ends at 7:30pm", () => {
  const slots = seasonalSlots(), dates = [...new Set(slots.map(s=>s.date))];
  assert.equal(slots.length,486); assert.equal(dates.length,27);
  assert.equal(dates[0],"2026-11-27"); assert.equal(dates.at(-1),"2026-12-23");
  assert.equal(new Set(slots.map(s=>s.id)).size,486);
  for(const date of dates) {
    const day=slots.filter(s=>s.date===date); assert.equal(day.length,18);
    assert.equal(day[0].time,"11:00"); assert.equal(day.at(-1).time,"19:30");
    assert.ok(day.every(s=>s.santa && s.available && validSlot(s.date,s.time)));
  }
  for(const time of ["10:30","20:00","19:45","11:15"]) assert.equal(validSlot("2026-12-05",time),false);
});
