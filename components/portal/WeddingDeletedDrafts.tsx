"use client";
import type { Booking } from "@/lib/portal/types";
import { weddingData } from "@/lib/portal/wedding";
import { useWeddingBooking } from "./WeddingPreviewProvider";
import WeddingDocumentAdminActions from "./WeddingDocumentAdminActions";
export default function WeddingDeletedDrafts({
  booking: initial,
  templateKey,
  preview = false,
}: {
  booking: Booking;
  templateKey?: string;
  preview?: boolean;
}) {
  const booking = useWeddingBooking(initial, preview);
  const deleted = weddingData(booking).documents.filter(
    (d) => d.deletedAt && (!templateKey || d.templateKey === templateKey),
  );
  if (!deleted.length) return null;
  return (
    <details className="wp-form-section" id="deleted-drafts">
      <summary>Deleted drafts ({deleted.length})</summary>
      <div className="wp-form-body">
        <p>
          These drafts are private to the studio. Restore a draft to edit it
          again; remove any newer draft of the same document first.
        </p>
        {deleted.map((d) => (
          <div key={d.id} className="wp-record-row">
            <h3>
              {d.title} · Version {d.version}
            </h3>
            <WeddingDocumentAdminActions
              bookingRef={booking.ref}
              documentId={d.id}
              status={d.status}
              clientSigned={false}
              deletedAt={d.deletedAt}
              expectedUpdatedAt={booking.updatedAt}
              preview={preview}
            />
          </div>
        ))}
      </div>
    </details>
  );
}
