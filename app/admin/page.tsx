import Link from "next/link";
import { Card, Eyebrow, StatusPill, buttonCls } from "@/components/portal/Shell";
import { formatCad, formatDate, todayInBusinessTz } from "@/lib/portal/money";
import { getSettings, listBookings } from "@/lib/portal/store";

export default async function AdminHome() {
  const [bookings, settings] = await Promise.all([listBookings(), getSettings()]);
  const today = todayInBusinessTz();
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const active = bookings.filter((b) => b.status !== "cancelled");
  const upcoming = active.filter((b) => b.event.date >= today);
  const dueSoon = active.flatMap((b) =>
    b.schedule.filter((i) => ["scheduled", "due", "partially_paid", "overdue"].includes(i.status) && i.dueDate <= in14).map((i) => ({ b, i })),
  );
  const insurance = settings.insurance;
  const insuranceOk = insurance && insurance.expiryDate >= today;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Canadian elopements</Eyebrow>
          <h1 className="font-serif text-4xl font-light">Bookings</h1>
        </div>
        <Link href="/admin/bookings/new" className={buttonCls}>New booking</Link>
      </div>

      {!insuranceOk && (
        <Card className="mb-6 border-red-900/70">
          <p className="text-sm text-red-200">
            {insurance ? `Your insurance record expired on ${formatDate(insurance.expiryDate)}.` : "No insurance record yet."} Agreements cannot be sent until a current policy is on file.{" "}
            <Link href="/admin/settings" className="underline">Add it in settings</Link>.
          </p>
        </Card>
      )}

      {dueSoon.length > 0 && (
        <Card className="mb-6">
          <Eyebrow>Payments due in the next 14 days</Eyebrow>
          <ul className="space-y-2 text-sm">
            {dueSoon.map(({ b, i }) => (
              <li key={i.reference} className="flex justify-between gap-4">
                <Link href={`/admin/bookings/${b.ref}`} className="hover:text-rose">{i.reference} · {i.label}</Link>
                <span className="text-blush">{formatCad(i.totalCents - i.paidCents)} · {formatDate(i.dueDate)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <Eyebrow>All bookings ({active.length} active, {upcoming.length} upcoming)</Eyebrow>
        {bookings.length === 0 ? (
          <p className="text-sm text-blush">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-dust text-left text-[11px] uppercase tracking-[0.14em] text-blush">
                  <th className="py-2 pr-3 font-normal">Reference</th>
                  <th className="py-2 pr-3 font-normal">Couple</th>
                  <th className="py-2 pr-3 font-normal">Date</th>
                  <th className="py-2 pr-3 text-right font-normal">Total</th>
                  <th className="py-2 text-right font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.ref} className="border-b border-dust/60">
                    <td className="py-2.5 pr-3"><Link href={`/admin/bookings/${b.ref}`} className="text-rose hover:text-cream">{b.ref}</Link></td>
                    <td className="py-2.5 pr-3">{b.clients.map((c) => c.preferredName || c.legalName.split(" ")[0]).join(" & ")}</td>
                    <td className="py-2.5 pr-3 text-blush">{formatDate(b.event.date)} · {b.event.location}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{formatCad(b.totals.totalCents)}</td>
                    <td className="py-2.5 text-right"><StatusPill status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
