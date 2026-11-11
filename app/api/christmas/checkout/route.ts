import { z } from "zod";
import { after } from "next/server";
import { christmasMetaAttribution, reportChristmasMeta } from "@/lib/christmas/meta";
import { startCheckout, checkoutRateLimit } from "@/lib/christmas/payments";
import { validateCheckoutCart, markCartCheckout } from "@/lib/christmas/cart";
import { christmasSameOrigin } from "@/lib/christmas/environment";
import { RESERVATION_REQUEST } from "@/lib/christmas/catalog";
export const runtime = "nodejs";
const inputSchema = z.object({
  cartId: z.string().regex(/^[a-f0-9]{32}$/), cartToken: z.string().regex(/^[a-f0-9]{64}$/),
  slotId: z.literal(RESERVATION_REQUEST), packageId: z.literal("santa"),
  albums: z.number().int().min(0).max(3), shareActivity: z.boolean().default(false), albumDeliveryConsent: z.boolean().default(false),
  delivery: z.object({ letterNames: z.string().trim().min(1).max(160), line1: z.string().trim().min(3).max(150), line2: z.string().trim().max(100), city: z.string().trim().min(2).max(100), postalCode: z.string().trim().toUpperCase().regex(/^V\d[A-Z] ?\d[A-Z]\d$/), province: z.literal("BC"), country: z.literal("CA") }),
  name: z.string().trim().min(2).max(100), email: z.email().max(254).transform(s => s.trim().toLowerCase()),
  phone: z.string().trim().min(7).max(35), consent: z.literal(true), website: z.string().max(0).optional(),
  acceptedPolicy: z.string().min(1).max(2000), expectedSubtotal: z.number().int().positive(), expectedTotal: z.number().int().positive(),
  paymentPlan: z.literal("deposit-50-v1"), expectedDueNow: z.literal(5000),
  analyticsOptOut: z.boolean().default(false), fbclid: z.string().max(2048).optional(),
}).refine(data => !data.albums || data.albumDeliveryConsent, { message: "Confirm the album delivery area.", path: ["albumDeliveryConsent"] });
export async function POST(req: Request) {
  if (!christmasSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!req.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Invalid request." }, { status: 415 });
  const raw = await req.text();
  if (raw.length > 10000) return Response.json({ error: "Request too large." }, { status: 413 });
  let parsed: ReturnType<typeof inputSchema.safeParse>;
  try { parsed = inputSchema.safeParse(JSON.parse(raw)); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (!parsed.success) return Response.json({ error: "Check your contact details, package, appointment and agreement to the booking terms." }, { status: 400 });
  try {
    await checkoutRateLimit((req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim());
    await validateCheckoutCart(parsed.data.cartId, parsed.data.cartToken, parsed.data);
    await markCartCheckout(parsed.data.cartId);
    const result = await startCheckout(parsed.data, christmasMetaAttribution(req, parsed.data.analyticsOptOut, parsed.data.fbclid));
    after(async () => { await reportChristmasMeta(result.slotId, "InitiateCheckout"); });
    const { slotId: _slotId, ...response } = result;
    return Response.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const safe = /^(All remaining sessions|The reservation count|That appointment|Choose a valid|Santa is not|The calendar|Bookings are not|Booking details changed|Too many|Please try checkout|Your checkout|This checkout)/.test(message);
    return Response.json({ error: safe ? message : "We could not open payment. No booking is confirmed. Please contact Arman before trying again." }, { status: safe ? 409 : 503 });
  }
}
