import { readFile } from "@/lib/portal/store";
import { requireBookingAccess } from "@/lib/portal/auth";
import { visibleDocuments, weddingData } from "@/lib/portal/wedding";
import { renderWeddingPdf } from "@/lib/portal/wedding-pdf";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const url = new URL(req.url),
    ref = url.searchParams.get("ref") || "",
    id = url.searchParams.get("id");
  const { booking, session } = await requireBookingAccess(ref);
  const d = (
    session.role === "admin"
      ? weddingData(booking).documents
      : visibleDocuments(booking)
  ).find((d) => d.id === id);
  if (!d) return new Response("Not found", { status: 404 });
  const stored =
    d.pdfKey && d.status === "executed" ? await readFile(d.pdfKey) : null;
  const bytes = stored
    ? new Uint8Array(await new Response(stored.stream).arrayBuffer())
    : await renderWeddingPdf(booking, d);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${ref}-${d.templateKey}-v${d.version}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
