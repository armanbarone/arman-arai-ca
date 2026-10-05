"use client";
import Link from "next/link";
import WeddingMoodboard from "./WeddingMoodboard";
import { useWeddingBooking } from "./WeddingPreviewProvider";
import { Card, Eyebrow, buttonCls, ghostButtonCls, StatusPill } from "./Shell";
import {
  nextActions,
  visibleDocuments,
  weddingData,
} from "@/lib/portal/wedding";
import { formatCad, formatDate, todayInBusinessTz } from "@/lib/portal/money";
import type { Booking } from "@/lib/portal/types";

export default function WeddingDashboard({
  booking: initial,
  email,
  preview = false,
}: {
  booking: Booking;
  email: string;
  preview?: boolean;
}) {
  const b = useWeddingBooking(initial, preview);
  const base = preview ? "/portal/preview" : `/portal/${b.ref}`,
    tasks = nextActions(b, email, base),
    docs = visibleDocuments(b),
    data = weddingData(b);
  const names = b.clients
      .map((c) => c.preferredName || c.legalName.split(" ")[0])
      .join(" & "),
    paid = b.schedule.reduce((s, i) => s + i.paidCents, 0),
    pay = b.schedule.find(
      (i) =>
        !["paid", "void", "refunded"].includes(i.status) &&
        i.totalCents > i.paidCents,
    );
  const days = Math.max(
    0,
    Math.round(
      (Date.parse(b.event.date + "T12:00:00Z") -
        Date.parse(todayInBusinessTz() + "T12:00:00Z")) /
        86400000,
    ),
  );
  const reserved = ["booked", "in_planning", "completed"].includes(b.status),
    signed = docs.some(
      (d) => d.templateKey === "agreement" && d.status === "executed",
    );
  const stages = [
    {
      title: "Make it official",
      detail: reserved
        ? "Agreement signed. Your date is reserved."
        : signed
          ? "Agreement signed. Booking payment is next."
          : "Review your agreement, then reserve your date.",
      done: reserved,
    },
    {
      title: "Plan your wedding",
      detail: "Tell me about your people, priorities and plans.",
      done: !!data.forms.discovery && data.forms.discovery.status !== "draft",
    },
    {
      title: "Confirm the final details",
      detail: "Review your timeline and wedding day plan.",
      done: docs.some(
        (d) => d.templateKey === "dossier" && d.status === "executed",
      ),
    },
    {
      title: "Enjoy your photographs",
      detail: "Your contracted gallery and deliverables arrive here.",
      done: !!data.deliveryDate,
    },
  ];
  const first = tasks[0];
  return (
    <>
      <section className="wp-hero">
        <div>
          <Eyebrow>
            {names} · {b.packageName}
          </Eyebrow>
          <h1>
            Your wedding,
            <br />
            in one place.
          </h1>
          <p className="wp-lead">
            The next steps, the details, and everything you’ve agreed.
          </p>
          <p className="wp-wedding-tag">
            {formatDate(b.event.date)} · {b.event.location} · {b.ref}
          </p>
        </div>
        <div className="wp-date-card">
          <strong>{days}</strong>
          <span>days until your wedding</span>
        </div>
      </section>
      <Card className="wp-action-hero">
        <div>
          <span className="wp-action-number">
            {b.status === "cancelled"
              ? "BOOKING CANCELLED"
              : first
                ? "YOUR NEXT STEP"
                : "YOU’RE UP TO DATE"}
          </span>
          <h2>
            {b.status === "cancelled"
              ? "Your booking is cancelled"
              : first?.title ||
                (b.status === "draft"
                  ? "Your proposal is being prepared"
                  : "Nothing needs your attention today")}
          </h2>
          <p>
            {b.status === "cancelled"
              ? "Your previous documents remain available for your records. Contact the studio about any remaining payment or refund arrangements."
              : first?.detail ||
                (b.status === "draft"
                  ? "I’m preparing the details of your collection. You’ll receive an email when it’s ready to review."
                  : "I’ll let you know when there is something to review. Your documents and plans are always available here.")}
          </p>
        </div>
        {first && (
          <Link className={buttonCls} href={first.href}>
            {first.kind === "Signature"
              ? "Review document"
              : first.kind === "Payment"
                ? "View payment details"
                : "Get started"}{" "}
            <span aria-hidden>→</span>
          </Link>
        )}
      </Card>
      <div className="wp-stats">
        <div className="wp-stat">
          <span>Your wedding date</span>
          <strong>
            {b.status === "cancelled"
              ? "Cancelled"
              : reserved
                ? "Reserved"
                : "Not reserved yet"}
          </strong>
          <small>
            {reserved
              ? "Signed agreement + booking payment"
              : "Agreement + booking payment needed"}
          </small>
        </div>
        <div className="wp-stat">
          <span>Payments received</span>
          <strong>{formatCad(paid)}</strong>
          <small>
            of {formatCad(b.totals.totalCents)} · CAD, including tax
          </small>
        </div>
        <div className="wp-stat">
          <span>Next payment</span>
          <strong>
            {pay ? formatCad(pay.totalCents - pay.paidCents) : "Paid in full"}
          </strong>
          <small>
            {pay ? `Due ${formatDate(pay.dueDate)}` : "No balance remaining"}
          </small>
        </div>
        <div className="wp-stat">
          <span>Waiting on you</span>
          <strong>
            {tasks.length} {tasks.length === 1 ? "step" : "steps"}
          </strong>
          <small>
            {tasks.length ? "Listed below, in order" : "You’re all caught up"}
          </small>
        </div>
      </div>
      <div className="wp-two-col">
        <Card>
          <div className="wp-section-title">
            <h2>Your to-do list</h2>
            <Link href={`${base}/documents`}>All documents</Link>
          </div>
          {tasks.length ? (
            tasks.map((t, i) => (
              <div key={t.href} className="wp-task">
                <span className="wp-task-icon" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="wp-task-copy">
                  <h3>{t.title}</h3>
                  <p>{t.detail}</p>
                  {t.due && <p>Due {formatDate(t.due)}</p>}
                </div>
                <Link href={t.href}>Open →</Link>
              </div>
            ))
          ) : (
            <p>
              No outstanding actions. You can still update your planning answers
              or ask me a question.
            </p>
          )}
        </Card>
        <Card>
          <div className="wp-section-title">
            <h2>From here to your wedding</h2>
          </div>
          {stages.map((s, i) => (
            <div
              key={s.title}
              className={`wp-stage ${s.done ? "done" : i === stages.findIndex((s) => !s.done) ? "current" : ""}`}
            >
              <span className="wp-stage-dot">{s.done ? "✓" : i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.detail}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <WeddingMoodboard booking={b} preview={preview} compact />
      <div className="wp-toolbar">
        <Link className={ghostButtonCls} href={`${base}/moodboard`}>
          Open your shared moodboard →
        </Link>
      </div>
      <div className="wp-contact">
        <div>
          <h3>Something doesn’t look right?</h3>
          <p>Ask me before signing. We can correct the details together.</p>
        </div>
        <a
          className={ghostButtonCls}
          href={`mailto:i@armanarai.com?subject=${encodeURIComponent("Wedding " + b.ref)}`}
        >
          Email Arman ↗
        </a>
      </div>
    </>
  );
}
