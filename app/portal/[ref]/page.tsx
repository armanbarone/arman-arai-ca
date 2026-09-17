import { Card, Eyebrow, PortalShell } from "@/components/portal/Shell";
import { PlanningProgress, PriceSummary, ScheduleTable } from "@/components/portal/BookingViews";
import { requireBookingAccess } from "@/lib/portal/auth";
import { formatCad, formatDate } from "@/lib/portal/money";
import { provinceName } from "@/lib/portal/presets";
import type { Booking } from "@/lib/portal/types";

export const metadata = { title: "Your elopement" };

function whatsNext(b: Booking): { title: string; body: string } {
  switch (b.status) {
    case "draft":
      return { title: "Your documents are being prepared", body: "Arman is finishing your agreement and work order. You will get an email as soon as they are ready to review and sign." };
    case "contract_sent":
    case "partially_signed":
      return { title: "Review and sign your agreement", body: "Both of you sign the agreement and work order. Your date and vendors are locked once the non-refundable deposit is paid." };
    case "signed": {
      const deposit = b.schedule[0];
      return { title: "Pay your deposit to lock your date", body: `The non-refundable deposit of ${formatCad(deposit?.totalCents ?? 0)} reserves your date and your vendors.` };
    }
    case "cancelled":
      return { title: "This booking is cancelled", body: "Write to i@armanarai.com with any questions." };
    default: {
      const nextDue = b.schedule.find((i) => !["paid", "void", "refunded"].includes(i.status));
      return nextDue
        ? { title: "Nothing to do right now", body: `Your next payment is ${formatCad(nextDue.totalCents - nextDue.paidCents)}, due ${formatDate(nextDue.dueDate)}. Follow the planning checklist below to see what has been arranged.` }
        : { title: "You are all paid", body: "Follow the planning checklist below to see what has been arranged." };
    }
  }
}

export default async function BookingOverview({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const { session, booking } = await requireBookingAccess(ref);
  const next = whatsNext(booking);
  const names = booking.clients.map((c) => c.preferredName || c.legalName.split(" ")[0]).join(" & ");

  return (
    <PortalShell home="/portal" email={session.email} admin={session.role === "admin"}>
      <Eyebrow>{booking.ref} · {booking.packageName}</Eyebrow>
      <h1 className="mb-1 font-serif text-4xl font-light sm:text-5xl">{names}</h1>
      <p className="mb-8 text-blush">
        {formatDate(booking.event.date)} · {booking.event.location}, {provinceName(booking.event.province)}
      </p>

      <Card className="mb-6 border-rose/60">
        <Eyebrow>What&apos;s next</Eyebrow>
        <p className="mb-1 font-serif text-2xl">{next.title}</p>
        <p className="text-sm leading-relaxed text-blush">{next.body}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Eyebrow>Your investment</Eyebrow>
          <PriceSummary booking={booking} />
          <p className="mt-4 text-xs leading-relaxed text-slate">
            Taxes are added on top of the package price. Backup date if weather or a closure stops the day: {formatDate(booking.event.backupDate)}.
          </p>
        </Card>
        <Card>
          <Eyebrow>Payment schedule</Eyebrow>
          <ScheduleTable schedule={booking.schedule} />
          <p className="mt-4 text-xs leading-relaxed text-slate">
            The first payment is a non-refundable deposit that locks your date and your vendors. Online payment opens once both of you have signed.
          </p>
        </Card>
      </div>

      <Card className="mt-6">
        <Eyebrow>Planning checklist</Eyebrow>
        <PlanningProgress items={booking.planning} />
      </Card>
    </PortalShell>
  );
}
