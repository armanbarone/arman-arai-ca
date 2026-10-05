import "server-only";
import PDFDocument from "pdfkit";
import path from "node:path";
import type { WeddingInvoice } from "./billing";
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "./business";
import { formatCad, formatDate } from "./money";
export async function renderInvoicePdf(
  v: WeddingInvoice,
  sample = false,
): Promise<Buffer> {
  const d = new PDFDocument({
    size: "LETTER",
    margins: { top: 44, bottom: 55, left: 44, right: 44 },
    font: path.join(process.cwd(), "public/fonts/portal/NotoSans-Regular.ttf"),
    bufferPages: true,
    info: { Title: `Invoice ${v.number}`, Author: BUSINESS.legalName },
  });
  d.registerFont(
    "Body",
    path.join(process.cwd(), "public/fonts/portal/NotoSans-Regular.ttf"),
  );
  d.registerFont(
    "Bold",
    path.join(process.cwd(), "public/fonts/portal/NotoSans-Bold.ttf"),
  );
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    d.on("data", (x) => chunks.push(x));
    d.on("end", () => resolve(Buffer.concat(chunks)));
    d.on("error", reject);
  });
  function text(t: string, size = 10, bold = false) {
    d.font(bold ? "Bold" : "Body")
      .fontSize(size)
      .fillColor("#29241f");
    const h = d.heightOfString(t, { width: 524, lineGap: 3 });
    if (d.y + h > 720) d.addPage();
    d.text(t, 44, d.y, { width: 524, lineGap: 3 });
    d.moveDown(0.5);
  }
  function row(label: string, amount: number, bold = false) {
    d.font(bold ? "Bold" : "Body").fontSize(11);
    const h = Math.max(25, d.heightOfString(label, { width: 350 }) + 10);
    if (d.y + h > 720) d.addPage();
    const y = d.y;
    d.text(label, 52, y, { width: 350 });
    d.text(formatCad(amount), 408, y, { width: 148, align: "right" });
    d.y = y + h;
  }
  text("ARMAN ARAI", 18, true);
  text(BUSINESS.legalName + " operating as " + BUSINESS.tradeName);
  text(BUSINESS_ADDRESS_ONE_LINE);
  text(BUSINESS.email + " | " + BUSINESS.phone);
  d.moveDown(0.5);
  text(sample ? "SAMPLE INVOICE - NOT A PAYMENT REQUEST" : "INVOICE", 20, true);
  text(v.number, 13, true);
  text(
    `Issued ${formatDate(new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(v.issuedAt)))} | Due ${formatDate(v.dueDate)} | Currency CAD`,
  );
  text("Bill to", 11, true);
  for (const c of v.clients) {
    text(c.legalName + " | " + c.email);
    text(
      [
        c.address.line1,
        c.address.line2,
        c.address.city,
        c.address.province,
        c.address.postalCode,
      ]
        .filter(Boolean)
        .join(", "),
    );
  }
  text(
    `${v.packageName} | Wedding ${formatDate(v.eventDate)} | ${v.location}`,
    10,
    true,
  );
  text(v.label, 12, true);
  if (v.description) text(v.description);
  d.moveDown(0.5);
  row("Instalment subtotal", v.subtotalCents);
  for (const t of v.taxes)
    row(t.label + " | Registration " + t.registration, t.cents);
  row("Instalment total", v.totalCents, true);
  if (v.paidCentsAtIssue) row("Previously received", -v.paidCentsAtIssue);
  d.rect(44, d.y - 3, 524, 34).fill("#f2ede5");
  d.fillColor("#29241f");
  row("Amount due at issue", v.amountDueCents, true);
  d.moveDown(0.7);
  text("Payment instructions", 11, true);
  text(
    `Open your private wedding portal to view the current balance${v.cardEnabled ? " and pay by card using Stripe" : ""}. The portal reflects payments received after this invoice was issued.`,
  );
  text(
    `Interac e-Transfer: ${BUSINESS.etransferEmail}. Include ${v.number} in the transfer message. Interac receipts are confirmed by the studio.`,
  );
  text(
    "This invoice follows the signed agreement and approved payment schedule. It does not add services or change contract terms.",
  );
  const range = d.bufferedPageRange();
  for (let p = 0; p < range.count; p++) {
    d.switchToPage(p);
    const bottom = d.page.margins.bottom;
    d.page.margins.bottom = 0;
    d.font("Body")
      .fontSize(7)
      .fillColor("#6b5a48")
      .text(
        `${sample ? "SAMPLE / NON-BINDING | " : ""}${v.number} | ${p + 1} of ${range.count}`,
        44,
        748,
        { width: 524, align: "center", lineBreak: false },
      );
    d.page.margins.bottom = bottom;
  }
  d.end();
  return done;
}
