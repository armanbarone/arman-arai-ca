"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/portal/auth";
import { writeJson } from "@/lib/portal/store";
import { settings, SETTINGS_PATH, allSlots, addSlot, updateSlot } from "@/lib/christmas/store";
import { validSlot, SLOT_PATTERN } from "@/lib/christmas/inventory";
import { paymentReady } from "@/lib/christmas/payments";
import { christmasCheckoutCatalog } from "@/lib/christmas/stripe-catalog";
export async function saveChristmasSettings(form: FormData) {
  await requireAdmin();
  const text = (k: string, max = 2000) => String(form.get(k) || "").trim().slice(0, max);
  const cfg = { enabled: form.get("enabled") === "on", studioAddress: text("studioAddress", 250), postalCode: text("postalCode", 20),
    arrivalNotes: text("arrivalNotes"), cancellationPolicy: text("cancellationPolicy"), publishableKey: text("publishableKey", 250), pstNumber: text("pstNumber", 40) };
  if (cfg.enabled && (!cfg.studioAddress || !cfg.postalCode || !cfg.pstNumber || !cfg.cancellationPolicy || !cfg.publishableKey.startsWith("pk_live_") || !(await paymentReady())))
    throw Error("Before opening bookings: enter the studio address, postal code, BC PST registration, booking policy and live Stripe publishable key, and connect live Stripe in payment settings.");
  if (cfg.enabled) await christmasCheckoutCatalog();
  await writeJson(SETTINGS_PATH, cfg);
  revalidatePath("/admin/christmas"); revalidatePath("/christmas");
}
export async function releaseChristmasSlot(form: FormData) {
  await requireAdmin();
  const date = String(form.get("date") || ""), time = String(form.get("time") || "");
  if (!validSlot(date, time)) throw Error("Choose November 1 through December 20, 2026, and a start time from 11:00 to 19:30, on the hour or half-hour.");
  const rows = await allSlots();
  if (rows.length >= 1000) throw Error("The calendar already contains 1,000 appointments.");
  await addSlot({ id: `${date}_${time.replace(":", "")}`, date, time, santa: true, published: true });
  revalidatePath("/admin/christmas"); revalidatePath("/christmas");
}
export async function toggleChristmasSlot(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") || "");
  if (!SLOT_PATTERN.test(id)) throw Error("Invalid appointment.");
  await updateSlot(id, s => { if (s.reservation) throw Error("Reserved or purchased appointments cannot be changed here. Contact the family first."); s.published = !s.published; });
  revalidatePath("/admin/christmas"); revalidatePath("/christmas");
}
