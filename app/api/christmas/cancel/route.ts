import { cancelCheckout } from "@/lib/christmas/payments";
import { christmasSameOrigin } from "@/lib/christmas/environment";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
export async function POST(req: Request) {
  if (!christmasSameOrigin(req)) return Response.json({ error: "Invalid origin." }, { status: 403, headers });
  if (!req.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Expected JSON." }, { status: 415, headers });
  const raw = await req.text();
  if (raw.length > 1000) return Response.json({ error: "Invalid request." }, { status: 413, headers });
  try {
    const input = JSON.parse(raw);
    if (typeof input.slot !== "string" || typeof input.token !== "string") return Response.json({ error: "Invalid link." }, { status: 404, headers });
    const result = await cancelCheckout(input.slot, input.token);
    return Response.json(result ?? { error: "This payment hold is no longer active." }, { status: result ? 200 : 404, headers });
  } catch { return Response.json({ error: "We could not release this payment hold yet. Please retry shortly or contact Arman." }, { status: 409, headers }); }
}
