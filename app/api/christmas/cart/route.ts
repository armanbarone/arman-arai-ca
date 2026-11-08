import { z } from "zod";
import { createCart, saveCartContact } from "@/lib/christmas/cart";
import { checkoutRateLimit } from "@/lib/christmas/payments";
import { christmasPaymentMode, christmasSameOrigin } from "@/lib/christmas/environment";
export const runtime = "nodejs";
const create = z.object({ slotId: z.string().regex(/^2026-(11|12)-\d{2}_\d{4}$/), albums: z.number().int().min(0).max(3) });
const contact = z.object({ id: z.string().regex(/^[a-f0-9]{32}$/), token: z.string().regex(/^[a-f0-9]{64}$/), name: z.string().trim().min(2).max(100), email: z.email().max(254).transform(s => s.trim().toLowerCase()), reminders: z.boolean() });
async function handle(req: Request, mode: "create" | "contact") {
  const headers = { "Cache-Control": "no-store" };
  if (!christmasPaymentMode()) return Response.json({ error: "Preview only. No details are saved." }, { status: 403, headers });
  if (!christmasSameOrigin(req) || !req.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Invalid request." }, { status: 403, headers });
  }
  const text = await req.text(); if (text.length > 3000) return Response.json({ error: "Request too large." }, { status: 413, headers });
  try {
    if (mode === "create") {
      const data = create.parse(JSON.parse(text));
      await checkoutRateLimit(`cart:${(req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim()}`);
      return Response.json(await createCart(data.slotId, data.albums), { headers });
    }
    const data = contact.parse(JSON.parse(text));
    await saveCartContact(data.id, data.token, data.name, data.email, data.reminders);
    return Response.json({ saved: true }, { headers });
  } catch { return Response.json({ error: "We couldn’t save these details. Your checkout may have expired. Please choose an appointment again." }, { status: 409, headers }); }
}
export const POST = (req: Request) => handle(req, "create");
export const PATCH = (req: Request) => handle(req, "contact");
