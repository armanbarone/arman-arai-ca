import "server-only";
import { getBooking, updateBooking, writeFile, readFile } from "./store";
import { weddingData, ensureWedding, type WeddingDocument } from "./wedding";
import { renderWeddingPdf } from "./wedding-pdf";
import { BUSINESS, APP_URL } from "./business";
import { sendEmail, layout, esc, footerText } from "./email";

async function sendSignedWeddingDocument(ref: string, id: string) {
  const b = await getBooking(ref);
  if (!b) throw new Error("Booking not found");
  const d = weddingData(b).documents.find((d) => d.id === id);
  if (!d || d.status !== "executed")
    throw new Error("Document is not fully signed");
  const stored = d.pdfKey ? await readFile(d.pdfKey) : null;
  const pdf = stored
    ? Buffer.from(await new Response(stored.stream).arrayBuffer())
    : await renderWeddingPdf(b, d);
  const key = `files/${ref}/wedding/${id}-${d.hash}.pdf`;
  if (!stored) await writeFile(key, pdf, "application/pdf");
  await updateBooking(ref, (b) => {
    const x = ensureWedding(b).documents.find((x) => x.id === id)!;
    x.pdfKey = key;
  });
  const recipients = [
    ...new Set([
      ...d.requiredEmails.filter((e) => e !== BUSINESS.email),
      ...b.clients.map((c) => c.email),
      BUSINESS.email,
    ]),
  ];
  for (const email of recipients) {
    const latest = await getBooking(ref);
    const current = weddingData(latest!).documents.find((x) => x.id === id)!;
    if (current.deliveries?.[email]) continue;
    try {
      const sent = await sendEmail({
        to: email,
        subject: `Signed copy: ${d.title} · ${ref}`,
        html: layout({
          heading: "Your signed copy",
          bodyHtml: `<p>Your completed ${esc(d.title.toLowerCase())} is attached, including the exact document and each person's signature record.</p><p>Keep this PDF with your wedding records.</p>`,
          button: {
            label: "Open your wedding portal",
            href: `${APP_URL}/portal/${ref}/documents`,
          },
        }),
        text: `Your completed ${d.title} is attached.\nYour portal: ${APP_URL}/portal/${ref}/documents${footerText()}`,
        attachments: [
          {
            filename: `${ref}-${d.templateKey}-v${d.version}.pdf`,
            content: pdf,
          },
        ],
        idempotencyKey: `wedding-signed/${ref}/${id}/${email}`,
      });
      if (!sent.id)
        throw new Error(
          "Email is not configured. Signed PDF is stored; delivery awaits configuration.",
        );
      await updateBooking(ref, (b) => {
        const x = ensureWedding(b).documents.find((x) => x.id === id)!;
        (x.deliveries ??= {})[email] = {
          id: sent.id!,
          sentAt: new Date().toISOString(),
        };
      });
    } catch (err) {
      await updateBooking(ref, (b) => {
        const x = ensureWedding(b).documents.find((x) => x.id === id)!;
        x.deliveryError =
          err instanceof Error ? err.message : "Email delivery failed";
      });
      throw err;
    }
  }
  await updateBooking(ref, (b) => {
    const x = ensureWedding(b).documents.find((x) => x.id === id)!;
    delete x.deliveryError;
    b.events.push({
      at: new Date().toISOString(),
      type: "signed_pdf_delivered",
      actor: "system",
      detail: { documentId: id, recipients },
    });
  });
}

export async function deliverSignedWeddingDocument(ref: string, id: string) {
  try {
    return await sendSignedWeddingDocument(ref, id);
  } catch (error) {
    const booking = await getBooking(ref);
    if (booking && weddingData(booking).documents.some((d) => d.id === id))
      await updateBooking(ref, (b) => {
        const d = ensureWedding(b).documents.find((d) => d.id === id)!;
        d.deliveryError =
          error instanceof Error
            ? error.message
            : "Signed PDF preparation or delivery failed";
      });
    throw error;
  }
}
