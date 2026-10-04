import Link from "next/link";
import type { Booking } from "@/lib/portal/types";
import { visibleDocuments, templateFor } from "@/lib/portal/wedding";
import { Card, StatusPill, Eyebrow, buttonCls } from "./Shell";
export default function WeddingDocuments({
  booking: b,
  email,
  preview = false,
}: {
  booking: Booking;
  email: string;
  preview?: boolean;
}) {
  const docs = visibleDocuments(b),
    base = preview ? "/portal/preview" : `/portal/${b.ref}`;
  return (
    <>
      <Eyebrow>Your wedding record</Eyebrow>
      <h1>Agreements & approvals</h1>
      <p className="wp-lead">
        Review the details, sign with your own email, and keep a copy. Each
        partner signs separately.
      </p>
      <div className="wp-message">
        After all required signatures are recorded, the completed PDF is emailed
        to both partners and saved here.
      </div>
      {!docs.length && (
        <div className="wp-empty">
          <h2>Your documents are being prepared</h2>
          <p>
            You will receive an email when a document is ready. Drafts stay with
            the studio until they are complete.
          </p>
        </div>
      )}
      {["Booking", "Planning", "Changes", "Wedding day", "Delivery"].map(
        (stage) => {
          const list = docs.filter(
            (d) => templateFor(d.templateKey).stage === stage,
          );
          return list.length ? (
            <section className="wp-doc-section" key={stage}>
              <h2>{stage}</h2>
              <div className="wp-doc-grid">
                {list.map((d) => {
                  const mine = d.signatures.some(
                      (s) => s.party === "client" && s.email === email,
                    ),
                    required =
                      ["issued", "partial"].includes(d.status) &&
                      d.requiredEmails.includes(email),
                    left = d.requiredEmails.filter(
                      (e) => !d.signatures.some((s) => s.email === e),
                    );
                  return (
                    <Card className="wp-doc-card" key={d.id}>
                      <div className="wp-doc-head">
                        <h3>{d.title}</h3>
                        <StatusPill status={d.status} />
                      </div>
                      <p>
                        Version {d.version} ·{" "}
                        {d.requiredEmails.length
                          ? `${d.requiredEmails.length - left.length} of ${d.requiredEmails.length} partners signed`
                          : "For your records"}
                      </p>
                      <p>
                        {["withdrawn", "superseded"].includes(d.status)
                          ? "Historical version. This document can no longer be signed."
                          : mine
                            ? left.length
                              ? "You have signed. Waiting for your partner."
                              : "Your completed copy is ready."
                            : required
                              ? "Read the completed document and add your signature."
                              : "Review the details at any time."}
                      </p>
                      <Link
                        className={buttonCls}
                        href={`${base}/documents/${d.id}`}
                      >
                        {mine || !required ? "View document" : "Review & sign"}{" "}
                        →
                      </Link>
                      {d.status === "executed" && !preview && (
                        <a
                          className="wp-back"
                          href={`/api/portal/wedding-pdf?ref=${b.ref}&id=${d.id}`}
                        >
                          Download signed PDF
                        </a>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          ) : null;
        },
      )}
    </>
  );
}
