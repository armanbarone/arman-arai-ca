"use client";
import { useEffect, useState } from "react";
import { dateLabel, timeLabel, money } from "../../lib/christmas/catalog";
import { confirmationAccess } from "../../lib/christmas/confirmation-access";
import { trackChristmasPurchase, type ChristmasPurchase } from "../../lib/analytics";
import "./christmas.css";
interface Confirmation { status: string; reference?: string; date?: string; time?: string; package?: string; minutes?: number; images?: number; sets?: number; grinch?: boolean; albums?: number; delivery?: { letterNames: string; line1: string; line2: string; city: string; postalCode: string }; santa?: boolean; paidCents?: number; invoiceUrl?: string; address?: string; postalCode?: string; arrivalNotes?: string; email?: string; cancellationPolicy?: string; questionnaireUrl?: string; questionnaireComplete?: boolean; welcomeSent?: boolean; questionnaireSent?: boolean; error?: string }
function escapeCalendar(text: string) { return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,"); }
function addToCalendar(c: Confirmation) {
  const start = new Date(`${c.date}T${c.time}:00-08:00`), end = new Date(start.getTime() + (c.minutes || 45) * 60000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Arman Arai//Christmas Sessions//EN", "BEGIN:VEVENT", `UID:${c.reference}@armanarai.ca`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escapeCalendar(`Christmas photographs · ${c.package}`)}`, `LOCATION:${escapeCalendar(`${c.address}, ${c.postalCode}`)}`, `DESCRIPTION:${escapeCalendar(`${c.arrivalNotes || ""}\nReference: ${c.reference}\ni@armanarai.com`)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "Christmas-session.ics"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ChristmasConfirmation({ preview = false }: { preview?: boolean }) {
  const sample: Confirmation = { status: "paid", reference: "SAMPLE-NOT-A-BOOKING", date: "2026-11-21", time: "10:00", package: "Christmas with Santa", minutes: 30, images: 20, sets: 3, albums: 1, santa: true, paidCents: 33754, address: "583 E Kings Rd, North Vancouver, BC", postalCode: "V7N 1J2", arrivalNotes: "Plenty of street parking. Please arrive dressed and ready.", email: "alex@example.invalid", questionnaireUrl: "/christmas/questionnaire/preview", cancellationPolicy: "Cancel at least 48 hours before your appointment for a full refund. One free reschedule, subject to availability through December 20." };
  const [booking, setBooking] = useState<Confirmation | null>(preview ? sample : null), [error, setError] = useState("");
  useEffect(() => {
    if (preview) return;
    let active = true, timeout: ReturnType<typeof setTimeout>, attempts = 0;
    const access = confirmationAccess();
    if (!access) { setError("This booking link is incomplete. Please check your confirmation or email Arman."); return; }
    const { slot, token } = access;
    async function check() {
      try {
        const response = await fetch(`/api/christmas/status?slot=${encodeURIComponent(slot!)}&token=${encodeURIComponent(token!)}`, { cache: "no-store", referrerPolicy: "no-referrer" });
        const result = await response.json() as Confirmation & { purchaseTracking?: ChristmasPurchase };
        if (!active) return;
        if (!response.ok) { setError(result.error || "We could not verify this booking."); return; }
        setBooking(result);
        if (result.status === "paid" && result.purchaseTracking) void trackChristmasPurchase(result.purchaseTracking).catch(() => { /* Measurement never blocks the booking. */ });
        if (result.status === "pending" && attempts++ < 15) timeout = setTimeout(check, 2500);
      } catch { if (active) setError("Payment could not be verified yet. Refresh shortly or contact Arman before making another payment."); }
    }
    void check(); return () => { active = false; clearTimeout(timeout); };
  }, [preview]);
  const preparation = [
    ["Arrival & parking", "Arrive dressed and ready for your booked start time. Street parking is available."],
    ["What to wear", "Choose comfortable, coordinated colours. Cream, burgundy, olive and warm neutrals suit the sets."],
    ["What to bring", "Bring water, wipes, a small comfort toy and spare clothes for little ones if helpful."],
    ["Comfort around Santa", "A parent can stay close. We won’t require lap-sitting or smiles on cue."],
    ["Food & access requests", "Share these in your family questionnaire, or reply to the welcome email."],
  ];
  return <div className="xm xm-confirmation"><div className="xm-confirmation-card">{preview && <p className="xm-preview-bar">SAMPLE CONFIRMATION · No payment was made · No appointment is reserved</p>}<a className="xm-brand" href="/christmas">Arman Arai<span>CHRISTMAS SESSIONS · NORTH VANCOUVER</span></a>
    {error ? <><h1>Let’s check<br /><em>your booking.</em></h1><p role="alert">{error}</p></> : booking?.status === "paid" ? <><p className="xm-eyebrow">PAYMENT RECEIVED · APPOINTMENT CONFIRMED</p><h1>A little Christmas,<br /><em>all yours.</em></h1><p>Your appointment is confirmed. A welcome email and a separate family questionnaire are sent to {booking.email}. Stripe emails your payment receipt separately.</p><section className="xm-confirmation-next"><p className="xm-eyebrow">NEXT · TELL US ABOUT YOUR FAMILY</p><h2>Let’s plan your visit.</h2><p>Who’s coming, children’s ages, outfits and comfort with Santa. Your answers help Arman prepare; they don’t change your confirmed appointment.</p>{booking.questionnaireUrl && <a className="xm-button" href={booking.questionnaireUrl}>{booking.questionnaireComplete ? "Update your family details" : "Complete your family questionnaire"} ↗</a>}</section><dl className="xm-confirmation-dl"><div><dt>YOUR COLLECTION</dt><dd>{booking.package} · {booking.minutes} minutes · {booking.images} edited images · {booking.sets} sets{booking.albums ? ` · ${booking.albums} ten-page album(s), 20 photos each, hand-delivered` : booking.grinch ? " · The Grinch included" : ""}{booking.santa ? " · Santa included" : " · Without Santa"}</dd></div><div><dt>YOUR APPOINTMENT</dt><dd>{dateLabel(booking.date!, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {timeLabel(booking.time!)} Vancouver time</dd></div><div><dt>YOUR STUDIO</dt><dd>{booking.address}, {booking.postalCode}<br />{booking.arrivalNotes}</dd></div>{booking.delivery && <div><dt>SANTA’S SPECIAL DELIVERY</dt><dd>Letter for {booking.delivery.letterNames}<br />{booking.delivery.line1}{booking.delivery.line2 && <><br />{booking.delivery.line2}</>}<br />{booking.delivery.city}, BC {booking.delivery.postalCode}<br />A Santa letter and complimentary printed keepsake will be mailed separately. Postal arrival dates vary. Optional albums are hand-delivered across Greater Vancouver through Surrey after your selections are finalized.</dd></div>}<div><dt>PAYMENT + REFERENCE</dt><dd>{money(booking.paidCents || 0)} CAD paid · {booking.reference}</dd></div></dl><section className="xm-confirmation-prep"><h2>Before you come</h2><ul>{preparation.map(([title, detail]) => <li key={title}><strong>{title}</strong><p>{detail}</p></li>)}</ul></section><p className="xm-small">{booking.cancellationPolicy}</p><div className="xm-confirmation-actions"><button className="xm-button" onClick={() => addToCalendar(booking)}>Add to your calendar ↗</button>{!booking.invoiceUrl && <p className="xm-small">Stripe is preparing your paid invoice. Your receipt is emailed separately; refresh this page shortly for the invoice link.</p>}{booking.invoiceUrl && <a className="xm-text-link" href={booking.invoiceUrl} target="_blank" rel="noreferrer">View paid invoice ↗</a>}<a className="xm-text-link" href="/christmas">Back to Christmas sessions</a></div></> : booking?.status === "expired" ? <><h1>This appointment<br /><em>wasn’t completed.</em></h1><p>The payment hold has expired. Please return to the calendar to choose an available appointment.</p><a className="xm-button" href="/christmas#booking">Choose an appointment ↗</a></> : <><p className="xm-eyebrow">CHECKING YOUR PAYMENT</p><h1>One little<br /><em>moment.</em></h1><p aria-live="polite">{booking?.status === "pending" ? "Your payment has not been confirmed yet. If you completed payment, keep this page open for a moment. Contact Arman before paying again." : "We’re securely checking your payment and appointment."}</p></>}
    <p className="xm-small" style={{ marginTop: 25 }}>Need a hand? <a href="mailto:i@armanarai.com">i@armanarai.com ↗</a></p>
  </div></div>;
}
