import { availability } from "@/lib/christmas/payments";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return Response.json(await availability(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ mode: "closed", slots: [], location: "Vancouver, BC", publishableKey: "", cancellationPolicy: "", message: "The booking calendar is temporarily unavailable. Please email Arman." }, { headers: { "Cache-Control": "no-store" } }); }
}
