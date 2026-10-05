import type { Booking } from "./types";
import { weddingData } from "./wedding";

/** Draft removal is recoverable and never rewrites an issued or signed record. */
export function changeDraftRemoval(
  booking: Booking,
  id: string,
  actor: string,
  restore: boolean,
) {
  const documents = weddingData(booking).documents;
  const document = documents.find((d) => d.id === id);
  if (!document)
    throw Error("This draft was not found. Reload the document list.");
  if (document.signatures.length)
    throw Error(
      "Signed records cannot be deleted. Keep the signed copy and use a change order.",
    );
  if (restore) {
    if (!document.deletedAt || document.status !== "withdrawn")
      throw Error("This document is not a deleted draft.");
    if (
      documents.some(
        (d) =>
          d.id !== id &&
          d.templateKey === document.templateKey &&
          d.status === "draft",
      )
    )
      throw Error(
        "Another draft already exists. Delete that draft before restoring this version.",
      );
    delete document.deletedAt;
    delete document.deletedBy;
    document.status = "draft";
  } else {
    if (document.status !== "draft" || document.deletedAt)
      throw Error(
        "Only a saved draft can be deleted. Withdraw an issued unsigned version instead.",
      );
    document.status = "withdrawn";
    document.deletedAt = new Date().toISOString();
    document.deletedBy = actor;
  }
  booking.events.push({
    at: new Date().toISOString(),
    type: restore ? "wedding_draft_restored" : "wedding_draft_deleted",
    actor,
    detail: {
      id,
      templateKey: document.templateKey,
      version: document.version,
    },
  });
}
