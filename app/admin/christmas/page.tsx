import Link from "next/link";
import { requireAdmin } from "@/lib/portal/auth";
import { settings, allSlots } from "@/lib/christmas/store";
import { dateLabel, timeLabel, money, packageById } from "@/lib/christmas/catalog";
import { saveChristmasSettings, releaseChristmasSlot, toggleChristmasSlot } from "./actions";
export const dynamic = "force-dynamic";
export default async function ChristmasAdmin() {
  await requireAdmin();
  const [cfg, rows] = await Promise.all([settings(), allSlots()]);
  return <div><p className="wp-eyebrow">CHRISTMAS · NORTH VANCOUVER 2026</p><h1 className="wp-title">Christmas sessions</h1>
    <p>Release only the appointments you actually intend to sell. Remaining counts are calculated from these appointments and real payment holds.</p>
    <p><Link href="/christmas">View Christmas page ↗</Link> · <Link href="/admin/payment-settings">Stripe connection settings ↗</Link></p>
    <section className="wp-card"><h2>Booking settings</h2><p>One $300 Santa package, plus 5% GST ($315 total), or $350 plus GST ($367.50 total) with The Grinch. Three sets, mailed Santa letter with a printed keepsake, cookies and warm milk included. Arman is Santa. Before opening: confirm the set photographs, street address and booking policy. Saving with bookings enabled verifies the live Stripe price and creates or reuses the 5% GST rate. A paid invoice is created for each completed purchase.</p>
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
    <section className="wp-card"><h2>Release an appointment</h2><p>The season is open every day, 11 am–8 pm, November 1–December 20. Each 30-minute appointment allows a 20-minute session and ten minutes of changeover. Use Unrelease for real breaks or times you cannot offer.</p>
      <form action={releaseChristmasSlot} style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 16 }}>
        <label className="wp-label">Date<input className="wp-input" type="date" name="date" min="2026-11-01" max="2026-12-20" required /></label>
        <label className="wp-label">Start<input className="wp-input" type="time" name="time" min="11:00" max="19:30" step="1800" required /></label>
        <span>Santa included in every appointment</span><button className="wp-button">Release appointment</button>
      </form>
    </section>
    <section className="wp-card"><h2>Appointments and purchases</h2><div style={{ overflowX: "auto" }}><table style={{ width: "100%", textAlign: "left", fontSize: 14 }}><thead><tr><th>Date / time</th><th>Santa</th><th>Status</th><th>Family / package</th><th>Action</th></tr></thead><tbody>
      {rows.map(s => <tr key={s.id}><td style={{ padding: "16px 8px" }}>{dateLabel(s.date)}<br />{timeLabel(s.time)}</td><td>{s.santa ? "Yes" : "No"}</td><td>{s.reservation?.status === "paid" ? `Paid ${money(s.reservation.paidCents ?? 0)}` : s.reservation ? "Payment hold" : s.published ? "Available" : "Unreleased"}</td><td>{s.reservation ? <>{s.reservation.name}<br /><a href={`mailto:${s.reservation.email}`}>{s.reservation.email}</a><br />{s.reservation.phone}<br />{s.reservation.packageSnapshot?.name || packageById(s.reservation.packageId)?.name}{s.reservation.grinch && " + The Grinch"}<br />
      {s.reservation.delivery && <><strong>Santa letter &amp; print</strong><br />{s.reservation.delivery.letterNames}<br />{s.reservation.name}<br />{s.reservation.delivery.line1}<br />{s.reservation.delivery.line2 && <>{s.reservation.delivery.line2}<br /></>}{s.reservation.delivery.city}, BC {s.reservation.delivery.postalCode}<br /></>}
      <small>{s.reservation.id}</small></> : "—"}</td><td>{!s.reservation && <form action={toggleChristmasSlot}><input type="hidden" name="id" value={s.id} /><button className="wp-text-button">{s.published ? "Unrelease" : "Release"}</button></form>}</td></tr>)}
      {!rows.length && <tr><td colSpan={5} style={{ padding: 20 }}>No appointments released. Add your first real appointment above.</td></tr>}
    </tbody></table></div></section>
  </div>;
}
