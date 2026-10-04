import type { Booking } from "./types";
import { weddingData } from "./wedding";
import type { StudioRow } from "@/components/portal/WeddingStudioOverview";
export function studioRow(b: Booking): StudioRow {
  const w = weddingData(b),
    report = b.schedule.some(
      (i) => i.clientReportedSentAt && i.paidCents < i.totalCents,
    ),
    submitted = Object.values(w.forms).some((f) => f.status === "submitted"),
    delivery = w.documents.some((d) => d.deliveryError),
    draft = w.documents.some((d) => d.status === "draft"),
    left = w.documents.filter(
      (d) =>
        ["issued", "partial"].includes(d.status) && d.requiredEmails.length,
    ).length;
  const action = delivery
    ? "Retry signed PDF email delivery"
    : report
      ? "Confirm a reported payment"
      : submitted
        ? "Review submitted planning answers"
        : draft
          ? "Finish and review the draft documents"
          : b.status === "draft"
            ? "Prepare the proposal and scope"
            : left
              ? "Waiting for the couple’s signatures"
              : "Keep the wedding plan up to date";
  return {
    ref: b.ref,
    names: b.clients
      .map((c) => c.preferredName || c.legalName.split(" ")[0])
      .join(" & "),
    date: b.event.date,
    location: b.event.location,
    packageName: b.packageName,
    status: b.status,
    paid: b.schedule.reduce((s, i) => s + i.paidCents, 0),
    total: b.totals.totalCents,
    action,
    attention: delivery || report || submitted || draft || b.status === "draft",
    waiting: left
      ? `${left} document${left === 1 ? "" : "s"} awaiting signatures`
      : report
        ? "Payment reported sent"
        : submitted
          ? "Client answers submitted"
          : "No client action pending",
  };
}
