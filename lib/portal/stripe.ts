import "server-only";
import Stripe from "stripe";
import { getBooking, updateBooking, readJson, writeJson } from "./store";
import { APP_URL } from "./business";
import { invoiceBalance, activeCheckouts, invoiceBasis } from "./billing";
import { randomId } from "./token";
const CONFIG = "billing/stripe-configuration.json";
type Configuration = {
  webhookId: string;
  secret: string;
  accountId: string;
  mode: "live" | "test";
  connectedAt: string;
  connectedBy: string;
};
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw Error("Stripe is not configured on this site.");
  if (
    process.env.VERCEL_ENV !== "production" &&
    (key.startsWith("sk_live_") || key.startsWith("rk_live_"))
  )
    throw Error("Live Stripe payments are disabled outside production.");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 20000 });
}
export async function stripeConfiguration() {
  return (await readJson<Configuration>(CONFIG))?.data;
}
export async function paymentSetupStatus() {
  const configured = !!process.env.STRIPE_SECRET_KEY,
    config = await stripeConfiguration();
  const base = {
    configured,
    connected: false,
    mode: config?.mode || "unknown",
    accountName: "",
    message: configured
      ? "Connect the existing Stripe account to enable card payments."
      : "A Stripe secret key must be configured on this project.",
  };
  if (!configured) return base;
  try {
    const stripe = stripeClient(),
      a = await stripe.accounts.retrieve(null);
    if (a.country !== "CA")
      return {
        ...base,
        message:
          "The configured Stripe account is not Canadian. Connect the account for Arasaka Inc. before accepting payments.",
      };
    const hook = config
      ? await stripe.webhookEndpoints.retrieve(config.webhookId)
      : null;
    const mode = (process.env.STRIPE_SECRET_KEY || "").includes("_live_")
      ? "live"
      : "test";
    const connected =
      !!config &&
      config.accountId === a.id &&
      config.mode === mode &&
      hook?.status === "enabled" &&
      hook.url === APP_URL + "/api/stripe/webhook" &&
      !!a.charges_enabled;
    return {
      ...base,
      connected,
      mode,
      accountName: a.business_profile?.name || "Canadian Stripe account",
      message: connected
        ? "Stripe card payments are connected."
        : a.charges_enabled
          ? "Connect the webhook to synchronize card payments."
          : "Stripe account setup must be completed before accepting payments.",
    };
  } catch {
    return {
      ...base,
      message:
        "The Stripe account could not be verified. Check its key and account setup.",
    };
  }
}
export async function connectStripe(actor: string) {
  if (process.env.VERCEL_ENV !== "production")
    throw Error(
      "Connect Stripe from the live admin dashboard. Practice previews do not connect payment accounts.",
    );
  const stripe = stripeClient(),
    a = await stripe.accounts.retrieve(null);
  if (a.country !== "CA" || !a.charges_enabled)
    throw Error(
      "Complete setup of the Canadian Stripe account for Arasaka Inc. first.",
    );
  const existing = await stripeConfiguration();
  if (existing) {
    const h = await stripe.webhookEndpoints.retrieve(existing.webhookId);
    if (h.status === "enabled" && h.url === APP_URL + "/api/stripe/webhook")
      return;
    throw Error("The existing webhook needs attention in Stripe.");
  }
  const hook = await stripe.webhookEndpoints.create(
    {
      url: APP_URL + "/api/stripe/webhook",
      description: "Arman Arai Canadian wedding portal payments",
      enabled_events: [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.expired",
        "charge.refunded",
      ],
    },
    { idempotencyKey: `aa-ca-portal-webhook-v1-${a.id}` },
  );
  if (!hook.secret)
    throw Error("Stripe did not return a webhook signing secret.");
  await writeJson(
    CONFIG,
    {
      webhookId: hook.id,
      secret: hook.secret,
      accountId: a.id,
      mode: hook.livemode ? "live" : "test",
      connectedAt: new Date().toISOString(),
      connectedBy: actor,
    },
    { createOnly: true },
  );
}
export async function checkoutForInvoice(
  ref: string,
  id: string,
  email: string,
) {
  const b = await getBooking(ref),
    v = b?.invoices?.find((x) => x.id === id);
  if (
    !b ||
    !v ||
    b.archivedAt ||
    b.portal?.enabled === false ||
    b.status === "cancelled" ||
    !b.clients.some((c) => c.email === email)
  )
    throw Error("Invoice access is unavailable.");
  if (
    !b.wedding?.documents.some(
      (d) => d.templateKey === "agreement" && d.status === "executed",
    )
  )
    throw Error("Complete the agreement signatures before paying by card.");
  const amount = invoiceBalance(b, v);
  if (!v.cardEnabled || amount < 50)
    throw Error("No card payment is due on this invoice.");
  const config = await stripeConfiguration();
  if (
    !config ||
    config.mode !== "live" ||
    !(process.env.STRIPE_SECRET_KEY || "").includes("_live_") ||
    process.env.VERCEL_ENV !== "production"
  )
    throw Error("Live Stripe card checkout is not connected.");
  const stripe = stripeClient();
  // One active Checkout per wedding prevents the two partners opening independent payable links.
  const open = activeCheckouts(b)[0];
  if (open) {
    if (open.invoiceId !== id || open.amountCents !== amount)
      throw Error(
        "Another checkout is already open. Cancel it before opening a different amount.",
      );
    const old = await stripe.checkout.sessions.retrieve(open.id);
    if (old.status === "open" && old.url) return old.url;
    throw Error(
      "The previous checkout is being reconciled. Refresh in a moment.",
    );
  }
  const at = new Date().toISOString(),
    requestId = randomId(16);
  await updateBooking(ref, (current) => {
    if (current.updatedAt !== b.updatedAt || activeCheckouts(current).length)
      throw Error("The wedding balance changed. Refresh before paying.");
    current.checkouts ??= [];
    current.checkouts.push({
      id: `pending-${requestId}`,
      invoiceId: id,
      installmentId: v.installmentId,
      amountCents: amount,
      email,
      createdAt: at,
      expiresAt: new Date(Date.now() + 35 * 60000).toISOString(),
      status: "open",
      livemode: true,
    });
  });
  let session: Stripe.Checkout.Session | undefined;
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        allowed_payment_method_types: ["card"],
        customer_email: email,
        client_reference_id: ref,
        metadata: { portal: "aa-ca-wedding", ref, invoiceId: id, requestId },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "cad",
              unit_amount: amount,
              product_data: {
                name: `${v.number} - ${v.label}`,
                description:
                  "Payment toward the agreed wedding instalment. Taxes are included.",
              },
            },
          },
        ],
        payment_intent_data: {
          metadata: { portal: "aa-ca-wedding", ref, invoiceId: id },
        },
        success_url: `${APP_URL}/portal/${ref}/payments?checkout={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/portal/${ref}/payments`,
        expires_at: Math.floor(Date.now() / 1000) + 1800,
      },
      { idempotencyKey: `aa-ca-checkout-${requestId}` },
    );
    await updateBooking(ref, (current) => {
      const reservation = current.checkouts?.find(
        (x) => x.id === `pending-${requestId}`,
      );
      if (
        !reservation ||
        current.archivedAt ||
        current.portal?.enabled === false ||
        current.status === "cancelled" ||
        !current.invoices?.some(
          (x) =>
            x.id === id &&
            x.status === "issued" &&
            x.basis === invoiceBasis(current, x.installmentId),
        ) ||
        invoiceBalance(current, current.invoices.find((x) => x.id === id)!) !==
          amount
      )
        throw Error("The wedding changed while checkout was opening.");
      reservation.id = session!.id;
      reservation.expiresAt = new Date(
        session!.expires_at * 1000,
      ).toISOString();
    });
    if (!session.url) throw Error("Stripe did not return a checkout link.");
    return session.url;
  } catch (e) {
    if (session?.status === "open")
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch {}
    await updateBooking(ref, (current) => {
      const r = current.checkouts?.find((x) => x.id === `pending-${requestId}`);
      if (r) r.status = "expired";
    });
    throw e;
  }
}
export async function expireWeddingCheckouts(ref: string) {
  const b = await getBooking(ref);
  if (!b) return;
  const open = activeCheckouts(b);
  if (!open.length) return;
  const stripe = stripeClient();
  for (const c of open) {
    if (c.id.startsWith("pending-"))
      throw Error("A checkout is opening. Wait a moment, then try again.");
    const s = await stripe.checkout.sessions.retrieve(c.id);
    if (s.status === "open") await stripe.checkout.sessions.expire(c.id);
    else if (s.payment_status === "paid") {
      await reconcileStripeSession(s);
      continue;
    }
    await updateBooking(ref, (current) => {
      const found = current.checkouts?.find((x) => x.id === c.id);
      if (found && found.status === "open") found.status = "expired";
    });
  }
}
export async function reconcileStripeSession(s: Stripe.Checkout.Session) {
  if (s.metadata?.portal !== "aa-ca-wedding" || !s.metadata.ref) return;
  const ref = s.metadata.ref;
  await updateBooking(ref, (b) => {
    const c = b.checkouts?.find((x) => x.id === s.id),
      v = b.invoices?.find((x) => x.id === s.metadata?.invoiceId);
    if (!c || !v) throw Error("Checkout record not found.");
    if (
      s.livemode !== c.livemode ||
      s.currency !== "cad" ||
      s.amount_total !== c.amountCents
    )
      throw Error("Checkout amount, currency or environment mismatch.");
    if (s.status === "expired") {
      if (c.status === "open") c.status = "expired";
      return;
    }
    if (s.payment_status !== "paid") return;
    const intent =
      typeof s.payment_intent === "string"
        ? s.payment_intent
        : s.payment_intent?.id;
    if (!intent) throw Error("Stripe payment reference is missing.");
    if (
      b.payments.some(
        (p) =>
          p.stripeCheckoutSessionId === s.id ||
          p.stripePaymentIntentId === intent,
      )
    ) {
      c.status = "completed";
      return;
    }
    const i = b.schedule.find((x) => x.id === c.installmentId),
      at = new Date().toISOString();
    const needsReview =
      !i ||
      i.status === "void" ||
      i.totalCents - i.paidCents < c.amountCents ||
      v.status === "void" ||
      v.basis !== invoiceBasis(b, v.installmentId) ||
      !!b.archivedAt ||
      b.status === "cancelled";
    b.payments.push({
      id: randomId(),
      installmentId: c.installmentId,
      amountCents: c.amountCents,
      method: "stripe_card",
      status: "succeeded",
      stripeCheckoutSessionId: s.id,
      stripePaymentIntentId: intent,
      receivedAt: at,
      recordedBy: "system",
      receiptNumber: `${ref}-R${b.payments.length + 1}`,
    });
    if (i && i.status !== "void") {
      i.paidCents += c.amountCents;
      i.paidAt = at;
      i.status = i.paidCents >= i.totalCents ? "paid" : "partially_paid";
      if (
        i.kind === "deposit" &&
        i.status === "paid" &&
        !b.archivedAt &&
        b.status !== "cancelled" &&
        b.wedding?.documents.some(
          (d) => d.templateKey === "agreement" && d.status === "executed",
        )
      )
        b.status = "booked";
    }
    c.status = "completed";
    b.events.push({
      at,
      type: needsReview
        ? "stripe_payment_needs_review"
        : "stripe_payment_received",
      actor: "system",
      detail: { invoiceId: v.id, sessionId: s.id, cents: c.amountCents },
    });
  });
}
export async function syncStripeRefund(charge: Stripe.Charge) {
  const ref = charge.metadata?.ref;
  if (!ref || charge.metadata?.portal !== "aa-ca-wedding") return;
  const intent =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!intent) return;
  await updateBooking(ref, (b) => {
    const p = b.payments.find((x) => x.stripePaymentIntentId === intent);
    if (!p)
      throw Error(
        "The payment must be synchronized before its refund. Retry this event.",
      );
    const refunded = charge.amount_refunded,
      delta = refunded - (p.refundedCents || 0);
    if (
      charge.currency !== "cad" ||
      !Number.isSafeInteger(refunded) ||
      refunded < 0
    )
      throw Error("Invalid refund currency or amount.");
    if (delta <= 0) return;
    if (refunded > p.amountCents)
      throw Error("Refund exceeds the recorded payment.");
    p.refundedCents = refunded;
    if (refunded === p.amountCents) p.status = "refunded";
    const i = b.schedule.find(
      (x) => x.id === p.installmentId && x.status !== "void",
    );
    if (i) {
      i.paidCents = Math.max(0, i.paidCents - delta);
      i.status = i.paidCents ? "partially_paid" : "due";
    }
    b.events.push({
      at: new Date().toISOString(),
      type: i ? "stripe_refund_recorded" : "stripe_refund_needs_review",
      actor: "system",
      detail: { paymentId: p.id, cents: delta },
    });
  });
}
