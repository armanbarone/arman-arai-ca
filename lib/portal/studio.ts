import type { Booking } from "./types";
import { weddingData } from "./wedding";
import type { StudioRow } from "@/components/portal/WeddingStudioOverview";
export function studioRow(b: Booking): StudioRow {
  const w = weddingData(b),
    report = b.schedule.some(
      (i) => i.clientReportedSentAt && i.paidCents < i.totalCents,
    ),
    submitted = Object.values(w.forms).some((f) => f.status === "submitted"),
    delivery =
      w.documents.some((d) => d.deliveryError) ||
      b.invoices?.some((i) => i.deliveryError),
    draft = w.documents.some((d) => d.status === "draft"),
    left = w.documents.filter(
      (d) =>
        ["issued", "partial"].includes(d.status) && d.requiredEmails.length,
    ).length;
  const action = b.archivedAt
    ? "Restore this wedding if client access is needed"
    : b.status === "cancelled"
      ? "Review cancelled wedding records"
      : b.events.some((e) => /stripe_.*needs_review/.test(e.type))
        ? "Review a Stripe payment or refund"
        : w.intake?.status === "submitted"
          ? "Review the couple’s contract details"
          : delivery
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
    archived: !!b.archivedAt,
    portalEnabled: b.portal?.enabled !== false && !b.archivedAt,
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
    attention:
      !b.archivedAt &&
      b.status !== "cancelled" &&
      (b.events.some((e) => /stripe_.*needs_review/.test(e.type)) ||
        w.intake?.status === "submitted" ||
        delivery ||
        report ||
        submitted ||
        draft ||
        b.status === "draft"),
    waiting: b.archivedAt
      ? "Client access is closed"
      : left
        ? `${left} document${left === 1 ? "" : "s"} awaiting signatures`
        : report
          ? "Payment reported sent"
          : submitted
            ? "Client answers submitted"
            : "No client action pending",
  };
}
