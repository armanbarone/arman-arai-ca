"use server";
import { revalidatePath } from "next/cache";
import {
  requireAdmin,
  requireBookingAccess,
  directWeddingLink,
} from "@/lib/portal/auth";
import {
  getBooking,
  updateBooking,
  writeFile,
  readFile,
} from "@/lib/portal/store";
import { randomId, sha256Hex } from "@/lib/portal/token";
import {
  activeCheckouts,
  invoiceBasis,
  invoiceBalance,
  type WeddingInvoice,
} from "@/lib/portal/billing";
import { renderInvoicePdf } from "@/lib/portal/invoice-pdf";
import { templateFor } from "@/lib/portal/wedding";
import { sendEmail, layout, esc, footerText } from "@/lib/portal/email";
import { formatCad, formatDate } from "@/lib/portal/money";
import {
  connectStripe,
  paymentSetupStatus,
  checkoutForInvoice,
  expireWeddingCheckouts,
  stripeClient,
  reconcileStripeSession,
} from "@/lib/portal/stripe";
type Result =
  | { ok: true; message: string; url?: string }
  | { ok: false; error: string };
const fail = (e: unknown): Result => ({
  ok: false,
  error: e instanceof Error ? e.message : "Please try again.",
});
function refresh(ref: string) {
  revalidatePath("/admin", "layout");
  revalidatePath(`/portal/${ref}`, "layout");
}
async function emailInvoice(ref: string, id: string) {
  let b = await getBooking(ref),
    v = b?.invoices?.find((i) => i.id === id);
  if (
    !b ||
    !v ||
    v.status !== "issued" ||
    invoiceBasis(b, v.installmentId) !== v.basis ||
    b.archivedAt ||
    b.status === "cancelled"
  )
    throw Error("This invoice is no longer payable.");
  if (!v.pdfKey) {
    const bytes = await renderInvoicePdf(v),
      key = `invoices/${ref}/${v.id}.pdf`;
    await writeFile(key, bytes, "application/pdf");
    await updateBooking(ref, (b) => {
      const i = b.invoices?.find((x) => x.id === id);
      if (i) i.pdfKey = key;
    });
    v.pdfKey = key;
  }
  const stored = await readFile(v.pdfKey);
  if (!stored) throw Error("Invoice PDF is unavailable.");
  const attachment = Buffer.from(
    await new Response(stored.stream).arrayBuffer(),
  );
  for (const c of v.clients) {
    b = await getBooking(ref);
    v = b?.invoices?.find((i) => i.id === id);
    if (
      !b ||
      !v ||
      b.archivedAt ||
      v.status === "void" ||
      invoiceBalance(b, v) === 0
    )
      throw Error("This invoice is no longer payable.");
    if (v.deliveries?.[c.email]) continue;
    let request = v.notificationRequests?.[c.email];
    if (
      !request ||
      Date.now() - Date.parse(request.createdAt) > 23 * 60 * 60 * 1000
    ) {
      const proposed = {
        url: await directWeddingLink(c.email, `/portal/${ref}/payments`),
        key: randomId(16),
        createdAt: new Date().toISOString(),
      };
      await updateBooking(ref, (b) => {
        const i = b.invoices?.find((x) => x.id === id);
        if (!i) throw Error("Invoice missing.");
        const current = i.notificationRequests?.[c.email];
        if (
          !current ||
          Date.now() - Date.parse(current.createdAt) > 23 * 60 * 60 * 1000
        )
          (i.notificationRequests ??= {})[c.email] = proposed;
        request = i.notificationRequests![c.email];
      });
    }
    const url = request!.url,
      amount = v.amountDueCents;
    const sent = await sendEmail({
      to: c.email,
      subject: `Invoice ${v.number} - ${formatCad(amount)} due ${formatDate(v.dueDate)}`,
      html: layout({
        heading: `${c.preferredName || c.legalName}, your wedding invoice`,
        bodyHtml: `<p><strong>${esc(formatCad(amount))} CAD</strong> was invoiced for ${esc(v.label.toLowerCase())}, due ${esc(formatDate(v.dueDate))}.</p><p>Your invoice PDF is attached. Open your private portal to see the current balance${v.cardEnabled ? " and pay by card through Stripe" : ""}, or follow the Interac instructions in your invoice.</p>`,
        button: { label: "View invoice & pay", href: url },
      }),
      text: `Invoice ${v.number}: ${formatCad(amount)} CAD invoiced, due ${formatDate(v.dueDate)}. Your invoice PDF is attached. View the current balance and pay: ${url}${footerText()}`,
      attachments: [{ filename: v.number + ".pdf", content: attachment }],
      idempotencyKey: `aa-ca-invoice/${ref}/${id}/${c.email}/${request!.key}`,
    });
    if (!sent.id) throw Error("Email delivery is not configured.");
    const receipt = { id: sent.id, sentAt: new Date().toISOString() };
    await updateBooking(ref, (b) => {
      const i = b.invoices?.find((x) => x.id === id);
      if (i) (i.deliveries ??= {})[c.email] = receipt;
    });
  }
  await updateBooking(ref, (b) => {
    const i = b.invoices?.find((x) => x.id === id);
    if (i) delete i.deliveryError;
  });
}
export async function issueWeddingInvoice(
  ref: string,
  installmentId: string,
  description: string,
  cardEnabled: boolean,
  expectedUpdatedAt: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    if (typeof description !== "string" || description.length > 2000)
      throw Error("Enter a short invoice description.");
    if (cardEnabled) {
      const s = await paymentSetupStatus();
      if (!s.connected || s.mode !== "live")
        throw Error(
          "Connect live Stripe payments first, or issue an Interac invoice.",
        );
    }
    let id = "";
    await updateBooking(ref, async (b) => {
      if (b.updatedAt !== expectedUpdatedAt)
        throw Error("This wedding changed. Reload before issuing an invoice.");
      if (
        b.archivedAt ||
        b.status === "cancelled" ||
        b.portal?.enabled === false
      )
        throw Error("Open the active client portal before issuing an invoice.");
      const i = b.schedule.find(
        (i) => i.id === installmentId && i.status !== "void",
      );
      if (!i || i.totalCents <= i.paidCents)
        throw Error("This instalment has no outstanding balance.");
      if (
        b.invoices?.some(
          (v) =>
            v.installmentId === i.id &&
            v.status === "issued" &&
            v.basis === invoiceBasis(b, i.id) &&
            invoiceBalance(b, v) > 0,
        )
      )
        throw Error(
          "This instalment already has an open invoice. Retry its email or void it before issuing a replacement.",
        );
      const at = new Date().toISOString();
      id = randomId(16);
      const v: WeddingInvoice = {
        id,
        number: `${ref}-I${String((b.invoices?.length || 0) + 1).padStart(3, "0")}`,
        status: "issued",
        installmentId: i.id,
        label: i.label,
        description: description.trim(),
        dueDate: i.dueDate,
        issuedAt: at,
        issuedBy: admin.email,
        currency: "cad",
        subtotalCents: i.subtotalCents,
        taxes: b.taxes.map((t) => ({
          label: t.label,
          registration: t.registration,
          cents: i.taxCents[t.code] || 0,
        })),
        totalCents: i.totalCents,
        paidCentsAtIssue: i.paidCents,
        amountDueCents: i.totalCents - i.paidCents,
        clients: structuredClone(b.clients),
        eventDate: b.event.date,
        location: b.event.location,
        packageName: b.packageName,
        cardEnabled,
        basis: invoiceBasis(b, i.id),
        hash: "",
        sourceSha256: templateFor("invoice").sourceSha256,
      };
      v.hash = await sha256Hex(JSON.stringify(v));
      (b.invoices ??= []).push(v);
      b.events.push({
        at,
        type: "invoice_issued",
        actor: admin.email,
        detail: { id, number: v.number, cents: v.amountDueCents },
      });
    });
    try {
      await emailInvoice(ref, id);
    } catch {
      await updateBooking(ref, (b) => {
        const v = b.invoices?.find((x) => x.id === id);
        if (v)
          v.deliveryError =
            "The invoice is issued, but email delivery needs attention. Retry to send only to partners without a successful delivery.";
      });
      refresh(ref);
      return {
        ok: true,
        message:
          "Invoice issued. Email delivery needs attention; use Retry email.",
      };
    }
    refresh(ref);
    return {
      ok: true,
      message:
        "Invoice issued, PDF attached and payment request emailed to both partners.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function retryInvoiceEmail(
  ref: string,
  id: string,
): Promise<Result> {
  await requireAdmin();
  try {
    await emailInvoice(ref, id);
    refresh(ref);
    return {
      ok: true,
      message:
        "Invoice emails delivered; successful recipients were not sent duplicates.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function voidWeddingInvoice(
  ref: string,
  id: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    if (reason.trim().length < 5)
      throw Error("Enter a reason for voiding this invoice.");
    await expireWeddingCheckouts(ref);
    await updateBooking(ref, (b) => {
      if (activeCheckouts(b).length)
        throw Error("Cancel the open checkout before voiding this invoice.");
      const v = b.invoices?.find((x) => x.id === id);
      if (!v) throw Error("Invoice not found.");
      v.status = "void";
      v.voidReason = reason.trim();
      b.events.push({
        at: new Date().toISOString(),
        type: "invoice_voided",
        actor: admin.email,
        detail: { id, reason: reason.trim() },
      });
    });
    refresh(ref);
    return {
      ok: true,
      message:
        "Invoice voided and open card checkout expired. Recorded payments are retained.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function startInvoiceCheckout(
  ref: string,
  id: string,
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  try {
    if (session.role === "admin")
      throw Error("Each partner pays from their own client account.");
    return {
      ok: true,
      url: await checkoutForInvoice(ref, id, session.email),
      message: "Opening secure Stripe checkout.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function cancelOpenCheckout(ref: string): Promise<Result> {
  await requireBookingAccess(ref);
  try {
    await expireWeddingCheckouts(ref);
    refresh(ref);
    return {
      ok: true,
      message:
        "Open checkout closed. Your balance is unchanged unless Stripe already confirmed a payment.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function connectWeddingStripe(): Promise<Result> {
  const admin = await requireAdmin();
  try {
    await connectStripe(admin.email);
    revalidatePath("/admin", "layout");
    return {
      ok: true,
      message:
        "Stripe webhook connected. Successful card payments will update client balances automatically.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function reconcileClientCheckout(
  ref: string,
  id: string,
): Promise<Result> {
  const { booking } = await requireBookingAccess(ref);
  try {
    if (!booking.checkouts?.some((c) => c.id === id))
      throw Error("Checkout not found on this wedding.");
    const s = await stripeClient().checkout.sessions.retrieve(id);
    await reconcileStripeSession(s);
    refresh(ref);
    return {
      ok: true,
      message:
        s.payment_status === "paid"
          ? "Card payment confirmed."
          : "Stripe has not confirmed payment yet.",
    };
  } catch (e) {
    return fail(e);
  }
}
