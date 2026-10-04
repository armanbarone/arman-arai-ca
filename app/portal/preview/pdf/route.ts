import { demoEnabled, sampleWedding } from "@/lib/portal/demo";
import { renderWeddingPdf } from "@/lib/portal/wedding-pdf";
import { ELECTRONIC_CONSENT } from "@/lib/portal/wedding";
import { sha256Hex } from "@/lib/portal/token";
export const runtime = "nodejs";
export async function GET() {
  if (!demoEnabled()) return new Response("Not found", { status: 404 });
  const b = sampleWedding(),
    d = b.wedding!.documents.find((d) => d.templateKey === "agreement")!;
  d.title = "SAMPLE — Wedding agreement";
  d.status = "executed";
  d.hash = await sha256Hex(
    JSON.stringify({
      blocks: d.blocks,
      requiredEmails: d.requiredEmails,
      version: d.version,
      templateKey: d.templateKey,
    }),
  );
  d.signatures = [
    {
      party: "company",
      email: "studio@example.com",
      legalName: "Arman Arai",
      signedAt: b.createdAt,
      consent: `SAMPLE ONLY. ${ELECTRONIC_CONSENT}`,
      ip: "192.0.2.1",
      userAgent: "Sample browser",
      hash: d.hash,
      answers: {},
    },
    ...b.clients.map((c, i) => ({
      party: "client" as const,
      email: c.email,
      legalName: c.legalName,
      signedAt: b.createdAt,
      consent: `SAMPLE ONLY. ${ELECTRONIC_CONSENT}`,
      ip: "192.0.2.1",
      userAgent: "Sample browser",
      hash: d.hash!,
      answers: {
        portfolio: i ? "portfolio_no_name" : "private",
        paidAdvertising: "no",
        testimonial: "no",
        marketing: "no",
      },
    })),
  ];
  const bytes = await renderWeddingPdf(b, d);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="sample-signed-wedding-agreement.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
