"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/portal/types";
import {
  invoiceBasis,
  invoiceBalance,
  invoiceState,
  activeCheckouts,
  type WeddingInvoice,
} from "@/lib/portal/billing";
import { formatCad, formatDate } from "@/lib/portal/money";
import { templateFor } from "@/lib/portal/wedding";
import {
  issueWeddingInvoice,
  retryInvoiceEmail,
  voidWeddingInvoice,
  startInvoiceCheckout,
  cancelOpenCheckout,
  reconcileClientCheckout,
} from "@/app/admin/invoice-actions";
import { useWeddingBooking, useWeddingPreview } from "./WeddingPreviewProvider";
import { Card, Eyebrow, StatusPill, buttonCls, ghostButtonCls } from "./Shell";
export default function WeddingBilling({
  booking: initial,
  admin = false,
  preview = false,
  stripeReady = false,
}: {
  booking: Booking;
  admin?: boolean;
  preview?: boolean;
  stripeReady?: boolean;
}) {
  const b = useWeddingBooking(initial, preview),
    context = useWeddingPreview(),
    router = useRouter(),
    [selected, setSelected] = useState(
      b.schedule.find((i) => i.paidCents < i.totalCents && i.status !== "void")
        ?.id || "",
    ),
    [description, setDescription] = useState(""),
    [card, setCard] = useState(stripeReady || preview),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [pending, start] = useTransition(),
    [pdfUrl, setPdfUrl] = useState("");
  useEffect(() => {
    if (preview || admin) return;
    const id = new URLSearchParams(window.location.search).get("checkout");
    if (!id) return;
    let active = true;
    setMessage("Checking your payment with Stripe…");
    reconcileClientCheckout(b.ref, id).then((r) => {
      if (!active) return;
      if (r.ok) setMessage(r.message);
      else setError(r.error);
      router.refresh();
    });
    return () => {
      active = false;
    };
  }, [b.ref, admin, preview, router]);
  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );
  const run = (
    mode: "issue" | "retry" | "void" | "pay" | "cancel" | "pdf",
    id = "",
  ) =>
    start(async () => {
      setError("");
      setMessage("");
      if (preview && context) {
        if (mode === "pdf") {
          const v = b.invoices?.find((v) => v.id === id);
          if (!v) return;
          const r = await fetch("/portal/preview/invoice-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(v),
          });
          if (!r.ok) {
            setError("The sample invoice could not be generated.");
            return;
          }
          setPdfUrl(URL.createObjectURL(await r.blob()));
          setMessage("Your practice invoice PDF is ready below.");
          return;
        }
        if (mode === "pay") {
          setMessage(
            "Practice only. A real couple opens secure Stripe checkout here; no charge or payment was created.",
          );
          return;
        }
        if (mode === "issue" && !selected) {
          setError("Choose an instalment with a balance.");
          return;
        }
        context.update((next) => {
          if (mode === "issue") {
            const i = next.schedule.find((x) => x.id === selected)!;
            const at = new Date().toISOString(),
              number = `${next.ref}-I${String((next.invoices?.length || 0) + 1).padStart(3, "0")}`;
            const v: WeddingInvoice = {
              id: `practice-invoice-${Date.now()}`,
              number,
              status: "issued",
              installmentId: i.id,
              label: i.label,
              description,
              dueDate: i.dueDate,
              issuedAt: at,
              issuedBy: "Studio preview",
              currency: "cad",
              subtotalCents: i.subtotalCents,
              taxes: next.taxes.map((t) => ({
                label: t.label,
                registration: t.registration,
                cents: i.taxCents[t.code] || 0,
              })),
              totalCents: i.totalCents,
              paidCentsAtIssue: i.paidCents,
              amountDueCents: i.totalCents - i.paidCents,
              clients: structuredClone(next.clients),
              eventDate: next.event.date,
              location: next.event.location,
              packageName: next.packageName,
              cardEnabled: card,
              basis: invoiceBasis(next, i.id),
              hash: "practice-only",
              sourceSha256: templateFor("invoice").sourceSha256,
              deliveries: Object.fromEntries(
                next.clients.map((c) => [
                  c.email,
                  { id: "practice-only", sentAt: at },
                ]),
              ),
            };
            (next.invoices ??= []).push(v);
          }
          if (mode === "void") {
            const v = next.invoices?.find((x) => x.id === id);
            if (v) v.status = "void";
          }
        });
        setMessage(
          mode === "issue"
            ? "Practice invoice issued. It appears in the client payment page; no real email was sent."
            : "Practice invoice updated.",
        );
        return;
      }
      const r =
        mode === "issue"
          ? await issueWeddingInvoice(
              b.ref,
              selected,
              description,
              card,
              b.updatedAt,
            )
          : mode === "retry"
            ? await retryInvoiceEmail(b.ref, id)
            : mode === "void"
              ? await voidWeddingInvoice(b.ref, id, reason)
              : mode === "cancel"
                ? await cancelOpenCheckout(b.ref)
                : await startInvoiceCheckout(b.ref, id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      if (r.url) {
        window.location.assign(r.url);
        return;
      }
      setMessage(r.message);
      router.refresh();
    });
  const eligible = b.schedule.filter(
    (i) =>
      i.status !== "void" &&
      i.totalCents > i.paidCents &&
      !b.invoices?.some(
        (v) =>
          v.installmentId === i.id &&
          v.status === "issued" &&
          v.basis === invoiceBasis(b, i.id) &&
          invoiceBalance(b, v) > 0,
      ),
  );
  const target = eligible.find((i) => i.id === selected),
    signed = b.wedding?.documents.some(
      (d) => d.templateKey === "agreement" && d.status === "executed",
    );
  useEffect(() => {
    if (!eligible.some((i) => i.id === selected))
      setSelected(eligible[0]?.id || "");
  }, [selected, b.updatedAt, b.invoices?.length]);
  return (
    <section className="wp-doc-section" id="invoices">
      <Eyebrow>{admin ? "Invoice & request payment" : "Your invoices"}</Eyebrow>
      <h1>Invoices & payments</h1>
      {admin &&
        !b.archivedAt &&
        b.status !== "cancelled" &&
        b.portal?.enabled !== false && (
          <Card>
            <h3>New payment request</h3>
            <p>
              Issue an invoice for an agreed instalment. Both partners receive
              the PDF, exact amount and due date, with a link to their private
              payment page.
            </p>
            {eligible.length ? (
              <>
                <label className="wp-label">
                  Instalment to invoice
                  <select
                    className="wp-input"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Choose an instalment</option>
                    {eligible.map((i) => (
                      <option value={i.id} key={i.id}>
                        {i.label} · {formatCad(i.totalCents - i.paidCents)} ·
                        due {formatDate(i.dueDate)}
                      </option>
                    ))}
                  </select>
                </label>
                {target && (
                  <div className="wp-invoice-summary">
                    <strong>
                      {formatCad(target.totalCents - target.paidCents)} CAD
                    </strong>
                    <p>
                      Due {formatDate(target.dueDate)} · Includes the recorded
                      taxes. Amounts come from the agreed payment schedule.
                    </p>
                  </div>
                )}
                <label className="wp-label">
                  Invoice description (optional)
                  <textarea
                    className="wp-input"
                    maxLength={2000}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
                <label className="wp-checkbox">
                  <input
                    type="checkbox"
                    checked={card}
                    disabled={!stripeReady && !preview}
                    onChange={(e) => setCard(e.target.checked)}
                  />
                  Offer Stripe card payment alongside Interac
                </label>
                {!stripeReady && !preview && (
                  <p>
                    <Link href="/admin/payment-settings">
                      Connect Stripe in payment settings →
                    </Link>
                  </p>
                )}
                <button
                  className={buttonCls}
                  disabled={pending || !target || !!b.archivedAt}
                  onClick={() => run("issue")}
                >
                  Issue invoice & email both partners →
                </button>
              </>
            ) : (
              <p>
                Every outstanding instalment already has an invoice, or the
                wedding balance is settled.
              </p>
            )}
          </Card>
        )}
      {!b.invoices?.length && !admin && (
        <Card>
          <p>
            Your issued invoices will appear here. The payment schedule below
            shows your agreed amounts and dates.
          </p>
        </Card>
      )}
      <div className="wp-doc-grid">
        {[...(b.invoices || [])].reverse().map((v) => {
          const state = invoiceState(b, v),
            balance = invoiceBalance(b, v);
          return (
            <Card key={v.id}>
              <div className="wp-doc-head">
                <h3>{v.number}</h3>
                <StatusPill status={state} />
              </div>
              <p>
                {v.label} · Due {formatDate(v.dueDate)}
              </p>
              <strong className="wp-invoice-amount">
                {formatCad(balance)} CAD
              </strong>
              <p>
                {state === "paid"
                  ? "Balance settled."
                  : state === "void" || state === "superseded"
                    ? "This invoice is retained for your records."
                    : "Current amount remaining on this invoice."}
              </p>
              {v.description && <p>{v.description}</p>}
              <div className="wp-toolbar">
                {preview ? (
                  <button
                    className={ghostButtonCls}
                    disabled={pending}
                    onClick={() => run("pdf", v.id)}
                  >
                    Download practice PDF
                  </button>
                ) : (
                  <a
                    className={ghostButtonCls}
                    href={`/api/portal/invoice-pdf?ref=${b.ref}&id=${v.id}`}
                  >
                    Download invoice PDF ↓
                  </a>
                )}
                {!admin && balance > 0 && v.cardEnabled && (
                  <button
                    className={buttonCls}
                    disabled={pending || !signed}
                    onClick={() => run("pay", v.id)}
                  >
                    Pay {formatCad(balance)} by card →
                  </button>
                )}
              </div>
              {!admin && balance > 0 && v.cardEnabled && !signed && (
                <p>
                  Complete both agreement signatures before opening card
                  checkout.
                </p>
              )}
              {admin && (
                <>
                  <p>
                    Email: {Object.keys(v.deliveries || {}).length} / 2 partners{" "}
                    {v.deliveryError ? "· needs attention" : ""}
                  </p>
                  {v.deliveryError && (
                    <p className="wp-message wp-message-error">
                      {v.deliveryError}
                    </p>
                  )}
                  {state === "issued" || v.deliveryError ? (
                    <button
                      className={ghostButtonCls}
                      disabled={pending}
                      onClick={() => run("retry", v.id)}
                    >
                      Retry invoice email
                    </button>
                  ) : null}
                  {balance > 0 && (
                    <details>
                      <summary>Void this invoice</summary>
                      <label className="wp-label">
                        Reason
                        <input
                          className="wp-input"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                      <button
                        className={ghostButtonCls}
                        disabled={pending || reason.trim().length < 5}
                        onClick={() => run("void", v.id)}
                      >
                        Void invoice & close card checkout
                      </button>
                    </details>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>
      {activeCheckouts(b).length > 0 && (
        <Card>
          <p>
            A Stripe checkout is open. Close it before changing the invoice,
            recording a bank transfer or issuing revised payment terms.
          </p>
          <button
            className={ghostButtonCls}
            disabled={pending}
            onClick={() => run("cancel")}
          >
            Close open card checkout
          </button>
        </Card>
      )}
      {b.payments.length > 0 && (
        <Card>
          <h3>Received payments</h3>
          <div className="wp-table-scroll">
            <table className="wp-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {b.payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.receiptNumber || p.id}
                      <small>
                        {p.status}
                        {p.refundedCents
                          ? ` · ${formatCad(p.refundedCents)} refunded`
                          : ""}
                      </small>
                    </td>
                    <td>{formatCad(p.amountCents)}</td>
                    <td>
                      {p.method === "stripe_card"
                        ? "Stripe card"
                        : p.method === "interac_etransfer"
                          ? "Interac"
                          : "Other"}
                    </td>
                    <td>{formatDate(p.receivedAt.slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {message && (
        <p className="wp-message" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="wp-message wp-message-error" role="alert">
          {error}
        </p>
      )}
      {pdfUrl && (
        <a
          className={ghostButtonCls}
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open generated practice invoice PDF ↓
        </a>
      )}
    </section>
  );
}
