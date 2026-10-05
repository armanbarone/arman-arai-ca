import { requireBookingAccess } from "@/lib/portal/auth";
import { readFile } from "@/lib/portal/store";
import { renderInvoicePdf } from "@/lib/portal/invoice-pdf";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url),
    { booking } = await requireBookingAccess(u.searchParams.get("ref") || "");
  const v = booking.invoices?.find((x) => x.id === u.searchParams.get("id"));
  if (!v) return new Response("Not found", { status: 404 });
  const stored = v.pdfKey ? await readFile(v.pdfKey) : null;
  return new Response(
    stored?.stream || new Uint8Array(await renderInvoicePdf(v)),
    {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${v.number}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
