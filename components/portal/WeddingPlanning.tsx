"use client";
import { useWeddingBooking } from "./WeddingPreviewProvider";
import Link from "next/link";
import type { Booking } from "@/lib/portal/types";
import { workflowIsVisible } from "@/lib/portal/portal-controls";
import ClientPlanningChecklist from "./ClientPlanningChecklist";
import {
  WEDDING_TEMPLATES,
  weddingData,
  visibleDocuments,
} from "@/lib/portal/wedding";
import { Card, Eyebrow, StatusPill, buttonCls } from "./Shell";
export default function WeddingPlanning({
  booking: initial,
  preview = false,
}: {
  booking: Booking;
  preview?: boolean;
}) {
  const b = useWeddingBooking(initial, preview);
  const w = weddingData(b),
    base = preview ? "/portal/preview" : `/portal/${b.ref}`;
  return (
    <>
      <Eyebrow>The details that matter</Eyebrow>
      <h1>Wedding planning</h1>
      <p className="wp-lead">
        Start with your story. Save your answers as you go, then send them to me
        when you’re ready.
      </p>
      <Card className="wp-action-hero">
        <div>
          <h2>Your people & shared moodboard</h2>
          <p>
            Add your profile photos, inspiration images and creative direction.
          </p>
        </div>
        <Link className={buttonCls} href={`${base}/moodboard`}>
          Build your moodboard →
        </Link>
      </Card>
      <div className="wp-doc-section" style={{ marginTop: 30 }}>
        <ClientPlanningChecklist booking={b} preview={preview} />
        <div className="wp-doc-grid">
          {WEDDING_TEMPLATES.filter(
            (t) =>
              ["form", "request"].includes(t.action) &&
              workflowIsVisible(b, t.key),
          ).map((t) => (
            <Card key={t.key} className="wp-doc-card">
              <div className="wp-doc-head">
                <h3>{t.title}</h3>
                <StatusPill status={w.forms[t.key]?.status || "todo"} />
              </div>
              <p>
                {t.key === "discovery"
                  ? "Your story, traditions, timing and what matters most."
                  : t.key === "family"
                    ? "VIPs, group combinations and a person to gather everyone."
                    : t.key === "engagement"
                      ? "Location, wardrobe and timing for an included or separately booked session."
                      : "Record a cancellation or proposed date change. An email notice is also valid; this form is optional."}
              </p>
              <p>
                You complete this ·{" "}
                {w.forms[t.key]?.updatedAt
                  ? "Saved answers available"
                  : "Save and return at any time"}
              </p>
              <Link href={`${base}/planning/${t.key}`} className={buttonCls}>
                {w.forms[t.key] ? "Continue" : "Start"} →
              </Link>
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <div className="wp-section-title">
          <h2>With the studio</h2>
        </div>
        <p>
          I prepare your creative brief, permissions, final timeline and wedding
          day summary. When a completed plan needs your approval, it will appear
          in Agreements & approvals.
        </p>
        <div className="wp-toolbar">
          {visibleDocuments(b)
            .filter((d) =>
              ["creative", "venues", "dossier", "day"].includes(d.templateKey),
            )
            .map((d) => (
              <Link
                key={d.id}
                className="wp-button wp-button-secondary"
                href={`${base}/documents/${d.id}`}
              >
                {d.title} →
              </Link>
            ))}
        </div>
      </Card>
    </>
  );
}
