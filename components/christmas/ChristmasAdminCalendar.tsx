import Link from "next/link";
import { dateLabel, validAlbumCount } from "@/lib/christmas/catalog";
import { publicSlots, type Slot } from "@/lib/christmas/inventory";
import "./admin-calendar.css";
export default function ChristmasAdminCalendar({ rows, date, month }: { rows: Slot[]; date: string; month: number }) {
  const visible = publicSlots(rows), start = new Date(Date.UTC(2026, month - 1, 1)).getUTCDay(), count = new Date(Date.UTC(2026, month, 0)).getUTCDate();
  const paid = rows.filter(s => s.reservation?.status === "paid");
  return <section className="wp-card xc-diary"><div className="xc-stats"><div><strong>{paid.length}</strong><span>Paid sessions</span></div><div><strong>{rows.filter(s => s.reservation?.status === "pending").length}</strong><span>Payment holds</span></div><div><strong>{paid.filter(s => !s.reservation?.questionnaire).length}</strong><span>Questionnaires pending</span></div><div><strong>{paid.reduce((n, s) => n + (validAlbumCount(s.reservation?.albums) ? s.reservation!.albums! : 0), 0)}</strong><span>Albums ordered</span></div></div>
    <div className="xc-heading"><h2>{month === 11 ? "November" : "December"} 2026</h2><div><Link href="/admin/christmas?month=11&date=2026-11-09">November</Link><Link href="/admin/christmas?month=12&date=2026-12-01">December</Link></div></div>
    <div className="xc-grid">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <span className="xc-weekday" key={d}>{d}</span>)}{Array.from({ length: start }, (_, i) => <span key={`pad-${i}`} />)}{Array.from({ length: count }, (_, i) => {
      const day = `2026-${month}-${String(i + 1).padStart(2, "0")}`, slots = visible.filter(s => s.date === day), open = slots.filter(s => s.available).length, booked = slots.filter(s => s.status === "sold").length, held = slots.filter(s => s.status === "reserved").length;
      return <Link key={day} aria-current={date === day ? "date" : undefined} href={`/admin/christmas?month=${month}&date=${day}#appointments`} className={`${date === day ? "selected" : ""} ${!open && !booked && !held ? "closed" : ""}`}><b>{i + 1}</b>{booked > 0 && <small className="paid">{booked} paid</small>}{held > 0 && <small>{held} held</small>}{open > 0 && <small>{open} open</small>}{!open && !booked && !held && <small>Closed</small>}</Link>;
    })}</div><p>Choose a date to see its appointments, customer details, albums and questionnaire answers below. All times are Pacific. <strong>{dateLabel(date, { weekday: "long", month: "long", day: "numeric" })}</strong> is selected.</p>
  </section>;
}
