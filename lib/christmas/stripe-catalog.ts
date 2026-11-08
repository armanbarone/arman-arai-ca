import "server-only";
import { stripeClient } from "@/lib/portal/stripe";
import { GST_PERCENT, PST_PERCENT, ALBUM_ADDON, PACKAGES } from "./catalog";
import { christmasPaymentMode } from "./environment";
export const CHRISTMAS_PRODUCT = "prod_VRv3xk15KZIIXJ";
export const CHRISTMAS_PRICE = "price_1UR1DrJ13FhTkCj17wPfWMTM";
const sessionLookup = "aa_ca_xmas_session_250_30min_2026";
export const ALBUM_PRODUCT = "aa_ca_christmas_album_2026";
const lookupKeys = ["aa_ca_xmas_album_first_2026", "aa_ca_xmas_album_second_2026", "aa_ca_xmas_album_third_2026"];
let cached: { at: number; value: Awaited<ReturnType<typeof provision>> } | undefined;
let pending: Promise<Awaited<ReturnType<typeof provision>>> | undefined;
async function provision() {
  const stripe = stripeClient(), mode = christmasPaymentMode();
  if (!mode) throw Error("Christmas payments are not enabled in this environment.");
  const live = mode === "live", productId = live ? CHRISTMAS_PRODUCT : "aa_ca_christmas_session_2026_test";
  // This known live catalog entry also guards against provisioning the wrong merchant.
  if (live) {
    const merchantAnchor = await stripe.prices.retrieve(CHRISTMAS_PRICE);
    if (!merchantAnchor.livemode || merchantAnchor.currency !== "cad" || merchantAnchor.product !== CHRISTMAS_PRODUCT) throw Error("The Christmas Stripe product does not match this merchant.");
  } else {
    try { await stripe.products.retrieve(productId); }
    catch (e) {
      if (!(e instanceof Error) || !("code" in e) || e.code !== "resource_missing") throw e;
      await stripe.products.create({ id: productId, name: "TEST · Christmas with Santa", metadata: { service: "christmas-2026", testOnly: "true" } }, { idempotencyKey: "aa-ca-xmas-test-session-product-v1" });
    }
  }
  // Stripe amounts are immutable. Create a new price after approved deployment;
  // leave old prices intact so existing paid/open bookings retain their terms.
  let base = (await stripe.prices.list({ active: true, lookup_keys: [sessionLookup], limit: 10 })).data.find(p => p.lookup_key === sessionLookup);
  base ??= await stripe.prices.create({ product: productId, currency: "cad", unit_amount: PACKAGES[0].price, tax_behavior: "exclusive", lookup_key: sessionLookup, nickname: "30-minute Christmas session · $250", metadata: { service: "christmas-2026", minutes: "30" } }, { idempotencyKey: "aa-ca-xmas-session-250-30min-2026-v1" });
  if (!base.active || base.livemode !== live || base.currency !== "cad" || base.unit_amount !== PACKAGES[0].price || base.tax_behavior !== "exclusive" || base.product !== productId) throw Error("The Christmas Stripe price does not match the advertised package.");
  await stripe.products.update(productId, { default_price: base.id, description: "30 minutes with Santa across three Christmas sets. Includes 10 edited digital photographs, a mailed Santa letter, a complimentary printed keepsake, cookies and warm milk. November 9–December 20, 2026." });
  try { await stripe.products.retrieve(ALBUM_PRODUCT); }
  catch (e) {
    if (!(e instanceof Error) || !("code" in e) || e.code !== "resource_missing") throw e;
    await stripe.products.create({ id: ALBUM_PRODUCT, name: ALBUM_ADDON.name, description: ALBUM_ADDON.description + " Album buyers receive 20 edited digital photographs. First album $67, second $55, third $45. Plus tax.", metadata: { service: "christmas-2026", pages: "10", photographs: "20", delivery: "Greater Vancouver through Surrey" } }, { idempotencyKey: "aa-ca-xmas-album-product-2026-v1" });
  }
  await stripe.products.update(ALBUM_PRODUCT, { description: ALBUM_ADDON.description + " Album buyers receive 20 edited digital photographs. First album $67, second $55, third $45. Plus tax." });
  const existing = (await stripe.prices.list({ active: true, lookup_keys: lookupKeys, limit: 100 })).data;
  const albumPrices: string[] = [];
  for (const [i, unit_amount] of ALBUM_ADDON.prices.entries()) {
    const price = existing.find(p => p.lookup_key === lookupKeys[i]) ?? await stripe.prices.create({ product: ALBUM_PRODUCT, currency: "cad", unit_amount, tax_behavior: "exclusive", lookup_key: lookupKeys[i], nickname: ["First album", "Second album", "Third album"][i], metadata: { service: "christmas-2026", albumNumber: String(i + 1) } }, { idempotencyKey: `aa-ca-xmas-album-price-2026-${i + 1}-v1` });
    if (!price.active || price.livemode !== live || price.currency !== "cad" || price.unit_amount !== unit_amount || price.product !== ALBUM_PRODUCT || price.tax_behavior !== "exclusive") throw Error("The album Stripe price does not match the advertised price.");
    albumPrices.push(price.id);
  }
  const rates = (await stripe.taxRates.list({ active: true, inclusive: false, limit: 100 })).data;
  let gst = rates.find(r => r.percentage === GST_PERCENT && r.country === "CA" && r.display_name === "GST" && r.tax_type === "gst");
  if (!gst) gst = await stripe.taxRates.create({ display_name: "GST", description: "5% Canadian GST", jurisdiction: "Canada", country: "CA", percentage: GST_PERCENT, inclusive: false, tax_type: "gst" }, { idempotencyKey: "aa-ca-xmas-gst-2026-v1" });
  let pst = rates.find(r => r.percentage === PST_PERCENT && r.country === "CA" && r.state === "BC" && r.display_name === "PST" && r.tax_type === "pst");
  if (!pst) pst = await stripe.taxRates.create({ display_name: "PST", description: "7% BC PST — optional printed albums", jurisdiction: "British Columbia", country: "CA", state: "BC", percentage: PST_PERCENT, inclusive: false, tax_type: "pst" }, { idempotencyKey: "aa-ca-xmas-pst-2026-v1" });
  if (gst.livemode !== live || pst.livemode !== live) throw Error("Christmas tax rates do not match the payment environment.");
  return { price: base.id, albumPrices, taxRates: [gst.id], albumTaxRates: [gst.id, pst.id] };
}
export async function christmasCheckoutCatalog() {
  if (cached && Date.now() - cached.at < 300000) return cached.value;
  if (!pending) pending = provision().then(value => { cached = { at: Date.now(), value }; return value; }).finally(() => { pending = undefined; });
  return pending;
}
