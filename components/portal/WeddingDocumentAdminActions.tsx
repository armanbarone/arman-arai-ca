"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  retryWeddingDelivery,
  withdrawWeddingDocument,
} from "@/app/portal/wedding-actions";
export default function WeddingDocumentAdminActions({
  bookingRef,
  documentId,
  status,
  deliveryError,
  clientSigned,
}: {
  bookingRef: string;
  documentId: string;
  status: string;
  deliveryError?: string;
  clientSigned: boolean;
}) {
  const router = useRouter(),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  const run = (mode: string) =>
    start(async () => {
      const r =
        mode === "retry"
          ? await retryWeddingDelivery(bookingRef, documentId)
          : await withdrawWeddingDocument(bookingRef, documentId, reason);
      setMessage(r.ok ? r.message || "Updated" : r.error);
      router.refresh();
    });
  return (
    <>
      {deliveryError && (
        <p className="wp-message wp-message-error">
          Delivery needs attention: {deliveryError}
        </p>
      )}
      {status === "executed" && (
        <button
          className="wp-button wp-button-secondary"
          disabled={pending}
          onClick={() => run("retry")}
        >
          Retry PDF email delivery
        </button>
      )}
      {!clientSigned && status !== "withdrawn" && (
        <details style={{ marginTop: 15 }}>
          <summary>Withdraw an unsigned version</summary>
          <label className="wp-label">
            Reason
            <input
              className="wp-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button
            className="wp-button wp-button-secondary"
            disabled={pending || reason.trim().length < 5}
            onClick={() => run("withdraw")}
          >
            Withdraw this version
          </button>
        </details>
      )}
      {message && (
        <p className="wp-message" role="status">
          {message}
        </p>
      )}
    </>
  );
}
