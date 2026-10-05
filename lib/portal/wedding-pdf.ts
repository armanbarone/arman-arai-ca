import "server-only";
import PDFDocument from "pdfkit";
import path from "node:path";
import type { Booking } from "./types";
import type { WeddingDocument, WeddingBlock } from "./wedding";
import { initialSectionsFor, validateInitials } from "./document-sections";
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "./business";

/** Renders the stored snapshot, never current booking fields. Fonts are bundled for consistent exports. */
export async function renderWeddingPdf(
  b: Booking,
  d: WeddingDocument,
  sample = false,
): Promise<Buffer> {
  if (d.status === "executed" && d.initialSections) {
    if (
      !d.requiredEmails.every((email) =>
        d.signatures.some((s) => s.party === "client" && s.email === email),
      )
    )
      throw new Error("Required signatures are incomplete");
    for (const sig of d.signatures)
      validateInitials(d, sig.legalName, sig.initials || {});
  }
  const doc = new PDFDocument({
    font: path.join(process.cwd(), "public/fonts/portal/NotoSans-Regular.ttf"),
    size: "LETTER",
    margins: { top: 42, left: 42, right: 42, bottom: 60 },
    bufferPages: true,
    info: { Title: `${d.title} · ${b.ref}`, Author: BUSINESS.legalName },
  });
  doc.registerFont(
    "Body",
    path.join(process.cwd(), "public/fonts/portal/NotoSans-Regular.ttf"),
  );
  doc.registerFont(
    "Bold",
    path.join(process.cwd(), "public/fonts/portal/NotoSans-Bold.ttf"),
  );
  const chunks: Buffer[] = [];
  const complete = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const width = 528,
    limit = 732;
  function ensure(height: number) {
    if (doc.y + height > limit) {
      doc.addPage();
      doc.x = 42;
    }
  }
  function text(value: string, size = 10.5, bold = false) {
    doc
      .font(bold ? "Bold" : "Body")
      .fontSize(size)
      .fillColor("#2b2723");
    const opts = { width, lineGap: 2 };
    const height = doc.heightOfString(value, opts);
    if (height < limit - 42) ensure(height + 10);
    doc.text(value, 42, doc.y, opts);
    doc.y += 10;
  }
  function heading(value: string) {
    ensure(65);
    doc.y += 8;
    text(value, 13, true);
  }
  function table(block: Extract<WeddingBlock, { kind: "table" }>) {
    const count = block.rows[0]?.length || 1,
      cellWidth = width / count;
    for (let ri = 0; ri < block.rows.length; ri++) {
      const row = block.rows[ri],
        bold = !!block.header && ri === 0;
      doc.font(bold ? "Bold" : "Body").fontSize(9.5);
      const heights = row.map((c) =>
          doc.heightOfString(c.text, { width: cellWidth - 14, lineGap: 1.5 }),
        ),
        height = Math.max(26, ...heights.map((h) => h + 14));
      if (height > limit - 42) {
        // Long answers flow as labeled paragraphs rather than being clipped inside an oversized row.
        for (let ci = 0; ci < row.length; ci++) {
          const label = block.header
            ? block.rows[0][ci]?.text
            : `Column ${ci + 1}`;
          if (row[ci].text) {
            heading(`${label || `Column ${ci + 1}`} · entry ${ri}`);
            text(row[ci].text);
          }
        }
        continue;
      }
      ensure(height);
      const y = doc.y;
      if (bold) doc.rect(42, y, width, height).fill("#eee8df");
      doc.fillColor("#2b2723");
      row.forEach((c, ci) => {
        doc
          .font(bold ? "Bold" : "Body")
          .fontSize(9.5)
          .text(c.text, 42 + ci * cellWidth + 7, y + 7, {
            width: cellWidth - 14,
            lineGap: 1.5,
          });
      });
      doc
        .moveTo(42, y + height)
        .lineTo(570, y + height)
        .lineWidth(0.5)
        .strokeColor("#d7cbbd")
        .stroke();
      doc.y = y + height;
      doc.x = 42;
    }
    doc.y += 12;
  }
  text(
    `${BUSINESS.legalName} operating as ${BUSINESS.tradeName} · ${b.ref} · Version ${d.version}`,
    8.5,
  );
  if (sample) text("SAMPLE ONLY — NON-BINDING PRACTICE RECORD", 12, true);
  text(d.title, 22, true);
  text(
    d.status === "executed"
      ? "Completed signed record"
      : d.status === "issued" && !d.requiredEmails.length
        ? "Issued record — no signature required"
        : "Review copy — signatures outstanding",
  );
  for (const block of d.blocks) {
    if (block.kind === "table") table(block);
    else if (block.kind === "h") heading(block.text);
    else if (block.kind === "question") text(block.label);
    else
      text(
        `${block.kind === "check" ? "Choice / acknowledgement: " : ""}${block.text.replace(/☐/g, "")}`,
      );
  }
  doc.addPage();
  heading("Section initials record");
  text(
    "The initials below acknowledge the sections of the same document version recorded in the signature certificate.",
  );
  table({
    kind: "table",
    id: "initials-record",
    header: true,
    rows: [
      [
        { text: "Document section" },
        ...d.signatures.map((sig) => ({ text: sig.legalName })),
      ],
      ...initialSectionsFor(d).map((section) => [
        { text: section.title },
        ...d.signatures.map((sig) => ({
          text: sig.initials?.[section.id] || "Not recorded",
        })),
      ]),
    ],
  });
  doc.addPage();
  heading("Signature certificate");
  text(`Document version ${d.version} · SHA-256: ${d.hash || "Draft"}`, 9);
  text(BUSINESS_ADDRESS_ONE_LINE, 9);
  for (const [signatureIndex, sig] of d.signatures.entries()) {
    if (signatureIndex > 0) {
      doc.addPage();
      heading("Signature certificate · continued");
    }
    ensure(200);
    heading(sig.legalName);
    text(`Typed electronic signature: ${sig.legalName}`);
    text(
      `${sig.party === "company" ? `For ${BUSINESS.legalName}` : "Client"} · authenticated email: ${sig.email}`,
      9,
    );
    text(`Signed: ${sig.signedAt} (UTC)`, 9);
    for (const section of initialSectionsFor(d))
      text(
        `Initials · ${section.title}: ${sig.initials?.[section.id] || "Not recorded"}`,
        9,
      );
    text(`Consent: ${sig.consent}`, 9);
    text(`Document hash accepted: ${sig.hash}`, 8.5);
    text(`IP: ${sig.ip} · Device: ${sig.userAgent}`, 8.5);
    for (const [k, v] of Object.entries(sig.answers)) text(`${k}: ${v}`, 9);
    doc.y += 10;
  }
  if (!d.signatures.length) text("No signatures have been recorded.");
  const pages = doc.bufferedPageRange();
  for (let i = pages.start; i < pages.start + pages.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .font("Body")
      .fontSize(8)
      .fillColor("#71665b")
      .text(
        `${sample ? "SAMPLE / NON-BINDING · " : ""}${b.ref} · ${BUSINESS.email} · ${i + 1} / ${pages.count}`,
        42,
        760,
        { width, lineBreak: false },
      );
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return complete;
}
