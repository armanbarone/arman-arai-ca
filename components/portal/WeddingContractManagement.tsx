"use client";
import Link from "next/link";
import type { Booking } from "@/lib/portal/types";
import { weddingData } from "@/lib/portal/wedding";
import { useWeddingBooking } from "./WeddingPreviewProvider";
import { Card, StatusPill, ghostButtonCls } from "./Shell";
import WeddingDocumentAdminActions from "./WeddingDocumentAdminActions";
import WeddingDeletedDrafts from "./WeddingDeletedDrafts";
export default function WeddingContractManagement({
  booking: initial,
  preview = false,
}: {
  booking: Booking;
  preview?: boolean;
}) {
  const b = useWeddingBooking(initial, preview),
    base = preview ? "/portal/preview/admin" : `/admin/bookings/${b.ref}`;
  const documents = weddingData(b).documents.filter(
    (d) => d.templateKey === "agreement" && !d.deletedAt,
  );
  return (
    <Card className="wp-contract-management">
      <h2>Manage contract versions</h2>
      <p>
        Delete a saved draft, withdraw an issued version before either partner
        signs, or review the signed copy.
      </p>
      {!documents.some(
        (d) => !["withdrawn", "superseded"].includes(d.status),
      ) && (
        <p>
          No active agreement. Use Prepare a new draft below, or restore a
          deleted draft.
        </p>
      )}
      {documents.map((d) => (
        <div className="wp-record-row" key={d.id}>
          <div className="wp-doc-head">
            <h3>Service agreement · Version {d.version}</h3>
            <StatusPill status={d.status} />
          </div>
          <div className="wp-toolbar">
            <Link
              className={ghostButtonCls}
              href={
                d.status === "draft"
                  ? `${base}/documents/${preview ? "agreement" : "edit/agreement"}`
                  : preview
                    ? `${base}/documents/version/${d.id}`
                    : `/portal/${b.ref}/documents/${d.id}`
              }
            >
              {d.status === "draft" ? "Edit draft" : "Review stored version"} →
            </Link>
            <WeddingDocumentAdminActions
              bookingRef={b.ref}
              documentId={d.id}
              status={d.status}
              deliveryError={d.deliveryError}
              clientSigned={d.signatures.some((s) => s.party === "client")}
              expectedUpdatedAt={b.updatedAt}
              preview={preview}
            />
          </div>
          {d.signatures.some((s) => s.party === "client") && (
            <p>
              A partner has signed this version. The signed record is retained;
              archiving the wedding closes access without erasing the agreement.
            </p>
          )}
        </div>
      ))}
      {!documents.some((d) =>
        ["draft", "issued", "partial", "executed"].includes(d.status),
      ) && (
        <div className="wp-toolbar">
          <Link
            className={ghostButtonCls}
            href={`${base}/documents/${preview ? "agreement" : "edit/agreement"}`}
          >
            Prepare a new draft →
          </Link>
        </div>
      )}
      {!preview && documents.some((d) => d.status === "executed") && (
        <div className="wp-toolbar">
          <Link className={ghostButtonCls} href={`${base}/amend`}>
            Prepare a signed change order →
          </Link>
        </div>
      )}
      <WeddingDeletedDrafts
        booking={b}
        templateKey="agreement"
        preview={preview}
      />
    </Card>
  );
}
