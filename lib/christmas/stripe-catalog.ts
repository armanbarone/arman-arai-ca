import "server-only";
import { stripeClient } from "@/lib/portal/stripe";
import { GST_PERCENT, GRINCH_ADDON, PACKAGES } from "./catalog";
export const CHRISTMAS_PRODUCT = "prod_VRv3xk15KZIIXJ";
export const CHRISTMAS_PRICE = "price_1UR1DrJ13FhTkCj17wPfWMTM";
export const GRINCH_PRODUCT = "prod_VRwSIetrz9JUWh";
export const GRINCH_PRICE = "price_1UR2ZNJ13FhTkCj1RhR5D8wU";
export async function christmasCheckoutCatalog() {
  const stripe = stripeClient();
  const prices = await Promise.all([stripe.prices.retrieve(CHRISTMAS_PRICE), stripe.prices.retrieve(GRINCH_PRICE)]);
  for (const [i, price] of prices.entries()) {
    if (!price.active || !price.livemode || price.currency !== "cad" || price.unit_amount !== (i ? GRINCH_ADDON.price : PACKAGES[0].price) || price.tax_behavior !== "exclusive" || price.product !== (i ? GRINCH_PRODUCT : CHRISTMAS_PRODUCT))
      throw Error("The Christmas Stripe price does not match the advertised package.");
  }
  // Merchant-requested GST-only collection for this integration.
  // The printed-photo PST treatment remains a documented launch review item.
  const existing = (await stripe.taxRates.list({ active: true, inclusive: false, limit: 100 })).data;
  let gst = existing.find(r => r.percentage === GST_PERCENT && r.country === "CA" && r.display_name === "GST" && r.tax_type === "gst");
  if (!gst) gst = await stripe.taxRates.create({ display_name: "GST", description: "5% Canadian GST — Christmas photography", jurisdiction: "Canada", country: "CA", percentage: GST_PERCENT, inclusive: false, tax_type: "gst", metadata: { service: "christmas-2026" } }, { idempotencyKey: "christmas-2026-gst-5-gnwhjstq" });
  if (!gst.livemode) throw Error("The GST rate must be live.");
  return { price: prices[0].id, grinchPrice: prices[1].id, taxRates: [gst.id] };
}
