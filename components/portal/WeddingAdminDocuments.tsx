"use client";
import Link from "next/link";
import type { Booking } from "@/lib/portal/types";
import { WEDDING_TEMPLATES, weddingData } from "@/lib/portal/wedding";
import { Card, Eyebrow, StatusPill, buttonCls } from "./Shell";
import { useWeddingBooking } from "./WeddingPreviewProvider";
import WeddingDocumentAdminActions from "./WeddingDocumentAdminActions";
import WeddingDeletedDrafts from "./WeddingDeletedDrafts";
export default function WeddingAdminDocuments({
  booking: initial,
  preview = false,
}: {
  booking: Booking;
  preview?: boolean;
}) {
  const b = useWeddingBooking(initial, preview),
    w = weddingData(b),
    base = preview ? "/portal/preview/admin" : `/admin/bookings/${b.ref}`;
  return (
    <>
      <Link className="wp-back" href={preview ? `${base}/booking` : base}>
        ← Wedding workspace
      </Link>
      <Eyebrow>{b.ref} · Native wedding document system</Eyebrow>
      <h1>Prepare, review, publish.</h1>
      <p className="wp-lead">
        Complete documents from the wedding pack. Drafts stay private until you
        publish them. The couple completes their planning forms in their portal.
      </p>
      <div className="wp-toolbar">
        <Link href={preview ? `${base}/library` : "/admin/library"}>
          Full library: 21 documents + workbook →
        </Link>
        <Link href={`${base}/agreement`}>
          Manage contract & couple’s details →
        </Link>
        <Link href={`${base}/settings`}>Customize collection and quote →</Link>
        <Link href={preview ? `${base}/guide` : "/admin/guide"}>
          How to use the dashboard →
        </Link>
      </div>
      <div className="wp-message">
        Proposal acceptance → completed agreement → each partner signs → signed
        PDF to both email addresses. Crew, vendor and guest records stay in the
        studio.
      </div>
      {[
        "Booking",
        "Planning",
        "Changes",
        "Wedding day",
        "Delivery",
        "Studio",
      ].map((stage) => (
        <section key={stage} className="wp-doc-section">
          <h2>{stage}</h2>
          <div className="wp-doc-grid">
            {WEDDING_TEMPLATES.filter((t) => t.stage === stage).map((t) => {
              const docs = w.documents.filter(
                  (d) => d.templateKey === t.key && !d.deletedAt,
                ),
                form = ["form", "request"].includes(t.action);
              const href =
                t.key === "invoice"
                  ? `${base}/payments`
                  : form
                    ? `${base}/planning/${t.key}`
                    : t.key === "change" &&
                        !docs.some(
                          (d) => d.status === "draft" && d.amendment,
                        ) &&
                        !preview
                      ? `${base}/amend`
                      : `${base}/documents/${preview ? t.key : `edit/${t.key}`}`;
              return (
                <Card key={t.key} className="wp-doc-card">
                  <div className="wp-doc-head">
                    <h3>{t.title}</h3>
                    <span className="wp-badge">
                      {t.audience === "client" ? "Client" : "Studio only"}
                    </span>
                  </div>
                  <p>
                    {t.action === "internal"
                      ? "Private editable studio record"
                      : form
                        ? "Couple completes · Studio reviews"
                        : t.companySigns
                          ? "Company + couple sign"
                          : t.action === "individual"
                            ? "Individual choices"
                            : "Client record"}
                  </p>
                  <Link className={buttonCls} href={href}>
                    {t.key === "invoice"
                      ? "Issue invoice & request payment"
                      : form
                        ? "Open client answers"
                        : t.key === "change"
                          ? "Prepare change order"
                          : t.action === "internal"
                            ? "Open studio record"
                            : "Prepare document"}{" "}
                    →
                  </Link>
                  {docs.map((d) => (
                    <div key={d.id} className="wp-record-row">
                      <p>
                        Version {d.version} · <StatusPill status={d.status} />
                      </p>
                      {d.status !== "draft" && (
                        <Link
                          className="wp-back"
                          href={
                            preview
                              ? `${base}/documents/version/${d.id}`
                              : `/portal/${b.ref}/documents/${d.id}`
                          }
                        >
                          Review stored version →
                        </Link>
                      )}
                      <WeddingDocumentAdminActions
                        bookingRef={b.ref}
                        documentId={d.id}
                        status={d.status}
                        deliveryError={d.deliveryError}
                        clientSigned={d.signatures.some(
                          (s) => s.party === "client",
                        )}
                        expectedUpdatedAt={b.updatedAt}
                        preview={preview}
                      />
                    </div>
                  ))}
                </Card>
              );
            })}
          </div>
        </section>
      ))}
      <WeddingDeletedDrafts booking={b} preview={preview} />
    </>
  );
}
