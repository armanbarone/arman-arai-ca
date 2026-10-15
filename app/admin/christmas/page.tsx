import Link from "next/link";
import { requireAdmin } from "@/lib/portal/auth";
import { settings, allSlots } from "@/lib/christmas/store";
import { dateLabel, timeLabel, money, packageById } from "@/lib/christmas/catalog";
import { saveChristmasSettings, releaseChristmasSlot, toggleChristmasSlot } from "./actions";
export const dynamic = "force-dynamic";
export default async function ChristmasAdmin() {
  await requireAdmin();
  const [cfg, rows] = await Promise.all([settings(), allSlots()]);
  return <div><p className="wp-eyebrow">CHRISTMAS · VANCOUVER 2026</p><h1 className="wp-title">Christmas sessions</h1>
    <p>Release only the appointments you actually intend to sell. Remaining counts are calculated from these appointments and real payment holds.</p>
    <p><Link href="/christmas">View Christmas page ↗</Link> · <Link href="/admin/payment-settings">Stripe connection settings ↗</Link></p>
    <section className="wp-card"><h2>Booking settings</h2><p>Before opening: confirm your Santa actor, set photographs, studio location and policy. Enable Stripe Tax in the connected Stripe account.</p>
      <form action={saveChristmasSettings} style={{ display: "grid", gap: 16 }}>
        <label className="wp-label">Studio street address<input className="wp-input" name="studioAddress" defaultValue={cfg.studioAddress} maxLength={250} /></label>
        <label className="wp-label">Postal code<input className="wp-input" name="postalCode" defaultValue={cfg.postalCode} maxLength={20} /></label>
        <label className="wp-label">Arrival and parking instructions<textarea className="wp-input" name="arrivalNotes" defaultValue={cfg.arrivalNotes} maxLength={2000} /></label>
        <label className="wp-label">Cancellation and rescheduling policy<textarea className="wp-input" name="cancellationPolicy" defaultValue={cfg.cancellationPolicy} maxLength={2000} required /></label>
        <label className="wp-label">Stripe live publishable key (pk_live_, never a secret key)<input className="wp-input" name="publishableKey" defaultValue={cfg.publishableKey} pattern="pk_live_.+" /></label>
        <label><input type="checkbox" name="enabled" defaultChecked={cfg.enabled} /> Open bookings and accept live payments</label>
        <button className="wp-button">Save booking settings</button>
      </form>
    </section>
    <section className="wp-card"><h2>Release an appointment</h2><p>Each appointment has a 40-minute allocation, allowing up to 20 minutes of photography and generous changeover time. Unreleased time is never described as purchased.</p>
      <form action={releaseChristmasSlot} style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 16 }}>
        <label className="wp-label">Date<input className="wp-input" type="date" name="date" min="2026-11-27" max="2026-12-23" required /></label>
        <label className="wp-label">Start<input className="wp-input" type="time" name="time" min="09:00" max="16:59" required /></label>
        <label><input type="checkbox" name="santa" /> Santa confirmed for this appointment</label><button className="wp-button">Release appointment</button>
      </form>
    </section>
    <section className="wp-card"><h2>Appointments and purchases</h2><div style={{ overflowX: "auto" }}><table style={{ width: "100%", textAlign: "left", fontSize: 14 }}><thead><tr><th>Date / time</th><th>Santa</th><th>Status</th><th>Family / package</th><th>Action</th></tr></thead><tbody>
      {rows.map(s => <tr key={s.id}><td style={{ padding: "16px 8px" }}>{dateLabel(s.date)}<br />{timeLabel(s.time)}</td><td>{s.santa ? "Yes" : "No"}</td><td>{s.reservation?.status === "paid" ? `Paid ${money(s.reservation.paidCents ?? 0)}` : s.reservation ? "Payment hold" : s.published ? "Available" : "Unreleased"}</td><td>{s.reservation ? <>{s.reservation.name}<br /><a href={`mailto:${s.reservation.email}`}>{s.reservation.email}</a><br />{s.reservation.phone}<br />{packageById(s.reservation.packageId)?.name}<br /><small>{s.reservation.id}</small></> : "—"}</td><td>{!s.reservation && <form action={toggleChristmasSlot}><input type="hidden" name="id" value={s.id} /><button className="wp-text-button">{s.published ? "Unrelease" : "Release"}</button></form>}</td></tr>)}
      {!rows.length && <tr><td colSpan={5} style={{ padding: 20 }}>No appointments released. Add your first real appointment above.</td></tr>}
    </tbody></table></div></section>
  </div>;
}
