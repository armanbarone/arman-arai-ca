import { z } from "zod";
import { renderInvoicePdf } from "@/lib/portal/invoice-pdf";
import type { WeddingInvoice } from "@/lib/portal/billing";
import { demoEnabled } from "@/lib/portal/demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!demoEnabled()) return new Response("Not found", { status: 404 });
  const text = await req.text();
  if (text.length > 64000) return new Response("Too large", { status: 413 });
  try {
    const raw = JSON.parse(text),
      money = z.number().int().min(0).max(100000000);
    const data = z
      .object({
        number: z.string().regex(/^AA-CA-\d{4}-\d{3,}-I\d+$/),
        label: z.string().max(200),
        description: z.string().max(2000),
        dueDate: z.iso.date(),
        issuedAt: z.iso.datetime(),
        currency: z.literal("cad"),
        subtotalCents: money,
        taxes: z
          .array(
            z.object({
              label: z.string().max(100),
              registration: z.string().max(100),
              cents: money,
            }),
          )
          .max(5),
        totalCents: money,
        paidCentsAtIssue: money,
        amountDueCents: money,
        clients: z
          .array(
            z.object({
              legalName: z.string().max(200),
              email: z.email(),
              address: z.object({
                line1: z.string().max(200),
                line2: z.string().max(200).optional(),
                city: z.string().max(100),
                province: z.string().max(100),
                postalCode: z.string().max(30),
              }),
            }),
          )
          .length(2),
        eventDate: z.iso.date(),
        location: z.string().max(200),
        packageName: z.string().max(200),
        cardEnabled: z.boolean(),
      })
      .passthrough()
      .parse(raw);
    const pdf = await renderInvoicePdf(data as unknown as WeddingInvoice, true);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SAMPLE-${data.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Invalid practice invoice", { status: 400 });
  }
}
