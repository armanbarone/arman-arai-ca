"use client";
import Link from "next/link";
import { useState } from "react";
import type { Booking } from "@/lib/portal/types";
import { invoiceBalance, invoiceState } from "@/lib/portal/billing";
import { formatCad, formatDate } from "@/lib/portal/money";
import { Card, Eyebrow, StatusPill, buttonCls } from "./Shell";
import { useWeddingPreview } from "./WeddingPreviewProvider";
export default function WeddingInvoiceOverview({
  bookings,
  preview = false,
}: {
  bookings: Booking[];
  preview?: boolean;
}) {
  const [q, setQ] = useState(""),
    context = useWeddingPreview(),
    rows = bookings
      .flatMap((b) => (b.invoices || []).map((v) => ({ b, v })))
      .filter(({ b, v }) =>
        (v.number + " " + b.clients.map((c) => c.legalName).join(" "))
          .toLowerCase()
          .includes(q.toLowerCase()),
      );
  return (
    <>
      <Eyebrow>All weddings · Billing</Eyebrow>
      <h1>Invoices & payments</h1>
      <p className="wp-lead">
        See payment requests, outstanding balances, email delivery and recorded
        receipts across your weddings.
      </p>
      <div className="wp-toolbar">
        <Link
          className={buttonCls}
          href={preview ? "/portal/preview/admin" : "/admin/clients"}
        >
          Choose a wedding to invoice →
        </Link>
        <Link
          href={
            preview
              ? "/portal/preview/admin/payment-settings"
              : "/admin/payment-settings"
          }
        >
          Payment settings →
        </Link>
      </div>
      <input
        className="wp-input"
        aria-label="Search invoices"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search invoice or couple"
      />
      {rows.length ? (
        <Card>
          <div className="wp-table-scroll">
            <table className="wp-table">
              <thead>
                <tr>
                  <th>Invoice & couple</th>
                  <th>Due</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ b, v }) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.number}</strong>
                      <small>
                        {b.clients
                          .map((c) => c.preferredName || c.legalName)
                          .join(" & ")}
                      </small>
                    </td>
                    <td>{formatDate(v.dueDate)}</td>
                    <td>{formatCad(invoiceBalance(b, v))}</td>
                    <td>
                      <StatusPill status={invoiceState(b, v)} />
                    </td>
                    <td>
                      {v.deliveryError
                        ? "Needs retry"
                        : `${Object.keys(v.deliveries || {}).length} / 2 sent`}
                    </td>
                    <td>
                      <Link
                        className="wp-button wp-button-secondary"
                        href={
                          preview
                            ? "/portal/preview/admin/payments"
                            : `/admin/bookings/${b.ref}/payments`
                        }
                        onClick={() => {
                          if (preview) context?.selectBooking(b.ref);
                        }}
                      >
                        Manage invoice →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <h2>No invoices issued yet</h2>
          <p>
            Open a wedding, choose Invoices & payments, and issue a payment
            request for an agreed instalment.
          </p>
        </Card>
      )}
    </>
  );
}
