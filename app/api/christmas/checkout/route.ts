import { z } from "zod";
import { startCheckout, checkoutRateLimit } from "@/lib/christmas/payments";
import { validateCheckoutCart, markCartCheckout } from "@/lib/christmas/cart";
import { christmasSameOrigin } from "@/lib/christmas/environment";
export const runtime = "nodejs";
const inputSchema = z.object({
  cartId: z.string().regex(/^[a-f0-9]{32}$/), cartToken: z.string().regex(/^[a-f0-9]{64}$/),
  slotId: z.string().regex(/^2026-(11|12)-\d{2}_\d{4}$/), packageId: z.literal("santa"),
  albums: z.number().int().min(0).max(3), shareActivity: z.boolean().default(false), albumDeliveryConsent: z.boolean().default(false),
  delivery: z.object({ letterNames: z.string().trim().min(1).max(160), line1: z.string().trim().min(3).max(150), line2: z.string().trim().max(100), city: z.string().trim().min(2).max(100), postalCode: z.string().trim().toUpperCase().regex(/^V\d[A-Z] ?\d[A-Z]\d$/), province: z.literal("BC"), country: z.literal("CA") }),
  name: z.string().trim().min(2).max(100), email: z.email().max(254).transform(s => s.trim().toLowerCase()),
  phone: z.string().trim().min(7).max(35), consent: z.literal(true), website: z.string().max(0).optional(),
  acceptedPolicy: z.string().min(1).max(2000), expectedSubtotal: z.number().int().positive(), expectedTotal: z.number().int().positive(),
  paymentPlan: z.literal("deposit-50-v1"), expectedDueNow: z.literal(5000),
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
    return Response.json(await startCheckout(parsed.data), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const safe = /^(That appointment|Choose a valid|Santa is not|The calendar|Bookings are not|Booking details changed|Too many|Please try checkout|Your checkout|This checkout)/.test(message);
    return Response.json({ error: safe ? message : "We could not open payment. No booking is confirmed. Please contact Arman before trying again." }, { status: safe ? 409 : 503 });
  }
}
