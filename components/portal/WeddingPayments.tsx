"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/portal/types";
import { formatCad, formatDate } from "@/lib/portal/money";
import { BUSINESS } from "@/lib/portal/business";
import {
  reportWeddingPayment,
  recordWeddingPayment,
} from "@/app/portal/wedding-actions";
import { Card, Eyebrow, StatusPill, buttonCls } from "./Shell";
export default function WeddingPayments({
  booking: b,
  admin = false,
  preview = false,
}: {
  booking: Booking;
  admin?: boolean;
  preview?: boolean;
}) {
  const router = useRouter(),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [amount, setAmount] = useState(""),
    [reference, setReference] = useState(""),
    [selected, setSelected] = useState(
      b.schedule.find((i) => i.totalCents > i.paidCents)?.id || "",
    ),
    [pending, start] = useTransition();
  const paid = b.schedule.reduce((s, i) => s + i.paidCents, 0),
    owed = Math.max(0, b.totals.totalCents - paid);
  const run = (id: string) => {
    if (preview) {
      setMessage("Preview only. No payment or notification was recorded.");
      return;
    }
    start(async () => {
      setError("");
      const r = admin
        ? await recordWeddingPayment(
            b.ref,
            selected,
            Math.round(Number(amount) * 100),
            reference,
          )
        : await reportWeddingPayment(b.ref, id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setMessage(r.message || "Saved");
      router.refresh();
    });
  };
  return (
    <>
      <Eyebrow>Clear amounts. Exact dates.</Eyebrow>
      <h2>{admin ? "Payment records" : "Your payment schedule"}</h2>
      <p className="wp-lead">
        All amounts are in Canadian dollars, including the taxes shown in your
        agreement.
      </p>
      <div className="wp-stats">
        <div className="wp-stat">
          <span>Contract total</span>
          <strong>{formatCad(b.totals.totalCents)}</strong>
          <small>
            {formatCad(b.totals.subtotalCents)} +{" "}
            {formatCad(b.totals.taxTotalCents)} tax
          </small>
        </div>
        <div className="wp-stat">
          <span>Received</span>
          <strong>{formatCad(paid)}</strong>
          <small>Confirmed by the studio</small>
        </div>
        <div className="wp-stat">
          <span>Remaining</span>
          <strong>{formatCad(owed)}</strong>
          <small>Across the instalments below</small>
        </div>
      </div>
      <div className="wp-two-col">
        <Card>
          <h2>Payment schedule</h2>
          {b.schedule.map((i) => (
            <div className="wp-task" key={i.id}>
              <div className="wp-task-copy">
                <h3>{i.label}</h3>
                <p>
                  {formatCad(i.totalCents)} · due {formatDate(i.dueDate)}
                </p>
                <p>
                  {i.paidCents ? `${formatCad(i.paidCents)} received · ` : ""}
                  Reference: {i.reference}
                </p>
                {i.clientReportedSentAt && i.status !== "paid" && (
                  <p>Marked as sent. Awaiting studio confirmation.</p>
                )}
              </div>
              <StatusPill status={i.status} />
            </div>
          ))}
        </Card>
        <Card>
          <h2>
            {admin ? "Record a received payment" : "How to send a payment"}
          </h2>
          {admin ? (
            <>
              <label className="wp-label" style={{ marginTop: 20 }}>
                Instalment
                <select
                  className="wp-input"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {b.schedule
                    .filter((i) => i.totalCents > i.paidCents)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="wp-label">
                Amount received (CAD)
                <input
                  className="wp-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label className="wp-label">
                Transaction reference
                <input
                  className="wp-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>
              <button
                className={buttonCls}
                disabled={pending || !selected}
                onClick={() => run(selected)}
              >
                Confirm receipt
              </button>
            </>
          ) : (
            <>
              <p style={{ marginTop: 16 }}>Send an Interac e-Transfer to:</p>
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--accent)",
                  overflowWrap: "anywhere",
                }}
              >
                {BUSINESS.etransferEmail}
              </p>
              <p>
                Include the instalment reference in the message. Your balance
                updates when I confirm receipt.
              </p>
              {b.schedule
                .filter(
                  (i) => i.totalCents > i.paidCents && i.status !== "void",
                )
                .map((i) => (
                  <div className="wp-toolbar" key={i.id}>
                    <button
                      className={buttonCls}
                      disabled={pending || !!i.clientReportedSentAt}
                      onClick={() => run(i.id)}
                    >
                      {i.clientReportedSentAt
                        ? "Awaiting confirmation"
                        : `I sent ${i.label.toLowerCase()}`}
                    </button>
                  </div>
                ))}
              <p style={{ fontSize: 14 }}>
                Your date is reserved once the agreement is fully signed and the
                booking payment is received. Payment descriptions do not
                override applicable cancellation or refund rights.
              </p>
            </>
          )}
        </Card>
      </div>
      {message && (
        <div className="wp-message" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="wp-message wp-message-error" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
