"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { connectWeddingStripe } from "@/app/admin/invoice-actions";
import { Card, Eyebrow, buttonCls, StatusPill } from "./Shell";
export type PaymentSetup = {
  configured: boolean;
  connected: boolean;
  mode: string;
  accountName: string;
  message: string;
  emailConfigured?: boolean;
};
export default function WeddingPaymentSetup({
  status,
  preview = false,
}: {
  status: PaymentSetup;
  preview?: boolean;
}) {
  const router = useRouter(),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [pending, start] = useTransition();
  return (
    <>
      <Eyebrow>Studio · Payments & email</Eyebrow>
      <h1>Payment settings</h1>
      <p className="wp-lead">
        Stripe handles secure card checkout. Interac transfers are confirmed
        manually. Invoice emails include the PDF and a link to the private
        payment page.
      </p>
      <Card>
        <div className="wp-doc-head">
          <h2>Stripe card payments</h2>
          <StatusPill
            status={
              preview
                ? "practice"
                : status.connected
                  ? "connected"
                  : "not_connected"
            }
          />
        </div>
        {status.accountName && (
          <p>
            {status.accountName} · {status.mode} mode
          </p>
        )}
        <p>{status.message}</p>
        {!status.connected && (
          <button
            className={buttonCls}
            disabled={pending || (!status.configured && !preview)}
            onClick={() =>
              start(async () => {
                if (preview) {
                  setMessage(
                    "Practice preview: account connection is performed from the live studio dashboard.",
                  );
                  return;
                }
                const r = await connectWeddingStripe();
                if (r.ok) setMessage(r.message);
                else setError(r.error);
                router.refresh();
              })
            }
          >
            {pending
              ? "Connecting…"
              : "Connect existing Stripe account & payment updates →"}
          </button>
        )}
        <p>
          Card details stay with Stripe. The portal records successful payments,
          receipts and refunds through verified Stripe events.
        </p>
      </Card>
      <Card>
        <h2>Invoice email</h2>
        <StatusPill
          status={
            preview
              ? "practice"
              : status.emailConfigured
                ? "configured"
                : "not_configured"
          }
        />
        <p>
          Invoices are sent to both partners with their own private portal link.
          Delivery status and a retry control are shown on each invoice.
        </p>
        <p>
          {preview
            ? "Preview emails are simulated."
            : status.emailConfigured
              ? "The email sending key is configured."
              : "The email sending key needs to be configured on this project."}
        </p>
      </Card>
      <Card>
        <h2>Interac e-Transfer</h2>
        <p>
          Clients can use the invoice instructions to send Interac payments. You
          record the amount and bank reference after the transfer arrives.
          Client “sent” reports do not update the paid balance.
        </p>
      </Card>
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
    </>
  );
}
