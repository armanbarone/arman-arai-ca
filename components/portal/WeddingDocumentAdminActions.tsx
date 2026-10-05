"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  retryWeddingDelivery,
  withdrawWeddingDocument,
} from "@/app/portal/wedding-actions";
import {
  deleteWeddingDraft,
  restoreWeddingDraft,
} from "@/app/admin/document-actions";
import { changeDraftRemoval } from "@/lib/portal/document-lifecycle";
import { useWeddingPreview } from "./WeddingPreviewProvider";
export default function WeddingDocumentAdminActions({
  bookingRef,
  documentId,
  status,
  deliveryError,
  clientSigned,
  expectedUpdatedAt,
  deletedAt,
  preview = false,
}: {
  bookingRef: string;
  documentId: string;
  status: string;
  deliveryError?: string;
  clientSigned: boolean;
  expectedUpdatedAt: string;
  deletedAt?: string;
  preview?: boolean;
}) {
  const context = useWeddingPreview(),
    router = useRouter(),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [confirmDelete, setConfirmDelete] = useState(false),
    [pending, start] = useTransition();
  const run = (mode: string) =>
    start(async () => {
      setMessage("");
      setError("");
      if (preview && context) {
        try {
          if (mode === "delete" || mode === "restore") {
            changeDraftRemoval(
              structuredClone(context.booking),
              documentId,
              "Studio preview",
              mode === "restore",
            );
            context.update((b) =>
              changeDraftRemoval(
                b,
                documentId,
                "Studio preview",
                mode === "restore",
              ),
            );
            setMessage(
              mode === "restore"
                ? "Practice draft restored."
                : "Practice draft deleted. Restore it from Deleted drafts.",
            );
          } else if (mode === "withdraw") {
            context.update((b) => {
              const d = b.wedding!.documents.find((d) => d.id === documentId)!;
              if (d.signatures.some((s) => s.party === "client"))
                throw Error("A partner has signed this version.");
              d.status = "withdrawn";
              if (d.templateKey === "agreement") b.status = "draft";
            });
            setMessage(
              "Practice version withdrawn. Clients can no longer sign it.",
            );
          } else setMessage("Practice preview: no real PDF email is sent.");
          setConfirmDelete(false);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Please try again.");
        }
        return;
      }
      try {
        const r =
          mode === "delete"
            ? await deleteWeddingDraft(
                bookingRef,
                documentId,
                expectedUpdatedAt,
              )
            : mode === "restore"
              ? await restoreWeddingDraft(
                  bookingRef,
                  documentId,
                  expectedUpdatedAt,
                )
              : mode === "retry"
                ? await retryWeddingDelivery(bookingRef, documentId)
                : await withdrawWeddingDocument(bookingRef, documentId, reason);
        if (r.ok) {
          setMessage(r.message || "Updated");
          setConfirmDelete(false);
          router.refresh();
        } else setError(r.error);
      } catch {
        setError(
          "The connection was interrupted. Reload to check this version’s status before trying again.",
        );
      }
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
      {deletedAt ? (
        <button
          className="wp-button wp-button-secondary"
          disabled={pending}
          onClick={() => run("restore")}
        >
          Restore draft
        </button>
      ) : status === "draft" && !clientSigned ? (
        <>
          {!confirmDelete ? (
            <button
              className="wp-button wp-button-danger"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              Delete draft
            </button>
          ) : (
            <div
              className="wp-message"
              role="group"
              aria-label="Confirm draft deletion"
            >
              <p>
                Delete this saved draft? It will move to Deleted drafts, where
                you can restore it. The couple’s details and other documents
                stay in place.
              </p>
              <div className="wp-toolbar">
                <button
                  className="wp-button wp-button-danger"
                  disabled={pending}
                  onClick={() => run("delete")}
                >
                  {pending ? "Deleting…" : "Confirm delete draft"}
                </button>
                <button
                  className="wp-button wp-button-secondary"
                  disabled={pending}
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep draft
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
      {!clientSigned &&
        ["issued", "partial"].includes(status) &&
        !deletedAt && (
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
      {error && (
        <p className="wp-message wp-message-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
