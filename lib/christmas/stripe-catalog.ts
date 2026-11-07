import "server-only";
import { stripeClient } from "@/lib/portal/stripe";
import { GST_PERCENT, PST_PERCENT, ALBUM_ADDON, PACKAGES } from "./catalog";
export const CHRISTMAS_PRODUCT = "prod_VRv3xk15KZIIXJ";
export const CHRISTMAS_PRICE = "price_1UR1DrJ13FhTkCj17wPfWMTM";
export const ALBUM_PRODUCT = "aa_ca_christmas_album_2026";
const lookupKeys = ["aa_ca_xmas_album_first_2026", "aa_ca_xmas_album_second_2026", "aa_ca_xmas_album_third_2026"];
let cached: { at: number; value: Awaited<ReturnType<typeof provision>> } | undefined;
let pending: Promise<Awaited<ReturnType<typeof provision>>> | undefined;
async function provision() {
  const stripe = stripeClient();
  // This known live catalog entry also guards against provisioning the wrong merchant.
  const base = await stripe.prices.retrieve(CHRISTMAS_PRICE);
  if (!base.active || !base.livemode || base.currency !== "cad" || base.unit_amount !== PACKAGES[0].price || base.tax_behavior !== "exclusive" || base.product !== CHRISTMAS_PRODUCT) throw Error("The Christmas Stripe price does not match the advertised package.");
  await stripe.products.update(CHRISTMAS_PRODUCT, { description: "Approximately 45-minute Christmas session with Santa, three sets, 10 edited digital photos, mailed Santa letter, complimentary printed keepsake gift, cookies and warm milk. November 9–December 20, 2026. GST collected on this package per merchant instruction." });
  try { await stripe.products.retrieve(ALBUM_PRODUCT); }
  catch (e) {
    if (!(e instanceof Error) || !("code" in e) || e.code !== "resource_missing") throw e;
    await stripe.products.create({ id: ALBUM_PRODUCT, name: ALBUM_ADDON.name, description: ALBUM_ADDON.description + " Album buyers receive 20 edited digital photographs. First album $67, second $55, third $45; plus 5% GST and 7% BC PST.", metadata: { service: "christmas-2026", pages: "10", photographs: "20", delivery: "Greater Vancouver through Surrey" } }, { idempotencyKey: "aa-ca-xmas-album-product-2026-v1" });
  }
  const existing = (await stripe.prices.list({ active: true, lookup_keys: lookupKeys, limit: 100 })).data;
  const albumPrices: string[] = [];
  for (const [i, unit_amount] of ALBUM_ADDON.prices.entries()) {
    const price = existing.find(p => p.lookup_key === lookupKeys[i]) ?? await stripe.prices.create({ product: ALBUM_PRODUCT, currency: "cad", unit_amount, tax_behavior: "exclusive", lookup_key: lookupKeys[i], nickname: ["First album", "Second album", "Third album"][i], metadata: { service: "christmas-2026", albumNumber: String(i + 1) } }, { idempotencyKey: `aa-ca-xmas-album-price-2026-${i + 1}-v1` });
    if (!price.active || !price.livemode || price.currency !== "cad" || price.unit_amount !== unit_amount || price.product !== ALBUM_PRODUCT || price.tax_behavior !== "exclusive") throw Error("The album Stripe price does not match the advertised price.");
    albumPrices.push(price.id);
  }
  const rates = (await stripe.taxRates.list({ active: true, inclusive: false, limit: 100 })).data;
  let gst = rates.find(r => r.percentage === GST_PERCENT && r.country === "CA" && r.display_name === "GST" && r.tax_type === "gst");
  if (!gst) gst = await stripe.taxRates.create({ display_name: "GST", description: "5% Canadian GST", jurisdiction: "Canada", country: "CA", percentage: GST_PERCENT, inclusive: false, tax_type: "gst" }, { idempotencyKey: "aa-ca-xmas-gst-2026-v1" });
  let pst = rates.find(r => r.percentage === PST_PERCENT && r.country === "CA" && r.state === "BC" && r.display_name === "PST" && r.tax_type === "pst");
  if (!pst) pst = await stripe.taxRates.create({ display_name: "PST", description: "7% BC PST — optional printed albums", jurisdiction: "British Columbia", country: "CA", state: "BC", percentage: PST_PERCENT, inclusive: false, tax_type: "pst" }, { idempotencyKey: "aa-ca-xmas-pst-2026-v1" });
  if (!gst.livemode || !pst.livemode) throw Error("Christmas tax rates must be live.");
  return { price: base.id, albumPrices, taxRates: [gst.id], albumTaxRates: [gst.id, pst.id] };
}
export async function christmasCheckoutCatalog() {
  if (cached && Date.now() - cached.at < 300000) return cached.value;
  if (!pending) pending = provision().then(value => { cached = { at: Date.now(), value }; return value; }).finally(() => { pending = undefined; });
  return pending;
}
