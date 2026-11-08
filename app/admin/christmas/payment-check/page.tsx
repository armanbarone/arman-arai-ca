import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { BUSINESS } from "@/lib/portal/business";
import { allSlots, settings } from "@/lib/christmas/store";
import { publicSlots } from "@/lib/christmas/inventory";
import { dateLabel, timeLabel } from "@/lib/christmas/catalog";
import { openOwnerPaymentCheck } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner live-payment check", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function OwnerPaymentCheck() {
  const owner = await requireAdmin();
  if (owner.email !== BUSINESS.email) notFound();
  const [rows, cfg] = await Promise.all([allSlots(), settings()]);
  const slots = publicSlots(rows).filter(slot => slot.available);
  return <div style={{ maxWidth: 680 }}>
    <p className="wp-eyebrow">PRIVATE · STUDIO OWNER</p>
    <h1 className="wp-title">$10 live-payment check</h1>
    <p>Pay with a real card, then check the Christmas payment confirmation and Meta Purchase event. The total is <strong>$10 CAD, including GST</strong>.</p>
    <section className="wp-card"><h2>Your verification booking</h2>
      <p>This uses an available appointment and the normal Stripe payment, receipt, confirmation and email flow. Contact details and emails use <strong>{BUSINESS.email}</strong> and the studio’s business mailing address.</p>
      <p>Public Christmas pricing stays $250 + GST. This private checkout is available only to your signed-in owner account.</p>
      <form action={openOwnerPaymentCheck} style={{ display: "grid", gap: 18 }}>
        <label className="wp-label">Appointment used for the check<select className="wp-input" name="slotId" defaultValue={slots.at(-1)?.id} required>{slots.map(slot => <option key={slot.id} value={slot.id}>{dateLabel(slot.date)} · {timeLabel(slot.time)} Pacific</option>)}</select></label>
        <input type="hidden" name="acceptedPolicy" value={cfg.cancellationPolicy} />
        <dl><div><dt>Payment check</dt><dd>$9.52 CAD</dd></div><div><dt>GST</dt><dd>$0.48 CAD</dd></div><div><dt>Total</dt><dd><strong>$10.00 CAD</strong></dd></div></dl>
        <button className="wp-button" disabled={!cfg.enabled || !slots.length}>Open secure $10 checkout</button>
      </form>
      <p style={{ marginTop: 20 }}>{cfg.cancellationPolicy}</p>
      <p><Link href="/terms-of-service">Booking terms ↗</Link></p>
    </section>
    <p><Link href="/admin/christmas">Back to Christmas bookings ↗</Link></p>
  </div>;
}
