"use client";
import Link from "next/link";
import type { Booking } from "@/lib/portal/types";
import { visibleDocuments, WEDDING_TEMPLATES } from "@/lib/portal/wedding";
import { Card, StatusPill, Eyebrow, buttonCls } from "./Shell";
import { useWeddingBooking, useWeddingPreview } from "./WeddingPreviewProvider";
import { workflowIsVisible } from "@/lib/portal/portal-controls";
const purpose: Record<string, string> = {
  agreement:
    "Your personal details, venues, collection, terms, initials and signatures.",
  proposal: "The exact collection, inclusions and quote you both approve.",
  invoice: "Your agreed prices, taxes and payment dates.",
  privacy: "Your individual privacy and publicity choices.",
  discovery: "Your story, priorities and the wedding you are planning.",
  creative: "The agreed visual direction, informed by your shared moodboard.",
  engagement: "Locations, timing and plans for your engagement session.",
  family: "Family groups, VIPs and the people who matter most.",
  venues: "Venue addresses, supplier details, permissions and restrictions.",
  request: "Request a cancellation or a change to your wedding date.",
  change: "Review and sign an agreed revision to the contract.",
  dossier: "Confirm your complete wedding plan before the day.",
  day: "Your timeline, contacts and coverage at a glance.",
  delivery: "Confirm your gallery, films and download instructions.",
  album: "Review your album proof and approve it for printing.",
};
export default function WeddingDocuments({
  booking: initial,
  email,
  preview = false,
}: {
  booking: Booking;
  email: string;
  preview?: boolean;
}) {
  const b = useWeddingBooking(initial, preview),
    context = useWeddingPreview(),
    who = preview ? context?.email || email : email;
  const docs = visibleDocuments(b),
    base = preview ? "/portal/preview" : `/portal/${b.ref}`;
  return (
    <>
      <Eyebrow>Your complete wedding record</Eyebrow>
      <h1>Agreements & approvals</h1>
      <p className="wp-lead">
        Every stage is here, from your first details to your final album. Each
        partner initials and signs using their own account.
      </p>
      <Card className="wp-action-hero">
        <div>
          <Eyebrow>Start here</Eyebrow>
          <h2>Your contract details & collection</h2>
          <p>
            Enter your names, addresses, wedding venues and timings. Choose a
            collection and tell Arman what you would like to customize.
          </p>
        </div>
        <Link className={buttonCls} href={`${base}/agreement`}>
          Complete your details →
        </Link>
      </Card>
      <div className="wp-message">
        Your studio has selected the planning workflows for this wedding. After
        every required signature, your completed PDF is saved here and emailed
        to both partners.
      </div>
      <div className="wp-toolbar">
        <Link href={`${base}/moodboard`}>Your people & moodboard →</Link>
        {preview && (
          <Link href="/portal/preview/admin/documents">
            Explore the complete studio library →
          </Link>
        )}
      </div>
      {["Booking", "Planning", "Changes", "Wedding day", "Delivery"].map(
        (stage) => (
          <section className="wp-doc-section" key={stage}>
            <h2>{stage}</h2>
            <div className="wp-doc-grid">
              {WEDDING_TEMPLATES.filter(
                (t) =>
                  t.audience === "client" &&
                  t.stage === stage &&
                  workflowIsVisible(b, t.key),
              ).map((t) => {
                const versions = docs.filter((d) => d.templateKey === t.key),
                  d = versions.at(-1),
                  f = b.wedding?.forms[t.key],
                  form = ["form", "request"].includes(t.action);
                const mine = d?.signatures.some(
                  (s) => s.party === "client" && s.email === who,
                );
                const details =
                  t.key === "agreement" &&
                  b.wedding?.intake?.status !== "approved";
                const href =
                  t.key === "invoice"
                    ? `${base}/payments`
                    : form
                      ? `${base}/planning/${t.key}`
                      : details
                        ? `${base}/agreement`
                        : d
                          ? `${base}/documents/${d.id}`
                          : preview
                            ? `${base}/documents/template/${t.key}`
                            : null;
                return (
                  <Card key={t.key} className="wp-doc-card">
                    <div className="wp-doc-head">
                      <h3>{t.title}</h3>
                      {details ? (
                        <span className="wp-badge">Details needed</span>
                      ) : d ? (
                        <StatusPill status={d.status} />
                      ) : (
                        <span className="wp-badge">
                          {f?.status ||
                            (form ? "Ready to complete" : "Not issued yet")}
                        </span>
                      )}
                    </div>
                    <span className="wp-eyebrow">
                      Document {t.source.slice(0, 2)} ·{" "}
                      {form ? "You complete" : "Studio prepares"}
                    </span>
                    <p>{purpose[t.key]}</p>
                    {d && (
                      <p>
                        Version {d.version} ·{" "}
                        {details
                          ? "Complete your details before initialing and signing"
                          : mine
                            ? "Your signature recorded"
                            : d.requiredEmails.includes(who)
                              ? "Your initials and signature required"
                              : "For your records"}
                      </p>
                    )}
                    {href ? (
                      <Link className={buttonCls} href={href}>
                        {form
                          ? f
                            ? "Open saved answers"
                            : "Start form"
                          : details
                            ? "Enter your details"
                            : d
                              ? mine
                                ? "View your copy"
                                : "Review document"
                              : "Explore sample workflow"}{" "}
                        →
                      </Link>
                    ) : (
                      <p className="wp-muted">
                        Arman will publish this record here when this stage is
                        ready.
                      </p>
                    )}
                    {versions.slice(0, -1).map((v) => (
                      <Link key={v.id} href={`${base}/documents/${v.id}`}>
                        Earlier version {v.version} · {v.status}
                      </Link>
                    ))}
                  </Card>
                );
              })}
            </div>
          </section>
        ),
      )}
    </>
  );
}
