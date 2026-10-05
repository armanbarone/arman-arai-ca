import Link from "next/link";
import { WEDDING_TEMPLATES, type WeddingBlock } from "@/lib/portal/wedding";
import guide from "@/lib/portal/wedding-source-guide.json";
import { WeddingBlockView } from "./WeddingDocumentReader";
import { Card, Eyebrow, buttonCls } from "./Shell";
export default function WeddingLibrary({
  preview = false,
  bookingRef,
}: {
  preview?: boolean;
  bookingRef?: string;
}) {
  const base = preview
    ? "/portal/preview/admin"
    : bookingRef
      ? `/admin/bookings/${bookingRef}`
      : null;
  return (
    <>
      <Eyebrow>The complete source pack</Eyebrow>
      <h1>Wedding document library</h1>
      <p className="wp-lead">
        All 21 Word documents and the operations workbook, integrated as forms,
        approvals, signed records and studio tools.
      </p>
      <div className="wp-stats">
        <div className="wp-stat">
          <span>Client workflows</span>
          <strong>15</strong>
        </div>
        <div className="wp-stat">
          <span>Private studio records</span>
          <strong>5</strong>
        </div>
        <div className="wp-stat">
          <span>System guide</span>
          <strong>1</strong>
        </div>
        <div className="wp-stat">
          <span>Operations workbook</span>
          <strong>1</strong>
        </div>
      </div>
      <Card>
        <h2>00 · System guide</h2>
        <p>
          The complete guide from the supplied pack, including its workflow and
          document map.
        </p>
        <details className="wp-form-section">
          <summary>Read the integrated system guide</summary>
          <article className="wp-form-body wp-document-section">
            <WeddingBlockView blocks={guide.blocks as WeddingBlock[]} />
          </article>
        </details>
      </Card>
      {[
        "Booking",
        "Planning",
        "Changes",
        "Wedding day",
        "Delivery",
        "Studio",
      ].map((stage) => (
        <section className="wp-doc-section" key={stage}>
          <h2>{stage}</h2>
          <div className="wp-doc-grid">
            {WEDDING_TEMPLATES.filter((t) => t.stage === stage).map((t) => (
              <Card key={t.key} className="wp-doc-card">
                <div className="wp-doc-head">
                  <h3>
                    {t.source.slice(0, 2)} · {t.title}
                  </h3>
                  <span className="wp-badge">
                    {t.audience === "client"
                      ? "Client workflow"
                      : "Studio only"}
                  </span>
                </div>
                <p>{t.source.replace(/_/g, " ").replace(/\.docx$/, "")}</p>
                <p>
                  {["form", "request"].includes(t.action)
                    ? "The couple completes a native form; the studio reviews their answers."
                    : t.action === "internal"
                      ? "Private editable studio record."
                      : "Prepare the exact record, review it and issue it to the couple."}
                </p>
                {base ? (
                  <Link
                    className={buttonCls}
                    href={
                      t.key === "invoice"
                        ? `${base}/payments`
                        : ["form", "request"].includes(t.action)
                          ? preview
                            ? `${base}/planning/${t.key}`
                            : `${base}/planning/${t.key}`
                          : preview
                            ? `${base}/documents/${t.key}`
                            : `${base}/documents/edit/${t.key}`
                    }
                  >
                    Open workflow →
                  </Link>
                ) : (
                  <Link href="/admin">Choose a wedding →</Link>
                )}
              </Card>
            ))}
          </div>
        </section>
      ))}
      <Card className="wp-doc-section">
        <div id="workbook">
          <h2>21 · Operations workbook</h2>
          <p>
            The workbook's ten operating registers are editable in each wedding
            workspace: leads, document tracking, scope, payments, planning,
            vendors, crew, approvals, changes and delivery.
          </p>
          <Link
            className={buttonCls}
            href={base ? `${base}/operations` : "/admin"}
          >
            Open wedding operations →
          </Link>
        </div>
      </Card>
    </>
  );
}
