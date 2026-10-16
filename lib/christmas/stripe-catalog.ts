import "server-only";
import { stripeClient } from "@/lib/portal/stripe";
import { GST_PERCENT, PACKAGES } from "./catalog";
// Live catalog item created in the connected Arasaka Inc. account.
export const CHRISTMAS_PRODUCT = "prod_VRv3xk15KZIIXJ";
export const CHRISTMAS_PRICE = "price_1UR1DrJ13FhTkCj17wPfWMTM";
export async function christmasCheckoutCatalog() {
  const stripe = stripeClient();
  const price = await stripe.prices.retrieve(CHRISTMAS_PRICE);
  if (!price.active || !price.livemode || price.currency !== "cad" || price.unit_amount !== PACKAGES[0].price || price.tax_behavior !== "exclusive" || price.product !== CHRISTMAS_PRODUCT)
    throw Error("The Christmas Stripe price does not match the advertised package.");
  // This is an in-person BC studio service delivering digital photographs only.
  // Manual GST is independent of Stripe Tax registrations (currently unconfigured).
  // One idempotent rate is reused; it is never represented as a second product.
  let gst = (await stripe.taxRates.list({ active: true, inclusive: false, limit: 100 })).data.find(r => r.percentage === GST_PERCENT && r.country === "CA" && r.display_name === "GST" && r.tax_type === "gst");
  if (!gst) gst = await stripe.taxRates.create({ display_name: "GST", description: "5% Canadian GST — North Vancouver digital photography session", jurisdiction: "Canada", country: "CA", percentage: GST_PERCENT, inclusive: false, tax_type: "gst", metadata: { service: "christmas-2026" } }, { idempotencyKey: "christmas-2026-gst-5-gnwhjstq" });
  if (!gst.livemode) throw Error("The GST rate must be live.");
  return { price: price.id, taxRate: gst.id };
}
