import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { ConflictError, readJson, writeJson, listJson, remove } from "@/lib/portal/store";
import { allSlots, inventoryStore } from "./store";
import { validSlot, reservationCapacity } from "./inventory";
import { validAlbumCount, dateLabel, timeLabel, RESERVATION_REQUEST, PERSONAL_SCHEDULING } from "./catalog";
import { APP_URL, BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "@/lib/portal/business";
import { esc, sendEmail } from "@/lib/portal/email";
import { stripeClient } from "@/lib/portal/stripe";

import { depositQuote } from "./payment-plan";
import { CART_WINDOW_MS, CART_CONSENT } from "./cart-copy";
import { christmasPaymentMode } from "./environment";
export interface ChristmasCart {
  id: string; slotId: string; albums: number; createdAt: number; expiresAt: number;
  name?: string; email?: string; contactAt?: number; consentAt?: number; consentText?: string;
  unsubscribedAt?: number; checkoutStartedAt?: number; completedAt?: number;
  firstSentAt?: number; secondSentAt?: number;
  sending?: { stage: 1 | 2; until: number; attemptAt: number };
}
const pattern = /^[a-f0-9]{32}$/;
const path = (id: string) => `christmas/2026/carts/${id}.json`;
const suppressionPath = (email: string) => `christmas/2026/cart-suppression/${createHash("sha256").update(email.toLowerCase()).digest("hex")}.json`;
export function cartToken(id: string) {
  const secret = process.env.PORTAL_SECRET;
  if (!secret) throw Error("Cart access is not configured.");
  return createHmac("sha256", secret).update(`christmas-cart-v1:${id}`).digest("hex");
}
export async function getCart(id: string, token: string) {
  if (!pattern.test(id) || !/^[a-f0-9]{64}$/.test(token)) return null;
  if (!timingSafeEqual(Buffer.from(cartToken(id)), Buffer.from(token))) return null;
  return (await readJson<ChristmasCart>(path(id)))?.data ?? null;
}
async function changeCart(id: string, change: (cart: ChristmasCart) => void) {
  for (let n = 0; n < 5; n++) {
    const row = await readJson<ChristmasCart>(path(id));
    if (!row) throw Error("Your checkout window ended. Please choose an appointment again.");
    change(row.data);
    try { await writeJson(path(id), row.data, { etag: row.etag }); return row.data; }
    catch (e) { if (!(e instanceof ConflictError)) throw e; }
  }
  throw Error("Your checkout is updating. Please retry.");
}
export async function createCart(slotId: string, albums: number) {
  if (!christmasPaymentMode()) throw Error("Test pages do not save carts.");
  const flexible = slotId === RESERVATION_REQUEST;
  if (flexible && Date.now() >= new Date("2026-12-14T16:30:00-08:00").getTime()) throw Error("Reservations have closed for this collection.");
  if (flexible && (!validAlbumCount(albums) || !reservationCapacity(await allSlots(), christmasPaymentMode() === "test").checkoutAvailable)) throw Error("All remaining sessions are sold out or currently in checkout.");
  const slot = flexible ? undefined : (await inventoryStore.read(slotId))?.data;
  if (!flexible && (!slot || !validSlot(slot.date, slot.time) || !slot.published || slot.reservation || !validAlbumCount(albums) || new Date(`${slot.date}T${slot.time}:00-08:00`).getTime() <= Date.now())) throw Error("Choose an available appointment.");
  const id = randomBytes(16).toString("hex"), token = cartToken(id), now = Date.now();
  const cart: ChristmasCart = { id, slotId, albums, createdAt: now, expiresAt: now + CART_WINDOW_MS };
  await writeJson(path(id), cart, { createOnly: true });
  return { id, token, expiresAt: cart.expiresAt };
}
export async function saveCartContact(id: string, token: string, name: string, email: string, reminders: boolean) {
  if (christmasPaymentMode() === "test" && email !== BUSINESS.email) throw Error("Local test bookings use the studio email only.");
  const cart = await getCart(id, token);
  if (!cart || cart.expiresAt <= Date.now()) throw Error("Your checkout window ended. Please choose an appointment again.");
  return changeCart(id, c => {
    // Changing the recipient requires a fresh, explicit submission and consent.
    if (c.email && c.email !== email) throw Error("Start a new checkout to change the email address.");
    c.name = name; c.email = email; c.contactAt ??= Date.now();
    c.consentAt = reminders ? Date.now() : undefined; c.consentText = reminders ? CART_CONSENT : undefined;
    c.unsubscribedAt = reminders ? undefined : Date.now();
  });
}
export async function validateCheckoutCart(id: string, token: string, input: { slotId: string; albums: number; email: string; name: string }) {
  const c = await getCart(id, token);
  if (!c || c.expiresAt <= Date.now() || c.checkoutStartedAt || c.slotId !== input.slotId || c.albums !== input.albums || c.email !== input.email || c.name !== input.name) throw Error("Your checkout window ended or changed. Please choose an appointment again.");
  return c;
}
export async function markCartCheckout(id: string) { await changeCart(id, c => { if (c.expiresAt <= Date.now()) throw Error("Your checkout window ended. Please choose an appointment again."); if (c.checkoutStartedAt) throw Error("This checkout has already opened. Please check the payment page before trying again."); c.checkoutStartedAt = Date.now(); }); }
export async function unsubscribeCart(id: string, token: string) {
  const c = await getCart(id, token);
  if (!c?.email) return false;
  // Suppression covers other carts for this email, not just the link clicked.
  await writeJson(suppressionPath(c.email), { at: Date.now() });
  await changeCart(id, cart => { cart.unsubscribedAt = Date.now(); });
  return true;
}
export function cartReminderEmail(c: ChristmasCart, stage: 1 | 2, preview = false) {
  const flexible = c.slotId === RESERVATION_REQUEST;
  const [date, hhmm = ""] = c.slotId.split("_"), time = `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
  const query = preview ? "" : `?id=${c.id}&token=${cartToken(c.id)}`;
  const resume = preview ? "/christmas/preview#booking" : `${APP_URL}/christmas/cart/return${query}`;
  const stop = preview ? "/christmas/cart/unsubscribe" : `${APP_URL}/christmas/cart/unsubscribe${query}`;
  const subject = stage === 1 ? "Still planning your Christmas visit?" : "A final little Christmas reminder";
  const when = flexible ? "a family Christmas session, scheduled personally with Arman" : `${dateLabel(date)} at ${timeLabel(time)} Pacific time`;
  const availabilityText = flexible ? `Your session has not been reserved. There are 50 family sessions in total; check the page for the current remaining count. ${PERSONAL_SCHEDULING}` : "Your appointment has not been booked. The checkout window has ended, so please check the calendar again for current availability. Your original time may have been taken.";
  const quote = depositQuote(c.albums);
  const depositOffer = `Reserve with $50 today, including GST, credited to your $${(quote.total / 100).toFixed(2)} CAD total. The remaining $${(quote.balance / 100).toFixed(2)} is due on arrival before your session starts.`;
  const intro = stage === 1 ? "You started planning a Christmas session with Santa but didn’t finish payment." : "One last note about the Christmas session you started booking. We won’t send any more checkout reminders after this.";
  const footer = `${BUSINESS.legalName}, operating as ${BUSINESS.tradeName}\n${BUSINESS_ADDRESS_ONE_LINE}\n${BUSINESS.phone} · ${BUSINESS.email}`;
  return { subject, html: `<!doctype html><html><body style="background:#f4efe6;margin:0"><div style="max-width:560px;margin:auto;padding:32px 24px;font:16px/1.65 Georgia,serif;color:#263e31"><p style="font:11px Arial;letter-spacing:3px">CHRISTMAS AT ARMAN’S</p><h1 style="font-size:29px;font-weight:normal">${esc(subject)}</h1><p>Hi ${esc(c.name?.split(/\s+/)[0] || "there")},</p><p>${esc(intro)}</p><p>You selected <strong>${esc(when)}</strong>${c.albums ? ` with ${c.albums} printed album${c.albums > 1 ? "s" : ""}` : ""}.</p><p>${esc(depositOffer)}</p><p>${esc(availabilityText)}</p><p style="margin:28px 0"><a href="${esc(resume)}" style="background:#294534;color:white;padding:14px 20px;text-decoration:none;display:inline-block">Check Christmas availability ↗</a></p><p>Need a hand? Reply and I’ll help.<br>Arman</p><hr style="border:0;border-top:1px solid #d5cbb9;margin-top:30px"><p style="font:12px/1.65 Arial;color:#675b4a">${esc(footer).replace(/\n/g, "<br>")}<br>You asked for up to two reminders when you saved your checkout details.<br><a href="${esc(stop)}" style="color:#675b4a">Unsubscribe from checkout reminders</a></p></div></body></html>`, text: `Hi ${c.name?.split(/\s+/)[0] || "there"},\n${intro}\n\nYou selected ${when}. ${depositOffer}\n${availabilityText}\n${resume}\n\nReply if you need a hand.\nArman\n\n${footer}\nYou asked for up to two reminders when saving your checkout details.\nUnsubscribe: ${stop}` };
}
export async function sendCartReminders(now = Date.now()) {
  if (process.env.VERCEL_ENV !== "production" || process.env.CHRISTMAS_CART_REMINDERS_ENABLED !== "true") return { sent: 0, disabled: true };
  const carts = (await listJson<ChristmasCart>("christmas/2026/carts/")).map(r => r.data);
  const slots = await allSlots(); let sent = 0, failed = 0;
  for (const c of carts) {
    if (now - c.createdAt > 30 * 86400_000) { await remove(path(c.id)); continue; }
    if (!c.email || !c.consentAt || !c.contactAt || c.unsubscribedAt || c.completedAt || c.secondSentAt || now < c.expiresAt || now > new Date("2026-12-20T15:00:00-08:00").getTime()) continue;
    // Only the latest cart for an email may send. Never follow up after a paid booking.
    if (carts.some(other => other.email === c.email && other.createdAt > c.createdAt) || slots.some(s => s.reservation?.email.toLowerCase() === c.email && s.reservation?.status === "paid")) continue;
    if (c.slotId === RESERVATION_REQUEST && now >= new Date("2026-12-14T16:30:00-08:00").getTime()) continue;
    const appointment = slots.find(s => s.id === c.slotId);
    if (c.slotId === RESERVATION_REQUEST ? !reservationCapacity(slots).remaining : !appointment || new Date(`${appointment.date}T${appointment.time}:00-08:00`).getTime() <= now) continue;
    const suppression = await readJson<{ at: number }>(suppressionPath(c.email));
    if (suppression && suppression.data.at >= c.consentAt) continue;
    const stage: 1 | 2 = c.firstSentAt ? 2 : 1;
    if (now < c.contactAt + (stage === 1 ? 3600_000 : 86400_000) || (stage === 2 && now < c.firstSentAt! + 20 * 3600_000)) continue;
    try {
      // A missing webhook must not produce a reminder for an already paid/open checkout.
      let paymentActive = false;
      for (const s of slots.filter(s => s.reservation?.email.toLowerCase() === c.email && s.reservation?.status === "pending")) {
        if (!s.reservation?.sessionId) { paymentActive = true; break; }
        const session = await stripeClient().checkout.sessions.retrieve(s.reservation.sessionId);
        if (session.payment_status === "paid" || session.status !== "expired") { paymentActive = true; break; }
      }
      if (paymentActive) continue;
      const locked = await changeCart(c.id, fresh => {
        if (fresh.unsubscribedAt || fresh.completedAt || (stage === 1 ? fresh.firstSentAt : fresh.secondSentAt) || (fresh.sending && fresh.sending.until > now)) throw Error("skip");
        // Do not retry an ambiguous send beyond Resend's idempotency window.
        if (fresh.sending?.stage === stage && now - fresh.sending.attemptAt > 23 * 3600_000) throw Error("skip");
        fresh.sending = { stage, until: now + 120_000, attemptAt: fresh.sending?.stage === stage ? fresh.sending.attemptAt : now };
      });
      const latestSlots = await allSlots(), latestSuppression = await readJson<{ at: number }>(suppressionPath(c.email));
      if (latestSlots.some(s => s.reservation?.email.toLowerCase() === c.email && s.reservation?.status === "paid") || (latestSuppression && latestSuppression.data.at >= locked.consentAt!)) continue;
      const result = await sendEmail({ to: c.email, ...cartReminderEmail(locked, stage), idempotencyKey: `christmas-cart-${c.id}-${stage}` });
      if (!result.id) throw Error("Email not delivered to provider.");
      await changeCart(c.id, fresh => { if (stage === 1) fresh.firstSentAt = now; else fresh.secondSentAt = now; delete fresh.sending; });
      sent++;
    } catch (e) { if (!(e instanceof Error && e.message === "skip")) failed++; }
    if (sent >= 40) break;
  }
  return { sent, failed };
}
