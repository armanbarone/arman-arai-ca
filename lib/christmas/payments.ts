import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import type Stripe from "stripe";
import { stripeClient, stripeConfiguration } from "@/lib/portal/stripe";
import { APP_URL, BUSINESS } from "@/lib/portal/business";
import { sendEmail, layout, esc } from "@/lib/portal/email";
import { readJson, writeJson, ConflictError } from "@/lib/portal/store";
import { PACKAGES, packageById, money, dateLabel, timeLabel, type Availability, type PackageId } from "./catalog";
import { claimSlot, SLOT_PATTERN, type Slot } from "./inventory";
import { allSlots, settings, inventoryStore, updateSlot } from "./store";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export async function paymentReady() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  const config = await stripeConfiguration();
  return process.env.VERCEL_ENV === "production" && /^(sk|rk)_live_/.test(key) && config?.mode === "live";
}
export async function reconcileChristmasSession(s: Stripe.Checkout.Session) {
  if (s.metadata?.service !== "christmas-2026") return;
  const slotId = s.metadata.slotId, bookingId = s.metadata.bookingId;
  if (!slotId || !SLOT_PATTERN.test(slotId) || !bookingId) throw Error("Invalid Christmas payment metadata.");
  await updateSlot(slotId, slot => {
    const r = slot.reservation;
    if (!r || r.id !== bookingId) {
      // Old expired-session retries must never free somebody else's reservation.
      if (s.status === "expired") return;
      throw Error("Christmas payment has no matching reservation.");
    }
    if (r.sessionId && r.sessionId !== s.id) throw Error("Checkout session mismatch.");
    if (!s.livemode || s.currency !== "cad" || s.amount_subtotal !== r.subtotalCents) throw Error("Christmas payment amount or mode mismatch.");
    if (s.payment_status === "paid") {
      r.sessionId = s.id; r.status = "paid"; r.paidCents = s.amount_total ?? r.subtotalCents;
      r.paymentIntent = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
    } else if (s.status === "expired" && r.status !== "paid") delete slot.reservation;
  });
  const current = await inventoryStore.read(slotId), r = current?.data.reservation;
  if (r?.id !== bookingId || r.status !== "paid" || r.emailsSent) return;
  const cfg = r.bookingDetails, pkg = packageById(r.packageId)!;
  const when = `${dateLabel(current!.data.date)} at ${timeLabel(current!.data.time)} (Vancouver time)`;
  const subject = `Your Christmas session is booked · ${when}`;
  const body = `<p>Hi ${esc(r.name)},</p><p>Your <strong>${esc(pkg.name)}</strong> session is confirmed for <strong>${esc(when)}</strong>.</p><p>${esc(cfg.studioAddress)}<br>${esc(cfg.postalCode)}</p><p>${esc(cfg.arrivalNotes)}</p><p>${pkg.minutes} minutes · ${pkg.images} edited images${pkg.santa ? " · Santa included" : " · Family portraits, without Santa"}.</p><p>Paid: ${money(r.paidCents ?? r.subtotalCents)} CAD. Reference: ${esc(r.id)}.</p><p>Gallery delivery: within 5 days, or within 48 hours for sessions from December 18 onward. For photographs before Christmas, book by December 21.</p><p>${esc(cfg.cancellationPolicy)}</p>`;
  await sendEmail({ to: r.email, subject, html: layout({ heading: "A little Christmas, booked.", bodyHtml: body }), text: `${subject}\n${pkg.name}\n${cfg.studioAddress}, ${cfg.postalCode}\n${cfg.arrivalNotes}\nPaid ${money(r.paidCents ?? r.subtotalCents)} CAD\n${cfg.cancellationPolicy}`, idempotencyKey: `christmas-customer-${r.id}` });
  await sendEmail({ to: BUSINESS.email, subject: `Christmas booking · ${when} · ${r.name}`, html: layout({ heading: "A Christmas session was purchased", bodyHtml: `<p>${esc(r.name)} · ${esc(r.email)} · ${esc(r.phone)}</p>${body}` }), text: `${r.name}, ${r.email}, ${r.phone}\n${when}\n${pkg.name}\nReference ${r.id}`, idempotencyKey: `christmas-studio-${r.id}` });
  await updateSlot(slotId, slot => { if (slot.reservation?.id === r.id) slot.reservation.emailsSent = true; });
}
async function reconcileStale(slot: Slot) {
  const r = slot.reservation;
  if (!r || r.status === "paid" || Date.now() < r.expiresAt + 120000) return;
  if (r.sessionId) {
    await reconcileChristmasSession(await stripeClient().checkout.sessions.retrieve(r.sessionId));
  } else {
    // Stripe's fixed expires_at is already in the past. An uncertain creation
    // cannot leave a still-payable session behind when this hold is released.
    await updateSlot(slot.id, s => { if (s.reservation?.id === r.id && s.reservation.status === "pending") delete s.reservation; });
  }
}
export async function availability(): Promise<Availability> {
  const cfg = await settings();
  const publishableKey = cfg.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  if (!cfg.enabled || !cfg.studioAddress || !cfg.postalCode || !cfg.cancellationPolicy || !publishableKey.startsWith("pk_live_") || !(await paymentReady()))
    return { mode: "closed", slots: [], location: "Vancouver, BC", cancellationPolicy: cfg.cancellationPolicy, publishableKey: "", message: "Christmas bookings are not open yet. Email Arman for the release date." };
  let rows = await allSlots();
  await Promise.all(rows.filter(s => s.reservation?.status === "pending" && s.reservation.expiresAt + 120000 < Date.now()).map(reconcileStale));
  rows = await allSlots();
  return {
    mode: "live", location: `${cfg.studioAddress}, ${cfg.postalCode}`, cancellationPolicy: cfg.cancellationPolicy, publishableKey,
    slots: rows.filter(s => s.published && new Date(`${s.date}T${s.time}:00-08:00`).getTime() > Date.now()).map(({ id, date, time, santa, reservation }) => ({ id, date, time, santa, available: !reservation })),
  };
}
export async function checkoutRateLimit(ip: string) {
  const key = `christmas/2026/rate/${hash(ip).slice(0, 32)}-${Math.floor(Date.now() / 900000)}.json`;
  const current = await readJson<{ count: number }>(key);
  const count = (current?.data.count ?? 0) + 1;
  if (count > 8) throw Error("Too many checkout attempts. Please try again in 15 minutes.");
  try { await writeJson(key, { count }, current ? { etag: current.etag } : { createOnly: true }); }
  catch (e) { if (e instanceof ConflictError) throw Error("Please try checkout again in a moment."); throw e; }
}
export async function startCheckout(input: { slotId: string; packageId: PackageId; name: string; email: string; phone: string; acceptedPolicy: string; expectedSubtotal: number }) {
  const cfg = await settings(), pkg = packageById(input.packageId);
  const publicKey = cfg.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  if (!cfg.enabled || !cfg.studioAddress || !cfg.postalCode || !cfg.cancellationPolicy || !publicKey.startsWith("pk_live_") || !(await paymentReady())) throw Error("Bookings are not open yet.");
  if (!pkg) throw Error("Choose a valid package.");
  if (input.acceptedPolicy !== cfg.cancellationPolicy || input.expectedSubtotal !== pkg.price) throw Error("Booking details changed. Refresh the page and review the price and policy before paying.");
  const current = await inventoryStore.read(input.slotId);
  if (current) await reconcileStale(current.data);
  const token = randomBytes(32).toString("hex"), id = `XMAS-${randomBytes(10).toString("hex")}`;
  const expiresAt = Math.floor(Date.now() / 1000) * 1000 + 35 * 60000;
  const slot = await claimSlot(inventoryStore, input.slotId, {
    id, tokenHash: hash(token), packageId: pkg.id, name: input.name, email: input.email, phone: input.phone,
    subtotalCents: pkg.price, status: "pending", createdAt: Date.now(), expiresAt,
    bookingDetails: { studioAddress: cfg.studioAddress, postalCode: cfg.postalCode, arrivalNotes: cfg.arrivalNotes, cancellationPolicy: cfg.cancellationPolicy },
  }, pkg.santa);
  const returnUrl = `${APP_URL}/christmas/confirmation?slot=${encodeURIComponent(slot.id)}&token=${token}`;
  // Never free a hold on an ambiguous network error. Its fixed expiry protects
  // against a late but still payable Checkout Session and double bookings.
  const session = await stripeClient().checkout.sessions.create({
    mode: "payment", ui_mode: "embedded_page", redirect_on_completion: "if_required", return_url: returnUrl,
    allowed_payment_method_types: ["card"], customer_email: input.email,
    client_reference_id: id, metadata: { service: "christmas-2026", slotId: slot.id, bookingId: id },
    automatic_tax: { enabled: true }, billing_address_collection: "required", expires_at: Math.floor(expiresAt / 1000),
    line_items: [{ quantity: 1, price_data: { currency: "cad", unit_amount: pkg.price, tax_behavior: "exclusive", product_data: {
      name: pkg.name, description: `${dateLabel(slot.date)} at ${timeLabel(slot.time)} · ${pkg.minutes} minutes · ${pkg.images} edited images${pkg.santa ? " · Santa included" : " · No Santa"}`,
    } } }],
  }, { idempotencyKey: `christmas-${id}` });
  if (!session.client_secret) throw Error("Stripe could not open the payment form. Please contact Arman.");
  await updateSlot(slot.id, s => { if (s.reservation?.id !== id) throw Error("Your appointment changed. Please contact Arman before paying."); s.reservation.sessionId = session.id; });
  return { clientSecret: session.client_secret, publishableKey: publicKey, returnUrl, expiresAt };
}
export async function bookingStatus(slotId: string, token: string) {
  if (!SLOT_PATTERN.test(slotId) || !/^[a-f0-9]{64}$/.test(token)) return null;
  let row = await inventoryStore.read(slotId), r = row?.data.reservation;
  if (!r || !timingSafeEqual(Buffer.from(r.tokenHash, "hex"), Buffer.from(hash(token), "hex"))) return null;
  if (r.sessionId && (r.status !== "paid" || !r.emailsSent)) {
    try { await reconcileChristmasSession(await stripeClient().checkout.sessions.retrieve(r.sessionId)); }
    catch (error) {
      // An email failure must not hide a payment already verified and recorded.
      // Stripe retries the webhook, with idempotent email keys.
      const saved = await inventoryStore.read(slotId);
      if (saved?.data.reservation?.id !== r.id || saved.data.reservation.status !== "paid") throw error;
    }
    row = await inventoryStore.read(slotId); r = row?.data.reservation;
  }
  if (!r) return { status: "expired" };
  const cfg = r.bookingDetails, pkg = PACKAGES.find(p => p.id === r!.packageId)!;
  return { status: r.status, reference: r.id, date: row!.data.date, time: row!.data.time, package: pkg.name, minutes: pkg.minutes, images: pkg.images, santa: pkg.santa,
    paidCents: r.paidCents, address: cfg.studioAddress, postalCode: cfg.postalCode, arrivalNotes: cfg.arrivalNotes, email: r.email, cancellationPolicy: cfg.cancellationPolicy };
}
