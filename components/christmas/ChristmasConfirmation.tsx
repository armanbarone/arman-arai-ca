"use client";
import { useEffect, useState } from "react";
import { dateLabel, timeLabel, money } from "../../lib/christmas/catalog";
import "./christmas.css";
interface Confirmation { status: string; reference?: string; date?: string; time?: string; package?: string; minutes?: number; images?: number; santa?: boolean; paidCents?: number; invoiceUrl?: string; address?: string; postalCode?: string; arrivalNotes?: string; email?: string; cancellationPolicy?: string; error?: string }
function escapeCalendar(text: string) { return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,"); }
function addToCalendar(c: Confirmation) {
  const start = new Date(`${c.date}T${c.time}:00-08:00`), end = new Date(start.getTime() + (c.minutes || 20) * 60000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Arman Arai//Christmas Sessions//EN", "BEGIN:VEVENT", `UID:${c.reference}@armanarai.ca`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escapeCalendar(`Christmas photographs · ${c.package}`)}`, `LOCATION:${escapeCalendar(`${c.address}, ${c.postalCode}`)}`, `DESCRIPTION:${escapeCalendar(`${c.arrivalNotes || ""}\nReference: ${c.reference}\ni@armanarai.com`)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "Christmas-session.ics"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ChristmasConfirmation() {
  const [booking, setBooking] = useState<Confirmation | null>(null), [error, setError] = useState("");
  useEffect(() => {
    let active = true, timeout: ReturnType<typeof setTimeout>, attempts = 0;
    const params = new URLSearchParams(window.location.search), slot = params.get("slot"), token = params.get("token");
    if (!slot || !token) { setError("This booking link is incomplete. Please check your confirmation or email Arman."); return; }
    async function check() {
      try {
        const response = await fetch(`/api/christmas/status?slot=${encodeURIComponent(slot!)}&token=${encodeURIComponent(token!)}`, { cache: "no-store", referrerPolicy: "no-referrer" });
        const result = await response.json() as Confirmation;
        if (!active) return;
        if (!response.ok) { setError(result.error || "We could not verify this booking."); return; }
        setBooking(result);
        if (result.status === "pending" && attempts++ < 15) timeout = setTimeout(check, 2500);
      } catch { if (active) setError("Payment could not be verified yet. Refresh shortly or contact Arman before making another payment."); }
    }
    void check(); return () => { active = false; clearTimeout(timeout); };
  }, []);
  return <div className="xm xm-confirmation"><div className="xm-confirmation-card"><a className="xm-brand" href="/christmas">Arman Arai<span>CHRISTMAS SESSIONS · NORTH VANCOUVER</span></a>
    {error ? <><h1>Let’s check<br /><em>your booking.</em></h1><p role="alert">{error}</p></> : booking?.status === "paid" ? <><p className="xm-eyebrow">PAYMENT RECEIVED · APPOINTMENT CONFIRMED</p><h1>A little Christmas,<br /><em>all yours.</em></h1><p>Your appointment is confirmed. A booking email is being sent to {booking.email}.</p><dl className="xm-confirmation-dl"><div><dt>YOUR COLLECTION</dt><dd>{booking.package} · {booking.minutes} minutes · {booking.images} edited images{booking.santa ? " · Santa included" : " · Without Santa"}</dd></div><div><dt>YOUR APPOINTMENT</dt><dd>{dateLabel(booking.date!, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {timeLabel(booking.time!)} Vancouver time</dd></div><div><dt>YOUR STUDIO</dt><dd>{booking.address}, {booking.postalCode}<br />{booking.arrivalNotes}</dd></div><div><dt>PAYMENT + REFERENCE</dt><dd>{money(booking.paidCents || 0)} CAD paid · {booking.reference}</dd></div></dl><p className="xm-small">{booking.cancellationPolicy}</p><div className="xm-confirmation-actions"><button className="xm-button" onClick={() => addToCalendar(booking)}>Add to your calendar ↗</button>{booking.invoiceUrl && <a className="xm-text-link" href={booking.invoiceUrl} target="_blank" rel="noreferrer">View paid invoice ↗</a>}<a className="xm-text-link" href="/christmas">Back to Christmas sessions</a></div></> : booking?.status === "expired" ? <><h1>This appointment<br /><em>wasn’t completed.</em></h1><p>The payment hold has expired. Please return to the calendar to choose an available appointment.</p><a className="xm-button" href="/christmas#booking">Choose an appointment ↗</a></> : <><p className="xm-eyebrow">CHECKING YOUR PAYMENT</p><h1>One little<br /><em>moment.</em></h1><p aria-live="polite">{booking?.status === "pending" ? "Your payment has not been confirmed yet. If you completed payment, keep this page open for a moment. Contact Arman before paying again." : "We’re securely checking your payment and appointment."}</p></>}
    <p className="xm-small" style={{ marginTop: 25 }}>Need a hand? <a href="mailto:i@armanarai.com">i@armanarai.com ↗</a></p>
  </div></div>;
}
