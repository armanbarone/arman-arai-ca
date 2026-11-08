import { timingSafeEqual } from "node:crypto";
import { sendCartReminders } from "@/lib/christmas/cart";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET, auth = req.headers.get("authorization") || "";
  if (!secret || auth.length !== `Bearer ${secret}`.length || !timingSafeEqual(Buffer.from(auth), Buffer.from(`Bearer ${secret}`))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await sendCartReminders();
  return Response.json(result, { status: result.failed ? 503 : 200, headers: { "Cache-Control": "no-store" } });
}
