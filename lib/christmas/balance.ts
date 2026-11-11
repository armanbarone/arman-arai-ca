import "server-only";
import type Stripe from "stripe";
import { stripeClient } from "@/lib/portal/stripe";
import { BUSINESS } from "@/lib/portal/business";
import { inventoryStore, updateSlot } from "./store";
import { christmasCheckoutCatalog } from "./stripe-catalog";
import { balanceDeadline, bookingPaymentSummary, DEPOSIT } from "./payment-plan";
import { money } from "./catalog";
import { christmasPaymentMode } from "./environment";

/** A separate, linked balance invoice keeps the deposit receipt and taxes intact.
 * It never charges a saved card or emails a second booking confirmation. */
export async function ensureBalanceInvoice(slotId: string) {
  const slot = (await inventoryStore.read(slotId))?.data, r = slot?.reservation;
  if (!slot || !r?.paymentPlan || r.status !== "paid" || !slot.date || !slot.time) return;
  const plan = r.paymentPlan, stripe = stripeClient(), expected = bookingPaymentSummary(r).total - DEPOSIT.total;
  if (!plan.customerId) throw Error("The deposit has no Stripe customer for its balance invoice.");
  const catalog = await christmasCheckoutCatalog();
  let invoice: Stripe.Invoice;
  if (plan.balanceInvoiceId) invoice = await stripe.invoices.retrieve(plan.balanceInvoiceId);
  else {
    // Recover a successful creation even if saving its ID previously failed.
    const existing = (await stripe.invoices.list({ customer: plan.customerId, limit: 100 })).data.find(i => i.metadata?.bookingId === r.id && i.metadata?.payment_kind === "balance");
    invoice = existing ?? await stripe.invoices.create({
      customer: plan.customerId, currency: "cad", collection_method: "send_invoice", auto_advance: false,
      pending_invoice_items_behavior: "exclude",
      ...(plan.balanceDueAt && plan.balanceDueAt > Date.now() ? { due_date: Math.floor(plan.balanceDueAt / 1000) } : { days_until_due: 0 }),
      description: `Christmas session balance · ${r.id}. Order total ${money(bookingPaymentSummary(r).total)} CAD including tax. $50 deposit already paid and credited. Remaining ${money(expected)} CAD due ${balanceDeadline(slot.date, slot.time)}.`,
      footer: `Your $50 deposit receipt is separate. This invoice contains only the remaining session amount and any optional albums. Payment is due on arrival before the session starts. ${r.bookingDetails.cancellationPolicy}`,
      custom_fields: [{ name: "GST/HST registration", value: BUSINESS.gstHstNumber }],
      metadata: { service: "christmas-2026", slotId, bookingId: r.id, payment_kind: "balance", deposit_paid: String(DEPOSIT.total), original_due_at: String(Math.floor((plan.balanceDueAt ?? Date.now()) / 1000)) },
    }, { idempotencyKey: `christmas-balance-${r.id}` });
    await updateSlot(slotId, s => { if (s.reservation?.id !== r.id || !s.reservation.paymentPlan) throw Error("Balance booking changed."); s.reservation.paymentPlan.balanceInvoiceId = invoice.id; });
  }
  if (invoice.metadata?.bookingId !== r.id || invoice.metadata?.payment_kind !== "balance" || invoice.customer !== plan.customerId || invoice.livemode !== (christmasPaymentMode() === "live") || invoice.currency !== "cad") throw Error("Christmas balance invoice does not match its booking.");
  if (invoice.status === "draft") {
    const items = (await stripe.invoiceItems.list({ invoice: invoice.id, limit: 100 })).data;
    const lines = [{ component: "session", price: catalog.balancePrice, rates: catalog.taxRates }, ...catalog.albumPrices.slice(0, r.albums ?? 0).map((price, i) => ({ component: `album-${i + 1}`, price, rates: catalog.albumTaxRates }))];
    for (const line of lines) {
      if (items.some(i => i.metadata?.payment_component === line.component)) continue;
      await stripe.invoiceItems.create({ customer: plan.customerId, invoice: invoice.id, pricing: { price: line.price }, quantity: 1, tax_rates: line.rates,
        metadata: { service: "christmas-2026", bookingId: r.id, payment_component: line.component },
      }, { idempotencyKey: `christmas-balance-${r.id}-${line.component}` });
    }
    invoice = await stripe.invoices.retrieve(invoice.id);
    if (invoice.total !== expected) throw Error("Christmas balance invoice total does not match the remaining balance.");
    invoice = await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: false }, { idempotencyKey: `christmas-balance-finalize-${r.id}` });
  }
  if (invoice.total !== expected || !["open", "paid"].includes(invoice.status ?? "")) throw Error("Christmas balance invoice is not payable or has an incorrect total.");
  const due = Math.floor((plan.balanceDueAt ?? 0) / 1000);
  if (invoice.status === "open" && due * 1000 > Date.now() && invoice.due_date !== due) {
    invoice = await stripe.invoices.update(invoice.id, { due_date: due,
      description: `Christmas session balance · ${r.id}. Order total ${money(bookingPaymentSummary(r).total)} CAD including tax. $50 deposit already paid and credited. Remaining ${money(expected)} CAD due ${balanceDeadline(slot.date, slot.time)}.` });
  }
  await updateSlot(slotId, s => { if (s.reservation?.id === r.id && s.reservation.paymentPlan) s.reservation.paymentPlan.balanceInvoiceUrl = invoice.hosted_invoice_url ?? undefined; });
  return invoice;
}
