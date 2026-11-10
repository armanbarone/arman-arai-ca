import { timingSafeEqual } from "node:crypto";
import { sendCartReminders } from "@/lib/christmas/cart";
import { retryChristmasMeta } from "@/lib/christmas/meta";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET, auth = req.headers.get("authorization") || "";
  if (!secret || auth.length !== `Bearer ${secret}`.length || !timingSafeEqual(Buffer.from(auth), Buffer.from(`Bearer ${secret}`))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const [mail, meta] = await Promise.allSettled([sendCartReminders(), retryChristmasMeta()]);
  if (meta.status === "rejected") console.warn("Christmas Meta retry will resume on the next scheduled run");
  if (mail.status === "rejected") throw mail.reason;
  const result = mail.value;
  return Response.json(result, { status: result.failed ? 503 : 200, headers: { "Cache-Control": "no-store" } });
}
