"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/portal/auth";
import { writeJson } from "@/lib/portal/store";
import { settings, SETTINGS_PATH, allSlots, addSlot, updateSlot, assignFlexibleReservation } from "@/lib/christmas/store";
import { sendScheduleConfirmation } from "@/lib/christmas/notifications";
import { validSlot, SLOT_PATTERN } from "@/lib/christmas/inventory";
import { paymentReady, reconcileChristmasInvoice } from "@/lib/christmas/payments";
import { ensureBalanceInvoice } from "@/lib/christmas/balance";
import { stripeClient } from "@/lib/portal/stripe";
import { christmasCheckoutCatalog } from "@/lib/christmas/stripe-catalog";
import { calendarAuthorizationUrl, calendarConnectionState, syncChristmasCalendar } from "@/lib/christmas/google-calendar";
import { redirect } from "next/navigation";
export async function connectChristmasGoogleCalendar() {
  await requireAdmin();
  redirect(await calendarAuthorizationUrl());
}
export async function syncChristmasGoogleCalendar() {
  await requireAdmin();
  const state = calendarConnectionState();
  if (!state.activeEnvironment || !state.configured) throw Error("Authorize the website’s Google Calendar connection after launch before syncing bookings.");
  const rows = await allSlots();
  for (const slot of rows.filter(s => s.reservation?.status === "paid" && s.date && s.time)) await Promise.all([syncChristmasCalendar(slot.id), sendScheduleConfirmation(slot.id)]);
  revalidatePath("/admin/christmas");
}
export async function scheduleChristmasReservation(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") || ""), date = String(form.get("date") || ""), time = String(form.get("time") || "");
  if (!SLOT_PATTERN.test(id) || form.get("agreed") !== "on") throw Error("Confirm that this appointment has been agreed with the family.");
  await assignFlexibleReservation(id, date, time);
  const results = await Promise.allSettled([ensureBalanceInvoice(id), syncChristmasCalendar(id), sendScheduleConfirmation(id)]);
  revalidatePath("/admin/christmas");
  const failed = results.find(r => r.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
}
export async function saveChristmasSettings(form: FormData) {
  await requireAdmin();
  const text = (k: string, max = 2000) => String(form.get(k) || "").trim().slice(0, max);
  const current = await settings();
  const cfg = { launchVersion: current.launchVersion, enabled: form.get("enabled") === "on", studioAddress: text("studioAddress", 250), postalCode: text("postalCode", 20),
    arrivalNotes: text("arrivalNotes"), cancellationPolicy: text("cancellationPolicy"), publishableKey: text("publishableKey", 250) };
  if (cfg.enabled && (!cfg.studioAddress || !cfg.postalCode || !cfg.cancellationPolicy || !(await paymentReady())))
    throw Error("Before opening bookings: enter the studio address, postal code and booking policy, and connect live Stripe in payment settings.");
  if (cfg.enabled) await christmasCheckoutCatalog();
  await writeJson(SETTINGS_PATH, cfg);
  revalidatePath("/admin/christmas"); revalidatePath("/christmas");
}
export async function releaseChristmasSlot(form: FormData) {
  await requireAdmin();
  const date = String(form.get("date") || ""), time = String(form.get("time") || "");
  if (!validSlot(date, time)) throw Error("Choose an on-the-hour or half-hour appointment from November 9 through December 20 within the weekday/weekend hours, excluding December 10–12.");
  const rows = await allSlots();
  if (rows.length >= 1000) throw Error("The calendar already contains 1,000 appointments.");
  await addSlot({ id: `${date}_${time.replace(":", "")}`, date, time, santa: true, published: true, manuallyBlocked: false, manuallySoldOut: false });
  revalidatePath("/admin/christmas"); revalidatePath("/christmas");
}
export async function toggleChristmasSlot(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") || "");
  if (!SLOT_PATTERN.test(id)) throw Error("Invalid appointment.");
  await updateSlot(id, s => { if (s.reservation) throw Error("Reserved or purchased appointments cannot be changed here. Contact the family first."); if (!validSlot(s.date, s.time)) throw Error("That date or time is outside the booking schedule."); s.published = !s.published; s.manuallyBlocked = !s.published; if (s.published) delete s.manuallySoldOut; });
  revalidatePath("/admin/christmas"); revalidatePath("/christmas");
}
export async function recordChristmasBalancePayment(form: FormData) {
  await requireAdmin();
  const slotId = String(form.get("id") || "");
  if (!SLOT_PATTERN.test(slotId) || form.get("received") !== "on") throw Error("Confirm that you have actually received the remaining balance before recording payment.");
  const invoice = await ensureBalanceInvoice(slotId);
  if (!invoice) throw Error("This booking has no deposit balance invoice.");
  if (invoice.status !== "paid" && invoice.status !== "open") throw Error("The balance invoice is not ready.");
  const paid = invoice.status === "paid" ? invoice : await stripeClient().invoices.pay(invoice.id, { paid_out_of_band: true }, { idempotencyKey: `christmas-balance-received-${invoice.id}` });
  await reconcileChristmasInvoice(paid);
  revalidatePath("/admin/christmas");
}
