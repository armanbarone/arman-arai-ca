import { dateLabel, timeLabel, money } from "@/lib/christmas/catalog";
import { awaitingSchedule, reservationCapacity, type Slot } from "@/lib/christmas/inventory";
import { bookingPaymentSummary } from "@/lib/christmas/payment-plan";
import { scheduleChristmasReservation } from "@/app/admin/christmas/actions";
import { QUESTIONNAIRE_LABELS, SANTA_CHOICES } from "@/lib/christmas/questionnaire-schema";

export default function ChristmasReservationQueue({ rows }: { rows: Slot[] }) {
  const paid = rows.filter(s => s.flexible && s.reservation?.status === "paid");
  const count = reservationCapacity(rows), pending = paid.filter(awaitingSchedule);
  return <section className="wp-card" id="reservations"><h2>Reservations to schedule</h2><p><strong>{count.remaining} of {count.limit} family sessions remaining</strong> · {pending.length} paid reservation(s) awaiting an appointment.</p>
    <p>Contact each family personally, agree on a date and time for December 1–14, then confirm it here. This sends their appointment email and calendar attachment, prepares the balance invoice, and syncs your Google Calendar. Existing dated bookings also count toward the 50-session limit.</p>
    {!paid.length && <p>New paid reservations will appear here automatically.</p>}
    {paid.map(s => { const r = s.reservation!, payment = bookingPaymentSummary(r); return <details key={s.id} open={awaitingSchedule(s)} style={{ borderTop: "1px solid #ddd", padding: "20px 0" }}><summary><strong>{r.name}</strong> · {awaitingSchedule(s) ? "Awaiting scheduling" : `${dateLabel(s.date)} · ${timeLabel(s.time)}`}</summary>
      <p><a href={`mailto:${r.email}`}>{r.email}</a> · <a href={`tel:${r.phone}`}>{r.phone}</a><br />{r.id}<br />Paid {money(payment.paid)} · Remaining {money(payment.balance)} · {r.albums ?? 0} album(s)</p>
      <p>Welcome: {r.welcomeSentAt ? "sent" : "pending"} · Questionnaire email: {r.questionnaireSentAt ? "sent" : "pending"} · Studio alert: {r.studioSentAt ? "sent" : "pending"}<br />Appointment email: {r.scheduleEmailKey === `christmas-schedule-${r.id}-${r.scheduleVersion ?? 1}` ? "sent" : "waiting"} · Google Calendar: {awaitingSchedule(s) ? "waiting for agreed appointment" : r.googleCalendarSyncedAt ? "synced" : "retry needed"}</p>
      {r.questionnaire ? <details><summary>Family questionnaire &amp; availability</summary><dl>{Object.entries(r.questionnaire.answers).filter(([k]) => k !== "consent").map(([key, value]) => <div key={key}><dt><strong>{QUESTIONNAIRE_LABELS[key] || key}</strong></dt><dd>{key === "children" && Array.isArray(value) ? value.map(c => `${c.firstName} (${c.age || "age not provided"})`).join(", ") || "No children listed" : key === "santaComfort" ? SANTA_CHOICES[value as keyof typeof SANTA_CHOICES] : String(value || "Not provided")}</dd></div>)}</dl></details> : <p>Awaiting family questionnaire.</p>}
      <form action={scheduleChristmasReservation} style={{ display: "grid", gap: 12, maxWidth: 460, marginTop: 16 }}><input type="hidden" name="id" value={s.id} />
        <label className="wp-label">Agreed date<input className="wp-input" type="date" name="date" min="2026-12-01" max="2026-12-14" defaultValue={s.date} required /></label>
        <label className="wp-label">Agreed start time (Pacific)<input className="wp-input" type="time" name="time" step="1800" defaultValue={s.time} required /></label>
        <label><input type="checkbox" name="agreed" required /> I have agreed on this appointment with the family.</label><button className="wp-button">Confirm agreed appointment / retry</button>
      </form>
    </details>; })}
  </section>;
}
