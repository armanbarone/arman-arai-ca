import "server-only";
import { randomBytes, createHash } from "node:crypto";
import type Stripe from "stripe";
import { stripeClient, stripeConfiguration, connectStripe, paymentSetupStatus } from "@/lib/portal/stripe";
import { APP_URL, BUSINESS } from "@/lib/portal/business";
import { readJson, writeJson, ConflictError } from "@/lib/portal/store";
import { PACKAGES, packageById, money, validAlbumCount, gstCents, dateLabel, timeLabel, type Availability, type PackageId } from "./catalog";
import { christmasCheckoutCatalog } from "./stripe-catalog";
import { claimSlot, validSlot, SLOT_PATTERN, publicSlots, recentBookings, type Slot, type Reservation } from "./inventory";
import { allSlots, settings, inventoryStore, updateSlot } from "./store";
import { authorized, bookingLink } from "./access";
import { sendBookingNotifications, sendBalanceReceipt } from "./notifications";
import { ensureBalanceInvoice } from "./balance";
import { DEPOSIT, DEPOSIT_PLAN, depositQuote, balanceDeadline, bookingPaymentSummary } from "./payment-plan";
import { syncChristmasCalendar } from "./google-calendar";
import { christmasPaymentMode } from "./environment";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
let webhookReady = false;
export async function paymentReady() {
  const mode = christmasPaymentMode();
  if (!mode) return false;
  if (mode === "test") return (await stripeConfiguration())?.mode === "test";
  if (!(await stripeConfiguration())) await connectStripe("Christmas launch authorized by owner");
  const ready = (await paymentSetupStatus()).connected;
  if (ready && !webhookReady) {
    const cfg = await stripeConfiguration();
    if (!cfg?.webhookId) return false;
    const hook = await stripeClient().webhookEndpoints.retrieve(cfg.webhookId);
    if (!hook.enabled_events.includes("*") && !hook.enabled_events.includes("invoice.paid")) await stripeClient().webhookEndpoints.update(hook.id, { enabled_events: [...hook.enabled_events, "invoice.paid"] as Stripe.WebhookEndpointUpdateParams.EnabledEvent[] });
    webhookReady = true;
  }
  return ready;
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
    const mode = christmasPaymentMode();
    const expectedSubtotal = r.paymentPlan ? r.paymentPlan.depositSubtotalCents : r.subtotalCents;
    const expectedTotal = r.paymentPlan ? r.paymentPlan.depositCents : r.totalCents ?? r.subtotalCents + gstCents(r.subtotalCents);
    if (!mode || s.livemode !== (mode === "live") || s.currency !== "cad" || s.amount_subtotal !== expectedSubtotal || (r.paymentPlan && s.metadata?.payment_kind !== "deposit") || (s.payment_status === "paid" && s.amount_total !== expectedTotal)) throw Error("Christmas payment amount or mode mismatch.");
    if (s.payment_status === "paid") {
      r.sessionId = s.id; r.status = "paid"; r.paidCents = s.amount_total ?? r.subtotalCents; r.paidAt ??= Date.now();
      if (r.paymentPlan) {
        r.paymentPlan.depositPaidCents = s.amount_total!;
        r.paymentPlan.customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
        r.paidCents = r.paymentPlan.depositPaidCents + (r.paymentPlan.balancePaidCents ?? 0);
      }
      r.invoiceId = (typeof s.invoice === "string" ? s.invoice : s.invoice?.id) ?? r.invoiceId;
      r.paymentIntent = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
    } else if (s.status === "expired" && r.status !== "paid") delete slot.reservation;
  });
  const current = await inventoryStore.read(slotId), r = current?.data.reservation;
  if (r?.id !== bookingId || r.status !== "paid") return;
  // Independent effects: a client-email failure must not suppress the studio
  // alert or calendar event. Stripe retries any failed effect with stable keys.
  const invoiceEffects = await Promise.allSettled([ensureBalanceInvoice(slotId), (async () => { if (r.invoiceId && !r.invoiceUrl) {
    const invoice = await stripeClient().invoices.retrieve(r.invoiceId);
    if (invoice.hosted_invoice_url) {
      r.invoiceUrl = invoice.hosted_invoice_url;
      await updateSlot(slotId, s => { if (s.reservation?.id === r.id) s.reservation.invoiceUrl = r.invoiceUrl; });
    }
  } })()]);
  const effects = [...invoiceEffects, ...await Promise.allSettled([sendBookingNotifications(slotId), syncChristmasCalendar(slotId)])];
  const failed = effects.find(result => result.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
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
  const publishableKey = "";
  if (!cfg.enabled || !cfg.studioAddress || !cfg.postalCode || !cfg.cancellationPolicy || !(await paymentReady()))
    return { mode: "closed", slots: [], location: "North Vancouver, BC", cancellationPolicy: cfg.cancellationPolicy, publishableKey: "", message: "Christmas bookings are not open yet. Email Arman for the release date." };
  await christmasCheckoutCatalog();
  let rows = await allSlots();
  await Promise.all(rows.filter(s => s.reservation?.status === "pending" && s.reservation.expiresAt + 120000 < Date.now()).map(reconcileStale));
  rows = await allSlots();
  return {
    mode: christmasPaymentMode() === "test" ? "test" : "live", location: `${cfg.studioAddress}, ${cfg.postalCode}`, cancellationPolicy: cfg.cancellationPolicy, publishableKey,
    slots: publicSlots(rows), recentBookings: recentBookings(rows),
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
type CheckoutInput = { slotId: string; packageId: PackageId; name: string; email: string; phone: string; acceptedPolicy: string; expectedSubtotal: number; expectedTotal: number; paymentPlan: typeof DEPOSIT_PLAN; expectedDueNow: number; albums: number; shareActivity: boolean; delivery: NonNullable<Reservation["delivery"]> };
export async function startCheckout(input: CheckoutInput) {
  const cfg = await settings(), pkg = packageById(input.packageId);
  if (!cfg.enabled || !cfg.studioAddress || !cfg.postalCode || !cfg.cancellationPolicy || !(await paymentReady())) throw Error("Bookings are not open yet.");
  if (christmasPaymentMode() === "test" && input.email !== BUSINESS.email) throw Error("Local test bookings use the studio email only.");
  if (!pkg) throw Error("Choose a valid package.");
  if (!validAlbumCount(input.albums)) throw Error("Choose a valid album quantity.");
  const quote = depositQuote(input.albums), subtotal = quote.subtotal, expectedTotal = quote.total;
  if (input.paymentPlan !== DEPOSIT_PLAN || input.expectedDueNow !== DEPOSIT.total || input.acceptedPolicy !== cfg.cancellationPolicy || input.expectedSubtotal !== subtotal || input.expectedTotal !== expectedTotal) throw Error("Booking details changed. Refresh the page and review the price and policy before paying.");
  const catalog = await christmasCheckoutCatalog();
  const current = await inventoryStore.read(input.slotId);
  if (!current || !validSlot(current.data.date, current.data.time)) throw Error("Choose a valid appointment.");
  if (current) await reconcileStale(current.data);
  const token = randomBytes(32).toString("hex"), id = `XMAS-${randomBytes(10).toString("hex")}`;
  const expiresAt = Math.floor(Date.now() / 1000) * 1000 + 35 * 60000;
  const slot = await claimSlot(inventoryStore, input.slotId, {
    id, tokenHash: hash(token), packageId: pkg.id, name: input.name, email: input.email, phone: input.phone,
    albums: input.albums, shareActivity: input.shareActivity, testMode: christmasPaymentMode() === "test", gstCents: quote.gst, pstCents: quote.pst, delivery: input.delivery, totalCents: expectedTotal, packageSnapshot: { name: pkg.name, minutes: pkg.minutes, images: input.albums ? 20 : pkg.images, sets: pkg.sets, santa: pkg.santa },
    subtotalCents: subtotal, status: "pending", createdAt: Date.now(), expiresAt,
    paymentPlan: { kind: DEPOSIT_PLAN, depositSubtotalCents: DEPOSIT.subtotal, depositGstCents: DEPOSIT.gst, depositCents: DEPOSIT.total, balanceDueAt: new Date(`${current.data.date}T${current.data.time}:00-08:00`).getTime() },
    bookingDetails: { studioAddress: cfg.studioAddress, postalCode: cfg.postalCode, arrivalNotes: cfg.arrivalNotes, cancellationPolicy: cfg.cancellationPolicy },
  }, pkg.santa);
  const returnUrl = `${APP_URL}/christmas/confirmation?slot=${encodeURIComponent(slot.id)}&token=${token}`;
  // Never free a hold on an ambiguous network error. Its fixed expiry protects
  // against a late but still payable Checkout Session and double bookings.
  const session = await stripeClient().checkout.sessions.create({
    mode: "payment", success_url: returnUrl, cancel_url: `${APP_URL}/christmas?cancelled=1&slot=${encodeURIComponent(slot.id)}&token=${token}#booking`,
    integration_identifier: "christmas-northvan-rqvkmsaz", customer_email: input.email,
    client_reference_id: id, metadata: { service: "christmas-2026", slotId: slot.id, bookingId: id, albums: String(input.albums), payment_kind: "deposit", order_total: String(quote.total), balance_due: String(quote.balance) },
    billing_address_collection: "required", customer_creation: "always", expires_at: Math.floor(expiresAt / 1000),
    custom_text: { submit: { message: `$50 CAD deposit today, including GST, credited to your ${money(quote.total)} CAD order. Remaining ${money(quote.balance)} CAD due ${balanceDeadline(slot.date, slot.time)}. Your appointment is confirmed after the deposit is paid.` } },
    payment_intent_data: { receipt_email: input.email, shipping: { name: input.name, address: { line1: input.delivery.line1, line2: input.delivery.line2 || undefined, city: input.delivery.city, state: "BC", postal_code: input.delivery.postalCode, country: "CA" } } },
    invoice_creation: { enabled: true, invoice_data: {
      description: `$50 reservation deposit credited toward ${pkg.name} · ${dateLabel(slot.date)} at ${timeLabel(slot.time)} Pacific · ${pkg.minutes} minutes · ${input.albums ? 20 : pkg.images} digital photographs · ${pkg.sets} sets${input.albums ? ` · ${input.albums} album(s)` : ""}. Order total ${money(quote.total)} CAD including tax. Remaining ${money(quote.balance)} CAD due ${balanceDeadline(slot.date, slot.time)}.`,
      custom_fields: [{ name: "GST/HST registration", value: BUSINESS.gstHstNumber }],
      footer: "Arasaka Inc., operating as Arman Arai. Digital gallery, mailed Santa letter and complimentary keepsake. Base: GST 5%. Optional printed albums: GST 5% and BC PST 7%. Hand delivery across Greater Vancouver through Surrey.",
      metadata: { service: "christmas-2026", bookingId: id, slotId: slot.id, payment_kind: "deposit" },
    } },
    line_items: [{ quantity: 1, price: catalog.depositPrice, tax_rates: catalog.taxRates }],
  }, { idempotencyKey: `christmas-${id}` });
  if (!session.url) throw Error("Stripe could not open the payment form. Please contact Arman.");
  await updateSlot(slot.id, s => { if (s.reservation?.id !== id) throw Error("Your appointment changed. Please contact Arman before paying."); s.reservation.sessionId = session.id; });
  return { checkoutUrl: session.url, returnUrl, expiresAt };
}
export async function bookingStatus(slotId: string, token: string) {
  if (!SLOT_PATTERN.test(slotId) || !/^[a-f0-9]{64}$/.test(token)) return null;
  let row = await inventoryStore.read(slotId), r = row?.data.reservation;
  if (!r || !authorized(r, "confirmation", token)) return null;
  if (r.sessionId && (r.status !== "paid" || !r.emailsSent || (r.paymentPlan && !r.paymentPlan.balanceInvoiceUrl))) {
    try { await reconcileChristmasSession(await stripeClient().checkout.sessions.retrieve(r.sessionId)); }
    catch (error) {
      // An email failure must not hide a payment already verified and recorded.
      // Stripe retries the webhook, with idempotent email keys.
      const saved = await inventoryStore.read(slotId);
      if (saved?.data.reservation?.id !== r.id || saved.data.reservation.status !== "paid") throw error;
    }
    row = await inventoryStore.read(slotId); r = row?.data.reservation;
  }
  if (r?.paymentPlan?.balanceInvoiceId && !r.paymentPlan.balancePaidCents) {
    try { const invoice = await stripeClient().invoices.retrieve(r.paymentPlan.balanceInvoiceId); if (invoice.status === "paid") await reconcileChristmasInvoice(invoice); }
    catch { /* The booking remains confirmed if the balance service is retrying. */ }
    row = await inventoryStore.read(slotId); r = row?.data.reservation;
  }
  if (!r) return { status: "expired" };
  const cfg = r.bookingDetails, pkg = r.packageSnapshot ?? PACKAGES.find(p => p.id === r!.packageId)!;
  return { status: r.status, testMode: r.testMode, reference: r.id, date: row!.data.date, time: row!.data.time, package: pkg.name, minutes: pkg.minutes, images: pkg.images, sets: pkg.sets, santa: pkg.santa, albums: r.albums, grinch: r.grinch, delivery: r.delivery,
    purchaseTracking: r.status === "paid" && r.paidCents && !r.testMode && christmasPaymentMode() === "live" ? { eventId: hash(`christmas-2026:meta:${r.id}`), paidCents: r.paymentPlan?.depositPaidCents ?? r.paidCents, albums: r.albums ?? 0 } : undefined,
    totalCents: bookingPaymentSummary(r).total, balanceCents: bookingPaymentSummary(r).balance, depositCents: r.paymentPlan?.depositPaidCents, balanceDueAt: r.paymentPlan?.balanceDueAt, balanceInvoiceUrl: r.paymentPlan?.balanceInvoiceUrl,
    questionnaireUrl: r.status === "paid" ? bookingLink(slotId, r, "questionnaire") : undefined, questionnaireComplete: !!r.questionnaire, welcomeSent: !!r.welcomeSentAt || !!r.emailsSent, questionnaireSent: !!r.questionnaireSentAt, paidCents: r.paidCents, invoiceUrl: r.invoiceUrl, address: cfg.studioAddress, postalCode: cfg.postalCode, arrivalNotes: cfg.arrivalNotes, email: r.email, cancellationPolicy: cfg.cancellationPolicy };
}

export async function cancelCheckout(slotId: string, token: string) {
  if (!SLOT_PATTERN.test(slotId)) return null;
  const row = await inventoryStore.read(slotId), r = row?.data.reservation;
  if (!r || !authorized(r, "confirmation", token)) return null;
  if (r.status === "paid") return { paid: true, confirmationUrl: bookingLink(slotId, r, "confirmation") };
  if (!r.sessionId) throw Error("Checkout is still opening. Please retry shortly.");
  let session: Stripe.Checkout.Session;
  try { session = await stripeClient().checkout.sessions.expire(r.sessionId); }
  catch { session = await stripeClient().checkout.sessions.retrieve(r.sessionId); }
  await reconcileChristmasSession(session);
  if (session.payment_status === "paid") return { paid: true, confirmationUrl: bookingLink(slotId, r, "confirmation") };
  if (session.status !== "expired") throw Error("The payment hold has not expired yet.");
  return { cancelled: true };
}
export async function reconcileChristmasInvoice(invoice: Stripe.Invoice) {
  if (invoice.metadata?.service !== "christmas-2026") return;
  const slotId = invoice.metadata.slotId, bookingId = invoice.metadata.bookingId;
  const mode = christmasPaymentMode();
  if (!slotId || !SLOT_PATTERN.test(slotId) || !bookingId || !mode || invoice.livemode !== (mode === "live") || invoice.currency !== "cad" || invoice.status !== "paid") throw Error("Invalid Christmas invoice.");
  await updateSlot(slotId, slot => {
    const r = slot.reservation;
    if (!r || r.id !== bookingId || r.status !== "paid") throw Error("Christmas invoice does not match its payment.");
    if (invoice.metadata?.payment_kind === "balance") {
      if (!r.paymentPlan || r.paymentPlan.balanceInvoiceId !== invoice.id || invoice.amount_paid !== bookingPaymentSummary(r).total - r.paymentPlan.depositCents || invoice.total !== invoice.amount_paid) throw Error("Christmas balance invoice does not match its payment.");
      r.paymentPlan.balancePaidCents = invoice.amount_paid;
      r.paidCents = (r.paymentPlan.depositPaidCents ?? 0) + invoice.amount_paid;
      r.paymentPlan.balanceInvoiceUrl = invoice.hosted_invoice_url ?? undefined;
    } else {
      if ((r.invoiceId && r.invoiceId !== invoice.id) || invoice.amount_paid !== (r.paymentPlan?.depositPaidCents ?? r.paidCents)) throw Error("Christmas invoice does not match its payment.");
      r.invoiceId = invoice.id; r.invoiceUrl = invoice.hosted_invoice_url || undefined;
    }
  });
  if (invoice.metadata?.payment_kind === "balance") {
    const effects = await Promise.allSettled([sendBalanceReceipt(slotId), syncChristmasCalendar(slotId)]);
    const failed = effects.find(result => result.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
  }
}
