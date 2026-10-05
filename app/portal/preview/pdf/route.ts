import { z } from "zod";
import { demoEnabled, sampleWedding } from "@/lib/portal/demo";
import { renderWeddingPdf } from "@/lib/portal/wedding-pdf";
import {
  documentFingerprint,
  ELECTRONIC_CONSENT,
  type WeddingDocument,
} from "@/lib/portal/wedding";
import {
  documentSections,
  initialSectionsFor,
  initialsForName,
} from "@/lib/portal/document-sections";
import { sha256Hex } from "@/lib/portal/token";
export const runtime = "nodejs";
const text = z.string().max(15000),
  block = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("p"), text }),
    z.object({ kind: z.literal("h"), text }),
    z.object({
      kind: z.literal("question"),
      id: text,
      label: text,
      hint: text.default(""),
      required: z.boolean().default(false),
    }),
    z.object({ kind: z.literal("check"), text, id: text.optional() }),
    z.object({
      kind: z.literal("table"),
      id: text,
      header: z.boolean().default(false),
      rows: z.array(z.array(z.object({ text })).max(12)).max(100),
    }),
  ]);
const documentSchema = z.object({
  id: z.string().max(100),
  templateKey: z.literal("agreement"),
  title: z.string().max(200),
  version: z.number().int().min(1).max(1000),
  status: z.enum([
    "draft",
    "issued",
    "partial",
    "executed",
    "withdrawn",
    "superseded",
  ]),
  createdAt: z.string().max(100),
  blocks: z.array(block).max(400),
  requiredEmails: z.array(z.email()).max(2),
  signatures: z
    .array(
      z.object({
        party: z.enum(["client", "company"]),
        email: z.email(),
        legalName: z.string().max(200),
        signedAt: z.string().max(100),
        consent: z.string().max(2000),
        hash: z.string().max(200),
        answers: z.record(z.string().max(100), z.string().max(4000)),
        initials: z.record(z.string().max(50), z.string().max(30)).optional(),
      }),
    )
    .max(3),
});
async function response(d: WeddingDocument) {
  const b = sampleWedding();
  d.title = "SAMPLE — " + d.title.replace(/^SAMPLE — /, "");
  const bytes = await renderWeddingPdf(b, d, true);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="sample-wedding-agreement.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
export async function GET() {
  if (!demoEnabled()) return new Response("Not found", { status: 404 });
  const b = sampleWedding(),
    d = b.wedding!.documents.find((d) => d.templateKey === "agreement")!;
  d.status = "executed";
  d.hash = await sha256Hex(documentFingerprint(d));
  d.signatures = [
    {
      party: "company",
      email: "studio@example.com",
      legalName: "Arman Arai",
      signedAt: b.createdAt,
      consent: `SAMPLE ONLY. ${ELECTRONIC_CONSENT}`,
      ip: "",
      userAgent: "Sample browser",
      hash: d.hash,
      answers: {},
      initials: Object.fromEntries(
        initialSectionsFor(d).map((s) => [s.id, "AA"]),
      ),
    },
    ...b.clients.map((c) => ({
      party: "client" as const,
      email: c.email,
      legalName: c.legalName,
      signedAt: b.createdAt,
      consent: `SAMPLE ONLY. ${ELECTRONIC_CONSENT}`,
      ip: "",
      userAgent: "Sample browser",
      hash: d.hash!,
      answers: { portfolio: "private" },
      initials: Object.fromEntries(
        initialSectionsFor(d).map((s) => [s.id, initialsForName(c.legalName)]),
      ),
    })),
  ];
  return response(d);
}
export async function POST(req: Request) {
  if (!demoEnabled()) return new Response("Not found", { status: 404 });
  try {
    let size = 0;
    const chunks: Uint8Array[] = [];
    const reader = req.body?.getReader();
    if (!reader) throw new Error("Body missing");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 256000) {
        await reader.cancel();
        return new Response("Too large", { status: 413 });
      }
      chunks.push(value);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString("utf8")),
      p = documentSchema.parse(data.document);
    const d: WeddingDocument = {
      ...p,
      fields: {},
      initialSections: documentSections(p.blocks).map(({ id, title }) => ({
        id,
        title,
      })),
      signatures: p.signatures.map((s) => ({
        ...s,
        ip: "",
        userAgent: "Sample browser",
        consent: `SAMPLE ONLY. ${s.consent}`,
      })),
    };
    d.hash = await sha256Hex(documentFingerprint(d));
    for (const s of d.signatures) s.hash = d.hash;
    return await response(d);
  } catch {
    return new Response("Invalid sample document", { status: 400 });
  }
}
