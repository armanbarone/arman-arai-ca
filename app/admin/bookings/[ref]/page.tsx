import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/portal/BookingForm";
import { Card, Eyebrow, StatusPill } from "@/components/portal/Shell";
import { formatDate } from "@/lib/portal/money";
import { getBooking } from "@/lib/portal/store";
import InviteButtons from "./InviteButtons";

export default async function AdminBookingPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const booking = await getBooking(ref);
  if (!booking) notFound();

  const { schema: _schema, ref: _ref, createdAt: _c, updatedAt: _u, status: _s, eventType: _e, totals: _t, schedule: _sc, planning: _p, payments: _pa, events: _ev, event, clients, ...rest } = booking;
  const initial = {
    ...rest,
    event: { date: event.date, backupDate: event.backupDate, serviceDates: event.serviceDates, location: event.location, province: event.province, ceremonyType: event.ceremonyType },
    clients: clients.map(({ id: _id, ...c }) => c) as [typeof clients[0], typeof clients[1]],
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>{booking.ref} · created {formatDate(booking.createdAt.slice(0, 10))}</Eyebrow>
          <h1 className="font-serif text-4xl font-light">
            {booking.clients.map((c) => c.preferredName || c.legalName.split(" ")[0]).join(" & ")}
          </h1>
          <p className="mt-1 text-blush">{formatDate(booking.event.date)} · {booking.event.location} <span className="ml-2"><StatusPill status={booking.status} /></span></p>
        </div>
        <Link href={`/portal/${booking.ref}`} className="text-xs uppercase tracking-[0.18em] text-rose hover:text-cream">View as the couple →</Link>
      </div>

      <Card className="mb-6">
        <Eyebrow>Portal access</Eyebrow>
        <p className="mb-4 text-sm text-blush">
          Sends each partner a private sign-in link (valid 7 days, single use). They can always request a new one at armanarai.ca/portal/login.
        </p>
        <InviteButtons bookingRef={booking.ref} emails={booking.clients.map((c) => c.email)} />
      </Card>

      <BookingForm initial={initial} bookingRef={booking.ref} locked={booking.status !== "draft"} />

      <Card className="mt-6">
        <Eyebrow>Activity log</Eyebrow>
        <ul className="space-y-1.5 text-xs text-blush">
          {[...booking.events].reverse().map((e, i) => (
            <li key={i} className="flex flex-wrap gap-x-3">
              <span className="text-slate">{new Date(e.at).toLocaleString("en-CA", { timeZone: "America/Vancouver" })}</span>
              <span className="text-cream">{e.type.replace(/_/g, " ")}</span>
              <span>{e.actor}</span>
              {e.detail && <span className="text-slate">{JSON.stringify(e.detail)}</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
