import Link from "next/link";
import { requireAdmin } from "@/lib/portal/auth";
import { settings, allSlots } from "@/lib/christmas/store";
import { dateLabel, timeLabel, money, packageById } from "@/lib/christmas/catalog";
import ChristmasAdminCalendar from "@/components/christmas/ChristmasAdminCalendar";
import { QUESTIONNAIRE_LABELS, SANTA_CHOICES } from "@/lib/christmas/questionnaire-schema";
import { validSlot } from "@/lib/christmas/inventory";
import { saveChristmasSettings, releaseChristmasSlot, toggleChristmasSlot, connectChristmasGoogleCalendar, syncChristmasGoogleCalendar } from "./actions";
import { calendarConnectionState } from "@/lib/christmas/google-calendar";
import { BUSINESS } from "@/lib/portal/business";
export const dynamic = "force-dynamic";
export default async function ChristmasAdmin({ searchParams }: { searchParams: Promise<{ date?: string; month?: string }> }) {
  await requireAdmin();
  const [cfg, rows] = await Promise.all([settings(), allSlots()]);
  const query = await searchParams;
  const requested = query.date ?? "";
  const parsedDate = new Date(requested + "T12:00:00Z");
  const selectedDate = /^2026-(11|12)-\d{2}$/.test(requested) && Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0,10) === requested ? requested : "2026-11-09";
  const month = query.month === "12" || selectedDate.startsWith("2026-12") ? 12 : 11;
  const selectedRows = rows.filter(s => s.date === selectedDate);
  const google = calendarConnectionState(), paidRows = rows.filter(s => s.reservation?.status === "paid");
  const calendarPending = paidRows.filter(s => !s.reservation?.googleCalendarSyncedAt || s.reservation.googleCalendarLastError).length;
  return <div><p className="wp-eyebrow">CHRISTMAS · NORTH VANCOUVER 2026</p><h1 className="wp-title">Christmas sessions</h1>
    <p>Your Christmas calendar, paid bookings, album orders and private family questionnaires. Paid appointments are reserved automatically after Stripe confirms payment.</p>
    <section className="wp-card"><h2>Booking alerts &amp; Google Calendar</h2><p>Email alerts go to <strong>{BUSINESS.email}</strong> after payment is confirmed, independently of the client’s welcome and questionnaire emails.</p><p>Main Google Calendar: <strong>{google.calendarEmail}</strong><br />Each new booking blocks 30 minutes. Existing longer bookings keep their original allocation. Family questionnaire answers stay in this dashboard.</p><p>{!google.activeEnvironment ? "Preview only. Google Calendar events are not created from test deployments." : !google.configured ? "Google Calendar needs its one-time website connection before automatic syncing can begin." : `${paidRows.length - calendarPending} booking(s) synced · ${calendarPending} waiting for sync or retry. Connect or reconnect Google if any booking needs attention.`}</p><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><form action={connectChristmasGoogleCalendar}><button className="wp-button" disabled={!google.activeEnvironment || !google.configured}>Connect Google Calendar</button></form><form action={syncChristmasGoogleCalendar}><button className="wp-text-button" disabled={!google.activeEnvironment || !google.configured}>Sync paid bookings / retry</button></form></div></section>
    <p><Link href="/christmas">View Christmas page ↗</Link> · <Link href="/admin/payment-settings">Stripe connection settings ↗</Link></p>
    <ChristmasAdminCalendar rows={rows} date={selectedDate} month={month} />
    <details className="wp-card"><summary>Studio settings and opening hours</summary><h2>Booking settings</h2><p>One $250 Santa package, plus 5% GST ($262.50 total), with optional 10-page, 20-photo albums: first $67, second $55, third $45, plus GST and PST on album lines. Three sets, mailed Santa letter with a printed keepsake, cookies and warm milk included. Arman is Santa. Before opening: confirm the set photographs, street address and booking policy. Saving with bookings enabled verifies the live Stripe prices and album product, and creates or reuses GST 5% and BC PST 7% rates. Base GST-only collection follows the merchant instruction. A paid invoice is created for each completed purchase.</p>
      <form action={saveChristmasSettings} style={{ display: "grid", gap: 16 }}>
        <label className="wp-label">Studio street address<input className="wp-input" name="studioAddress" defaultValue={cfg.studioAddress} maxLength={250} /></label>
        <label className="wp-label">Postal code<input className="wp-input" name="postalCode" defaultValue={cfg.postalCode} maxLength={20} /></label>
        <label className="wp-label">Arrival and parking instructions<textarea className="wp-input" name="arrivalNotes" defaultValue={cfg.arrivalNotes} maxLength={2000} /></label>
        <label className="wp-label">Cancellation and rescheduling policy<textarea className="wp-input" name="cancellationPolicy" defaultValue={cfg.cancellationPolicy} maxLength={2000} required /></label>
        <label className="wp-label">Legacy publishable key (optional; hosted checkout does not need it)<input className="wp-input" name="publishableKey" defaultValue={cfg.publishableKey} pattern="pk_live_.+" /></label>
        <label><input type="checkbox" name="enabled" defaultChecked={cfg.enabled} /> Open bookings and accept live payments</label>
        <button className="wp-button">Save booking settings</button>
      </form>
    </details>
    <details className="wp-card"><summary>Offer or block an appointment</summary><h2>Release an appointment</h2><p>November 9–December 20. Mon–Fri 9am–5pm; Saturday 10am–4pm; Sunday noon–3pm. December 10–12 is unavailable. Appointments last 30 minutes and start on the hour and half-hour. All appointments within your opening hours are offered. Use Unrelease for real breaks or times you cannot offer.</p>
      <form action={releaseChristmasSlot} style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 16 }}>
        <label className="wp-label">Date<input className="wp-input" type="date" name="date" min="2026-11-09" max="2026-12-20" required /></label>
        <label className="wp-label">Start<input className="wp-input" type="time" name="time" min="09:00" max="16:30" step="1800" required /></label>
        <span>Santa included in every appointment</span><button className="wp-button">Release appointment</button>
      </form>
    </details>
    <section className="wp-card" id="appointments"><h2>{dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })}</h2><div style={{ overflowX: "auto" }}><table className="xc-day-table" style={{fontSize:14}}><thead><tr><th>Date / time</th><th>Santa</th><th>Status</th><th>Family / package</th><th>Questionnaire / emails</th><th>Action</th></tr></thead><tbody>
      {selectedRows.map(s => <tr key={s.id}><td style={{ padding: "16px 8px" }}>{dateLabel(s.date)}<br />{timeLabel(s.time)}</td><td>{s.santa ? "Yes" : "No"}</td><td>{s.reservation?.status === "paid" ? `Paid ${money(s.reservation.paidCents ?? 0)}` : s.reservation ? "Payment hold" : !validSlot(s.date,s.time) ? "Closed" : s.published ? "Available" : "Blocked"}</td><td>{s.reservation ? <>{s.reservation.name}<br /><a href={`mailto:${s.reservation.email}`}>{s.reservation.email}</a><br />{s.reservation.phone}<br />{s.reservation.packageSnapshot?.name || packageById(s.reservation.packageId)?.name}{s.reservation.albums ? ` + ${s.reservation.albums} album(s)` : s.reservation.grinch ? " + legacy Grinch appearance" : ""}<br />
      {s.reservation.delivery && <><strong>Santa letter &amp; print</strong><br />{s.reservation.delivery.letterNames}<br />{s.reservation.name}<br />{s.reservation.delivery.line1}<br />{s.reservation.delivery.line2 && <>{s.reservation.delivery.line2}<br /></>}{s.reservation.delivery.city}, BC {s.reservation.delivery.postalCode}<br /></>}
      <small>{s.reservation.id}</small></> : "—"}</td><td>{s.reservation?.status === "paid" ? <><p>Welcome: {s.reservation.welcomeSentAt || s.reservation.emailsSent ? "sent" : "pending"}<br />Questionnaire email: {s.reservation.questionnaireSentAt ? "sent" : "pending"}<br />Your email alert: {s.reservation.studioSentAt || s.reservation.emailsSent ? "sent" : "pending"}<br />Google Calendar: {s.reservation.googleCalendarSyncedAt ? "synced" : "waiting for connection / retry"}</p>{s.reservation.googleCalendarEventUrl && <p><a href={s.reservation.googleCalendarEventUrl} target="_blank" rel="noreferrer">Open Google event ↗</a></p>}{s.reservation.googleCalendarLastError && <p role="status">{s.reservation.googleCalendarLastError}</p>}{s.reservation.questionnaire ? <details className="xc-answers"><summary>View completed questionnaire</summary><dl>{Object.entries(s.reservation.questionnaire.answers).filter(([k])=>k!=="consent").map(([key,value])=><div key={key}><dt>{QUESTIONNAIRE_LABELS[key] || key}</dt><dd>{key==="children" && Array.isArray(value) ? value.map(c=>`${c.firstName} (${c.age || "age not provided"})`).join(", ") || "No children listed" : key==="santaComfort" ? SANTA_CHOICES[value as keyof typeof SANTA_CHOICES] : String(value || "Not provided")}</dd></div>)}</dl><p>Updated {new Date(s.reservation.questionnaire.updatedAt).toLocaleString("en-CA",{timeZone:"America/Vancouver"})} Pacific</p></details> : <strong>Awaiting family answers</strong>}</> : "—"}</td><td>{!s.reservation && validSlot(s.date,s.time) && <form action={toggleChristmasSlot}><input type="hidden" name="id" value={s.id} /><button className="wp-text-button">{s.published ? "Unrelease" : "Release"}</button></form>}</td></tr>)}
      {!selectedRows.length && <tr><td colSpan={6} style={{ padding: 20 }}>No appointments released. Add your first real appointment above.</td></tr>}
    </tbody></table></div></section>
  </div>;
}
