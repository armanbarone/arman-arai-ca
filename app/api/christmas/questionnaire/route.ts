import { questionnaireStatus, saveQuestionnaire } from "@/lib/christmas/questionnaire";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const result = await questionnaireStatus(p.get("slot") ?? "", p.get("token") ?? "");
  return Response.json(result ?? { error: "This private questionnaire link is invalid or the booking is not paid." }, { status: result ? 200 : 404, headers });
}
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403, headers });
  if (!req.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Expected JSON." }, { status: 415, headers });
  const raw = await req.text();
  if (raw.length > 20000) return Response.json({ error: "Please shorten your answers." }, { status: 413, headers });
  try {
    const input = JSON.parse(raw);
    if (typeof input.slot !== "string" || typeof input.token !== "string") return Response.json({ error: "Invalid private link." }, { status: 404, headers });
    const saved = await saveQuestionnaire(input.slot, input.token, input.answers);
    return Response.json(saved ? { saved: true } : { error: "This private link is invalid or the booking is not paid." }, { status: saved ? 200 : 404, headers });
  } catch { return Response.json({ error: "Please check your answers and try again. Your existing answers have not been replaced." }, { status: 400, headers }); }
}
