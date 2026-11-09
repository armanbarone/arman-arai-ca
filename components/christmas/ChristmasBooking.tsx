"use client";
import { useEffect, useRef, useState } from "react";
import { dateLabel, money, sessionQuote, timeLabel, type Availability } from "../../lib/christmas/catalog";

interface Props {
  data: Availability;
  loading: boolean;
  selectedDate: string;
  selectedSlot: string;
  albums: number;
  busy: boolean;
  onDate: (date: string) => void;
  onSlot: (id: string) => void;
  onAlbums: (count: number) => void;
  onBook: () => void;
}

export default function ChristmasBooking({ data, loading, selectedDate, selectedSlot, albums, busy, onDate, onSlot, onAlbums, onBook }: Props) {
  const [month, setMonth] = useState(11);
  const timesRef = useRef<HTMLDivElement>(null), bookingRef = useRef<HTMLDivElement>(null);
  const slots = data.slots.filter(s => s.santa), daySlots = slots.filter(s => s.date === selectedDate);
  const selected = daySlots.find(s => s.id === selectedSlot && s.available);
  const quote = sessionQuote(albums);
  const firstWeekday = new Date(Date.UTC(2026, month - 1, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(2026, month, 0)).getUTCDate();

  useEffect(() => {
    if (!selectedDate) return;
    setMonth(Number(selectedDate.slice(5, 7)));
    if (window.matchMedia("(max-width: 700px)").matches) timesRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [selectedDate]);
  useEffect(() => {
    if (selectedSlot) bookingRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [selectedSlot]);

  function changeMonth(next: number) { setMonth(next); onDate(""); }

  return <div className={`xm-booking-card${selectedDate ? " xm-booking-has-date" : ""}`}>
    <div className="xm-booking-columns">
      <div className="xm-date-step">
        <p className="xm-booking-step">1 <span>Choose a date</span></p>
        <div className="xm-calendar-heading"><h3>{month === 11 ? "November" : "December"} <span>2026</span></h3><div>
          <button type="button" disabled={month === 11} onClick={() => changeMonth(11)} aria-label="Show November">←</button>
          <button type="button" disabled={month === 12} onClick={() => changeMonth(12)} aria-label="Show December">→</button>
        </div></div>
        <div className="xm-calendar" aria-label={`${month === 11 ? "November" : "December"} 2026 appointments`}>
          <div className="xm-weekdays">{["S", "M", "T", "W", "T", "F", "S"].map((day, i) => <span key={i}>{day}</span>)}</div>
          <div className="xm-days">
            {Array.from({ length: firstWeekday }, (_, i) => <span key={`empty-${i}`} />)}
            {Array.from({ length: dayCount }, (_, i) => {
              const date = `2026-${month}-${String(i + 1).padStart(2, "0")}`, day = slots.filter(s => s.date === date);
              const open = day.some(s => s.available), sold = day.some(s => s.status === "sold");
              return <button type="button" key={date} disabled={loading || date > "2026-12-20"} aria-label={`${dateLabel(date)}, ${open ? "appointments available" : sold ? "sold out" : "closed"}`} aria-pressed={selectedDate === date} aria-controls="xm-date-times" className={`${selectedDate === date ? "selected" : ""} ${!open ? "xm-date-unavailable" : ""}`} onClick={() => onDate(date)}>
                <span>{i + 1}</span>{open ? <i /> : date <= "2026-12-20" && <small>{sold ? "Sold out" : "Closed"}</small>}
              </button>;
            })}
          </div>
        </div>
        <p className="xm-calendar-key"><span /> Available dates · November 9–December 20</p>
        {loading && <p className="xm-booking-note" role="status">Loading the booking calendar…</p>}
      </div>
      {selectedDate && <div id="xm-date-times" className="xm-time-step" ref={timesRef}>
        <p className="xm-booking-step">2 <span>Choose a time</span></p>
        <h3 className="xm-selected-date">{dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })}</h3>
        <div className="xm-times" role="group" aria-label={`Times for ${dateLabel(selectedDate)}`}>
          {daySlots.map(s => <button type="button" key={s.id} disabled={!s.available} className={selectedSlot === s.id ? "selected" : ""} aria-pressed={selectedSlot === s.id} onClick={() => onSlot(s.id)}>
            {timeLabel(s.time)}{!s.available && <small>{s.status === "sold" ? "Sold out" : s.status === "reserved" ? "Reserved" : "Closed"}</small>}
          </button>)}
        </div>
        {!daySlots.some(s => s.available) && <p className="xm-booking-note" role="status">{daySlots.some(s => s.status === "sold") ? "This date is sold out. Please choose another date." : "No appointments on this date. Please choose another date."}</p>}
        {selected && <div className="xm-booking-ready" ref={bookingRef}>
          <p className="xm-booking-selection">{timeLabel(selected.time)} · 30 minutes with Santa</p>
          <section className="xm-booking-albums" aria-labelledby="xm-album-title">
            <p className="xm-album-optional">OPTIONAL EXTRA</p>
            <h4 id="xm-album-title">Add a printed album</h4>
            <p>10 pages · 20 photos. Hand-delivered across Greater Vancouver through Surrey.</p>
            <label htmlFor="xm-album-count">Number of printed albums</label><select id="xm-album-count" value={albums} onChange={event => onAlbums(Number(event.target.value))}>
              <option value={0}>No albums</option><option value={1}>1 album · $67 + tax</option><option value={2}>2 albums · $122 + tax</option><option value={3}>3 albums · $167 + tax</option>
            </select>
            <p>First $67 · Second $55 · Third $45. Plus tax.<br />Album buyers receive 20 edited digital photos.</p>
          </section>
          <p className="xm-booking-total"><span>Total <small>CAD, including tax</small></span><strong>{money(quote.total)}</strong></p>
          <button type="button" className="xm-button" disabled={busy} onClick={onBook}>Book &amp; pay {money(quote.total)} <span aria-hidden="true">↗</span></button>
          <p className="xm-booking-reassurance">{data.mode === "preview" ? "Preview only · No payment or booking" : "Secure payment with Stripe · Your session guide follows by email"}</p>
        </div>}
      </div>}
    </div>
  </div>;
}
