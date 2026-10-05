import {
  stripeClient,
  stripeConfiguration,
  reconcileStripeSession,
  syncStripeRefund,
} from "@/lib/portal/stripe";
import Stripe from "stripe";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  const config = await stripeConfiguration();
  if (!config) return new Response("Webhook not configured", { status: 503 });
  if (Number(req.headers.get("content-length") || 0) > 1000000)
    return new Response("Too large", { status: 413 });
  const reader = req.body?.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  if (!reader) return new Response("Missing body", { status: 400 });
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 1000000) {
      await reader.cancel();
      return new Response("Too large", { status: 413 });
    }
    chunks.push(value);
  }
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(
      Buffer.concat(chunks),
      signature,
      config.secret,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  if (event.livemode !== (config.mode === "live"))
    return new Response("Mode mismatch", { status: 400 });
  try {
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.expired",
      ].includes(event.type)
    )
      await reconcileStripeSession(
        event.data.object as Stripe.Checkout.Session,
      );
    else if (event.type === "charge.refunded")
      await syncStripeRefund(event.data.object as Stripe.Charge);
    return Response.json({ received: true });
  } catch {
    return new Response("Payment reconciliation needs retry", { status: 500 });
  }
}
