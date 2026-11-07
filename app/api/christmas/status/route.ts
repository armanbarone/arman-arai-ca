import { bookingStatus } from "@/lib/christmas/payments";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url);
  try {
    const result = await bookingStatus(url.searchParams.get("slot") || "", url.searchParams.get("token") || "");
    return Response.json(result ?? { error: "Booking not found." }, { status: result ? 200 : 404, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  } catch { return Response.json({ error: "Your payment is still being verified. Please refresh shortly or contact Arman." }, { status: 503, headers: { "Cache-Control": "private, no-store" } }); }
}
