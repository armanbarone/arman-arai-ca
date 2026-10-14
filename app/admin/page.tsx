import Link from "next/link";
import { studioDashboard } from "@/lib/portal/studio-dashboard";
import { studioRow } from "@/lib/portal/studio";
import { formatCad } from "@/lib/portal/money";
import StudioToday from "@/components/portal/StudioToday";
import StudioCalendar from "@/components/portal/StudioCalendar";
import WeddingStudioOverview from "@/components/portal/WeddingStudioOverview";
import { Card, Eyebrow } from "@/components/portal/Shell";
import type { FollowUpSubject } from "@/lib/portal/followup-types";

export default async function AdminHome() {
  const d = await studioDashboard();

  // Anything a follow-up can hang off: the live weddings and every lead that
  // has not been closed out.
  const subjects: FollowUpSubject[] = [
    ...d.bookings
      .filter((b) => !b.archivedAt && b.status !== "cancelled")
      .map((b) => ({
        kind: "booking" as const,
        id: b.ref,
        label: `${b.clients.map((c) => c.preferredName || c.legalName.split(" ")[0]).join(" & ")} · ${b.ref}`,
      })),
    ...d.leads
      .filter((l) => !l.booked && l.stage !== "lost")
      .map((l) => ({
        kind: "lead" as const,
        id: l.id,
        label: `${l.name} · inquiry`,
      })),
  ];

  const pct = d.pipeline.closeRate === null ? null : Math.round(d.pipeline.closeRate * 100);

  return (
    <>
      <div className="wp-heading-row">
        <div>
          <h1>Studio</h1>
          <p className="wp-lead">
            Everything waiting on you, the money owed, and the dates that are gone.
          </p>
        </div>
      </div>

      <div className="wp-stats">
        <div className="wp-stat">
          <span>Outstanding</span>
          <strong>{formatCad(d.money.outstandingCents)}</strong>
          <small>
            {d.money.overdueCents > 0
              ? `${formatCad(d.money.overdueCents)} overdue`
              : d.money.nextDue
                ? `next ${formatCad(d.money.nextDue.cents)} on ${d.money.nextDue.date}`
                : "nothing scheduled"}
          </small>
        </div>
        <div className="wp-stat">
          <span>Booked value</span>
          <strong>{formatCad(d.money.bookedValueCents)}</strong>
          <small>{d.counts.weddings} wedding{d.counts.weddings === 1 ? "" : "s"}</small>
        </div>
        <div className="wp-stat">
          <span>Pipeline</span>
          <strong>{d.pipeline.leads}</strong>
          <small>
            {d.pipeline.consults} consults · {pct === null ? "no close rate yet" : `${pct}% close`}
          </small>
        </div>
        <div className="wp-stat">
          <span>New inquiries</span>
          <strong>{d.counts.newInquiries}</strong>
          <small>
            <Link href="/admin/inquiries">open the tracker →</Link>
          </small>
        </div>
      </div>

      <StudioToday actions={d.actions} subjects={subjects} />

      <Card className="wp-doc-section">
        <div className="wp-section-title">
          <Eyebrow>The diary</Eyebrow>
          <span className="wp-muted">Dates the website no longer offers</span>
        </div>
        <StudioCalendar entries={d.calendar} today={d.today} />
      </Card>

      <WeddingStudioOverview rows={d.bookings.map(studioRow)} />
    </>
  );
}
