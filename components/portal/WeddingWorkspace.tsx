import Link from "next/link";
import { Card, Eyebrow, StatusPill, buttonCls, ghostButtonCls } from "./Shell";
import { formatCad, formatDate } from "@/lib/portal/money";
import { weddingData, templateFor, resolveBlocks } from "@/lib/portal/wedding";
import type { Booking } from "@/lib/portal/types";
import { studioRow } from "@/lib/portal/studio";
import WeddingFormReview from "./WeddingFormReview";
import WeddingDeliveryEditor from "./WeddingDeliveryEditor";
export default function WeddingWorkspace({
  booking: b,
  preview = false,
}: {
  booking: Booking;
  preview?: boolean;
}) {
  const w = weddingData(b),
    summary = studioRow(b),
    base = preview ? "/portal/preview/admin" : `/admin/bookings/${b.ref}`;
  return (
    <>
      <Link
        className="wp-back"
        href={preview ? "/portal/preview/admin" : "/admin"}
      >
        ← All weddings
      </Link>
      <Eyebrow>{b.ref} · Wedding workspace</Eyebrow>
      <div className="wp-heading-row">
        <div>
          <h1>{summary.names}</h1>
          <p className="wp-lead">
            {formatDate(b.event.date)} · {b.event.location}
          </p>
        </div>
        <StatusPill status={b.status} />
      </div>
      <div className="wp-card wp-action-hero">
        <Eyebrow>Studio action</Eyebrow>
        <h2>{summary.action}</h2>
        <p>{summary.waiting}</p>
        <Link
          className={buttonCls}
          href={
            summary.action.includes("payment")
              ? `${base}/payments`
              : summary.action.includes("answers")
                ? "#client-answers"
                : `${base}/documents`
          }
        >
          Open the next step →
        </Link>
      </div>
      <div className="wp-tabs">
        <Link href={`${base}/documents`}>Documents & signatures</Link>
        <Link href={`${base}/payments`}>Payments</Link>
        <Link href="#client-answers">Client answers</Link>
        {!preview &&
          w.documents.some(
            (d) => d.templateKey === "agreement" && d.status === "executed",
          ) && <Link href={`${base}/amend`}>Prepare change order</Link>}
        <Link href={`${base}/operations`}>Operations</Link>
        {!preview && (
          <Link href={`${base}/settings`}>Booking details & access</Link>
        )}
        <Link href={preview ? "/portal/preview" : `/portal/${b.ref}`}>
          Client view ↗
        </Link>
      </div>
      <div className="wp-stats">
        <Card className="wp-stat">
          <Eyebrow>Contract total</Eyebrow>
          <strong>{formatCad(b.totals.totalCents)}</strong>
          <p>Including recorded taxes</p>
        </Card>
        <Card className="wp-stat">
          <Eyebrow>Received</Eyebrow>
          <strong>{formatCad(summary.paid)}</strong>
          <p>Confirmed payments only</p>
        </Card>
        <Card className="wp-stat">
          <Eyebrow>Balance</Eyebrow>
          <strong>{formatCad(summary.total - summary.paid)}</strong>
          <p>See exact payment dates</p>
        </Card>
        <Card className="wp-stat">
          <Eyebrow>Client records</Eyebrow>
          <strong>
            {w.documents.filter((d) => d.status === "executed").length}
          </strong>
          <p>Completed approvals</p>
        </Card>
      </div>
      <section id="client-answers" className="wp-doc-section">
        <h2>Client answers</h2>
        <p className="wp-muted">
          Submitted planning answers remain private to this wedding and the
          studio.
        </p>
        {!Object.keys(w.forms).length ? (
          <Card>
            <h3>No forms submitted yet</h3>
            <p>
              The couple can save discovery, engagement and family planning as
              they go.
            </p>
          </Card>
        ) : (
          Object.entries(w.forms).map(([key, f]) => {
            const t = templateFor(key);
            return (
              <Card key={key}>
                <div className="wp-doc-head">
                  <h3>{t.title}</h3>
                  <StatusPill status={f.status} />
                </div>
                <p className="wp-muted">
                  Saved {new Date(f.updatedAt).toLocaleString("en-CA")} ·{" "}
                  {f.actor}
                </p>
                <details className="wp-form-section">
                  <summary>Read the answers</summary>
                  <div className="wp-form-body">
                    {resolveBlocks(t, f.fields).map((block, i) =>
                      block.kind === "table" ? (
                        <div className="wp-table-wrap" key={i}>
                          <table className="wp-table">
                            <tbody>
                              {block.rows.map((r, j) => (
                                <tr key={j}>
                                  {r.map((c, k) => (
                                    <td key={k}>{c.text}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : block.kind === "h" ? (
                        <h3 key={i}>{block.text}</h3>
                      ) : block.kind === "p" ? (
                        <p
                          key={i}
                          style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}
                        >
                          {block.text}
                        </p>
                      ) : null,
                    )}
                  </div>
                </details>
                {!preview && f.status === "submitted" && (
                  <WeddingFormReview bookingRef={b.ref} formKey={key} />
                )}
              </Card>
            );
          })
        )}
      </section>
      <section className="wp-doc-section">
        <h2>Gallery & film delivery</h2>
        {preview ? (
          <Card>
            <p>
              Secure gallery links, film links and delivery dates are managed
              here.
            </p>
            <Link className={ghostButtonCls} href="/portal/preview/delivery">
              See client delivery screen →
            </Link>
          </Card>
        ) : (
          <WeddingDeliveryEditor
            bookingRef={b.ref}
            initial={{
              galleryUrl: w.galleryUrl || "",
              filmUrl: w.filmUrl || "",
              galleryExpires: w.galleryExpires || "",
              deliveryDate: w.deliveryDate || "",
            }}
          />
        )}
      </section>
      <section className="wp-doc-section">
        <h2>Studio notes</h2>
        <Card>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {b.internalNotes || "No internal notes recorded."}
          </p>
        </Card>
      </section>
      <details className="wp-form-section">
        <summary>Activity & audit trail</summary>
        <div className="wp-form-body">
          {[...b.events].reverse().map((e, i) => (
            <p key={i} style={{ marginBottom: 12 }}>
              {new Date(e.at).toLocaleString("en-CA")} ·{" "}
              {e.type.replace(/_/g, " ")} · {e.actor}
              {e.detail && ` · ${JSON.stringify(e.detail)}`}
            </p>
          ))}
        </div>
      </details>
    </>
  );
}
