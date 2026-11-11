"use client";
import { money, type Availability } from "../../lib/christmas/catalog";
import { depositQuote } from "../../lib/christmas/payment-plan";

export default function ChristmasReservations({ data, loading, albums, busy, onAlbums, onBook }: {
  data: Availability; loading: boolean; albums: number; busy: boolean; onAlbums: (n: number) => void; onBook: () => void;
}) {
  const capacity = data.capacity, quote = depositQuote(albums);
  const soldOut = capacity?.remaining === 0;
  const open = !loading && data.mode !== "closed" && !!capacity?.checkoutAvailable;
  return <div className="xm-reservation-panel">
    <div className="xm-reservation-count" role="status" aria-live="polite">
      {loading || !capacity ? <p>{data.mode === "closed" && !loading ? data.message || "Reservations are currently closed." : "Checking remaining sessions…"}</p> : <>
        <strong>{capacity.remaining}<span> / {capacity.limit}</span></strong><p>family sessions remaining</p>
        <div className="xm-reservation-meter" aria-hidden="true"><span style={{ width: `${capacity.remaining / capacity.limit * 100}%` }} /></div>
      </>}
    </div>
    <p className="xm-reservation-inclusions">30 minutes · 3 Christmas sets · Santa · 10 edited photos</p>
    <details className="xm-reservation-albums"><summary>Add a printed album <span>Optional extra</span></summary><p>10 pages · 20 photos. Hand-delivered across Greater Vancouver through Surrey.</p>
      <label htmlFor="reservation-albums">Number of printed albums</label><select id="reservation-albums" value={albums} onChange={e => onAlbums(Number(e.target.value))} disabled={busy}>
        <option value={0}>No albums</option><option value={1}>1 album · $67 + tax</option><option value={2}>2 albums · $122 + tax</option><option value={3}>3 albums · $167 + tax</option>
      </select><p>Album buyers receive 20 edited digital photos. Albums are added to your remaining balance.</p>
    </details>
    <p className="xm-reservation-payment"><strong>$50 today</strong><span>toward {money(quote.total)} CAD including tax</span></p>
    <button type="button" className="xm-button" disabled={!open || busy} onClick={onBook}>{soldOut ? "Sold out" : "Reserve my family session · $50"} <span aria-hidden="true">↗</span></button>
    {!loading && capacity && capacity.remaining > 0 && !capacity.checkoutAvailable && <p role="status">The remaining sessions are currently in checkout. Please try again shortly.</p>}
    <p className="xm-small">Date and time arranged personally after payment. If we can’t agree on a suitable appointment, your deposit is fully refundable.</p>
  </div>;
}
