import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/portal/store";
import { WEDDING_TEMPLATES, weddingData } from "@/lib/portal/wedding";
import {
  Card,
  Eyebrow,
  StatusPill,
  buttonCls,
} from "@/components/portal/Shell";
import WeddingDocumentAdminActions from "@/components/portal/WeddingDocumentAdminActions";
export default async function AdminDocuments({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params,
    b = await getBooking(ref);
  if (!b) notFound();
  const w = weddingData(b);
  return (
    <>
      <Link className="wp-back" href={`/admin/bookings/${ref}`}>
        ← Wedding workspace
      </Link>
      <Eyebrow>{ref} · Native wedding document system</Eyebrow>
      <h1>Prepare, review, publish.</h1>
      <p className="wp-lead">
        Create completed documents from the wedding pack. Drafts stay private
        until you publish them. Client forms are completed in the couple’s
        portal.
      </p>
      <div className="wp-toolbar"><Link href="/admin/library">Full library: 21 documents + workbook →</Link><Link href={`/admin/bookings/${ref}/agreement`}>Review couple’s contract details →</Link><Link href={`/admin/bookings/${ref}/settings`}>Customize collection and quote →</Link></div>
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
              const docs = w.documents.filter((d) => d.templateKey === t.key);
              return (
                <Card key={t.key} className="wp-doc-card">
                  <div className="wp-doc-head">
                    <h3>{t.title}</h3>
                    <span className="wp-badge">
                      {t.audience === "client" ? "Client" : "Studio only"}
                    </span>
                  </div>
                  <p>
                    {t.source.replace(/_/g, " ").replace(/\.docx$/, "")} ·{" "}
                    {t.action === "form"
                      ? "Couple completes"
                      : t.companySigns
                        ? "Company + couple sign"
                        : t.action === "individual"
                          ? "Individual choices"
                          : t.action === "internal"
                            ? "Internal record"
                            : "Client record"}
                  </p>
                  <Link
                    className={buttonCls}
                    href={
                      ["form", "request"].includes(t.action)
                        ? `/admin/bookings/${ref}#client-answers`
                        : t.key === "change" &&
                            !docs.some(
                              (d) => d.status === "draft" && d.amendment,
                            )
                          ? `/admin/bookings/${ref}/amend`
                          : `/admin/bookings/${ref}/documents/edit/${t.key}`
                    }
                  >
                    {["form", "request"].includes(t.action)
                      ? "Review client answers"
                      : t.key === "change"
                        ? "Prepare change order"
                        : t.action === "internal"
                          ? "Open studio record"
                          : "Prepare document"}{" "}
                    →
                  </Link>
                  {docs.map((d) => (
                    <div
                      key={d.id}
                      style={{ borderTop: "1px solid var(--line)", paddingTop: 15 }}
                    >
                      <p>
                        Version {d.version} · <StatusPill status={d.status} />
                      </p>
                      {d.status !== "draft" && (
                        <Link
                          href={`/portal/${ref}/documents/${d.id}`}
                          className="wp-back"
                          style={{ marginTop: 10 }}
                        >
                          Review stored version
                        </Link>
                      )}
                      <WeddingDocumentAdminActions
                        bookingRef={ref}
                        documentId={d.id}
                        status={d.status}
                        deliveryError={d.deliveryError}
                        clientSigned={d.signatures.some(
                          (s) => s.party === "client",
                        )}
                      />
                    </div>
                  ))}
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
