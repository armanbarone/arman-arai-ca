"use client";
import { useEffect, useRef, useState, type FormEvent, type ImgHTMLAttributes } from "react";
import { PACKAGES, PREVIEW_AVAILABILITY, dateLabel, timeLabel, money, type Availability, type PackageId } from "../../lib/christmas/catalog";
import { DEPOSIT_PLAN, depositQuote, balanceDeadline } from "../../lib/christmas/payment-plan";
import { trackChristmasCheckout } from "../../lib/analytics";
import { advertisingOptOut } from "../../lib/advertising-preferences";
import ChristmasAtmosphere from "./ChristmasAtmosphere";
import ChristmasStorybook, { ChristmasCharacter } from "./ChristmasStorybook";
import ChristmasCheckoutDetails from "./ChristmasCheckoutDetails";
import { ChristmasSimpleIncludes } from "./ChristmasSimpleContent";
import ChristmasBooking from "./ChristmasBooking";
import "./christmas.css";
import "./christmas-simple.css";
import "./christmas-booking.css";

const Arrow = () => <span aria-hidden="true">↗</span>;
const Star = () => <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M15 0v30M0 15h30M4.4 4.4l21.2 21.2M4.4 25.6L25.6 4.4" stroke="currentColor" strokeWidth="1" /></svg>;
const Check = () => <span className="xm-check" aria-hidden="true">✓</span>;
function ProtectedPhoto(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <span className="xm-protected-photo" onContextMenu={event => event.preventDefault()} onDragStart={event => event.preventDefault()}>
    <img {...props} draggable={false} />
    <span className="xm-photo-shield" aria-hidden="true" />
  </span>;
}

export default function ChristmasExperience({ preview = false, storybook = false, simple = false }: { preview?: boolean; storybook?: boolean; simple?: boolean }) {
  const [data, setData] = useState<Availability>(preview ? PREVIEW_AVAILABILITY : { mode: "closed", slots: [], location: "North Vancouver, BC", cancellationPolicy: "", publishableKey: "" });
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(!preview);
  const selectedPackage: PackageId = "santa";
  const [albums, setAlbums] = useState(0);
  const quote = depositQuote(albums), subtotal = quote.subtotal;
  const [activity, setActivity] = useState("");
  const seenActivity = useRef(new Set<string>());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [step, setStep] = useState<"booking" | "details" | "demo">("booking");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const modalRef = useRef<HTMLDialogElement>(null);
  const paymentPending = useRef(false);
  const pkg = PACKAGES.find(p => p.id === selectedPackage)!;
  const eligible = data.slots.filter(s => !pkg.santa || s.santa);
  const remaining = eligible.filter(s => s.available).length;
  const slot = data.slots.find(s => s.id === selectedSlot);

  useEffect(() => {
    if (preview) return;
    let active = true;
    async function refresh() {
      try {
        const r = await fetch("/api/christmas/availability", { cache: "no-store" });
        if (!r.ok) throw Error();
        const d = await r.json() as Availability;
        if (active) setData(d);
      } catch { if (active) setError("The calendar could not refresh. Please try again shortly."); }
      finally { if (active) setLoading(false); }
    }
    void refresh(); const interval = window.setInterval(refresh, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [preview]);

  useEffect(() => {
    if (preview) return;
    const p = new URLSearchParams(location.search);
    if (p.get("cancelled") !== "1" || !p.get("slot") || !p.get("token")) return;
    const body = { slot: p.get("slot"), token: p.get("token") };
    history.replaceState(null, "", location.pathname + "#booking");
    let active = true;
    fetch("/api/christmas/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => {
      const result = await r.json();
      if (!active) return;
      if (result.paid && result.confirmationUrl) { location.assign(result.confirmationUrl); return; }
      if (!r.ok) throw Error(result.error || "The payment hold could not be released yet.");
      setNotice("Payment wasn’t completed. Your temporary hold has been released; choose another time whenever you’re ready.");
      const refreshed = await fetch("/api/christmas/availability", { cache: "no-store" });
      if (active && refreshed.ok) setData(await refreshed.json());
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [preview]);

  useEffect(() => {
    if (preview || activity) return;
    const next = data.recentBookings?.find(b => !seenActivity.current.has(b.id));
    if (next) { seenActivity.current.add(next.id); setActivity(next.text); }
  }, [data.recentBookings, preview, activity]);
  useEffect(() => {
    if (!activity) return;
    const timeout = window.setTimeout(() => setActivity(""), 6500);
    return () => clearTimeout(timeout);
  }, [activity]);
  useEffect(() => {
    if (selectedSlot && !data.slots.some(s => s.id === selectedSlot && s.available)) setSelectedSlot("");
  }, [data.slots, selectedSlot]);
  useEffect(() => {
    if (step === "details" || step === "demo") modalRef.current?.showModal();
    else modalRef.current?.close();
  }, [step]);

  useEffect(() => {
    if (preview) return;
    const params = new URLSearchParams(location.search), date = params.get("date"), quantity = Number(params.get("albums"));
    if (date && /^2026-(11|12)-\d{2}$/.test(date)) setSelectedDate(date);
    if (params.has("albums") && Number.isInteger(quantity) && quantity >= 0 && quantity <= 3) setAlbums(quantity);
  }, [preview]);

  function choosePackage(_id: PackageId) {
    setSelectedSlot(""); setSelectedDate(""); setError("");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function closeModal() { setStep("booking"); setError(""); }

  async function beginPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    if (paymentPending.current) return;
    if (!slot || !slot.available || (pkg.santa && !slot.santa)) { setError("Please choose another available appointment."); return; }
    if (data.mode === "preview") { setStep("demo"); return; }
    if (data.mode !== "live" && data.mode !== "test") { setError("Bookings are not open yet."); return; }
    const f = new FormData(e.currentTarget); paymentPending.current = true; setBusy(true);
    let handedOff = false;
    try {
      const response = await fetch("/api/christmas/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        cartId: f.get("cartId"), cartToken: f.get("cartToken"), slotId: slot.id, packageId: pkg.id, name: f.get("name"), email: f.get("email"), phone: f.get("phone"), consent: f.get("consent") === "on", website: f.get("website") || "", acceptedPolicy: data.cancellationPolicy, expectedSubtotal: subtotal, expectedTotal: quote.total, paymentPlan: DEPOSIT_PLAN, expectedDueNow: quote.dueNow, albums, shareActivity: f.get("shareActivity") === "on", albumDeliveryConsent: f.get("albumDeliveryConsent") === "on",
        delivery: { letterNames: f.get("letterNames"), line1: f.get("mailLine1"), line2: f.get("mailLine2") || "", city: f.get("mailCity"), postalCode: f.get("mailPostalCode"), province: "BC", country: "CA" },
        analyticsOptOut: advertisingOptOut(), fbclid: new URLSearchParams(window.location.search).get("fbclid") || undefined,
      }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not open payment.");
      if (!result.checkoutUrl || new URL(result.checkoutUrl).origin !== "https://checkout.stripe.com") throw Error("Payment could not open. Please contact Arman.");
      if (result.checkoutTracking) await trackChristmasCheckout(result.checkoutTracking).catch(() => { /* Keep payment available when measurement is blocked. */ });
      handedOff = true;
      window.location.assign(result.checkoutUrl);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { if (!handedOff) { paymentPending.current = false; setBusy(false); } }
  }

  return <div className={`xm${simple ? " xm-simple" : ""}`} data-christmas-preview={preview ? "true" : undefined}>
    <ChristmasAtmosphere />
    <a className="xm-skip" href="#christmas-main">Skip to content</a>
    {data.mode === "preview" && <div className="xm-preview-bar">PRIVATE DESIGN PREVIEW · Sample appointments · No payments or bookings are taken</div>}
    {data.mode === "test" && <div className="xm-preview-bar">STRIPE TEST CHECKOUT · Test cards only · No real charges · Separate test booking records</div>}
    <div className="xm-fairy-lights" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${i * .19}s` }} />)}</div>
    <main id="christmas-main">
      <section className="xm-hero">
        <div className="xm-hero-stars" aria-hidden="true"><span>✧</span><span>✦</span><span>✧</span><span>✦</span></div>
        {simple ? <div className="xm-hero-copy"><h1>Christmas photos.<br /><em>With Santa.</em></h1><p className="xm-lead">For families with kids.<br />A private 30-minute session<br />across three Christmas sets.</p><p className="xm-simple-price"><strong>$250</strong><span>CAD + GST</span></p><p className="xm-deposit-offer"><strong>Reserve with just $50 today</strong><span>Remaining balance due on arrival.</span></p><a href="#booking" className="xm-button">Reserve your session <Arrow /></a></div> : <div className="xm-hero-copy"><p className="xm-eyebrow"><span /> A VERY NORTH VANCOUVER CHRISTMAS · 2026 <span /></p><h1>Come in.<br /><em>It’s Christmas.</em></h1><p className="xm-lead">A fireside kind of Christmas. The people you love.<br className="xm-desktop-break" /> And a little visit from Santa, included.</p><a href="#booking" className="xm-button">Find your Christmas moment <Arrow /></a><p className="xm-hero-dates">NOVEMBER 9 – DECEMBER 20 <span>✦</span> NORTH VANCOUVER, BC</p></div>}
        <div className="xm-photo-trio">
          <figure className="xm-photo xm-photo-left"><ProtectedPhoto src="/christmas/santa-portrait-2026.webp?v=clean-1" alt="Santa and a little boy sharing a playful moment beside the Christmas tree" width="1200" height="1789" loading="eager" /><figcaption>A little Santa magic <span>✧</span></figcaption></figure>
          <figure className="xm-photo xm-photo-main"><ProtectedPhoto src="/christmas/family-portrait-2026.webp?v=clean-1" alt="Parents cuddling their baby by the Christmas tree and fireplace" width="1122" height="1402" fetchPriority="high" /><figcaption>The ones who make it Christmas.</figcaption><span className="xm-photo-seal" aria-hidden="true">Made for<br /><b>your</b><br />family</span></figure>
          <figure className="xm-photo xm-photo-right"><ProtectedPhoto src="/christmas/family-window-2026.webp?v=clean-1" alt="A family together on a Christmas sofa beside a snowy forest window" width="1200" height="900" loading="eager" /><figcaption>A Christmas moment, together <span>✧</span></figcaption></figure>
        </div>
      </section>
      {simple ? <ChristmasSimpleIncludes /> : <>
      <div className="xm-ribbon"><span>PRIVATE FAMILY SESSIONS</span><Star /><span>$250 WITH SANTA · THREE CHRISTMAS SETS</span><Star /><span>PHOTOGRAPHS BY ARMAN ARAI</span></div>
      {storybook && <ChristmasStorybook />}

      <section id="experience" className="xm-experience xm-wrap">
        <div className="xm-story-image"><ProtectedPhoto src="/christmas/santa-portrait-2026.webp?v=clean-1" alt="Santa and a little boy laughing together in the Christmas studio" width="1200" height="1789" loading="lazy" /><div className="xm-story-caption">Psst… he’s making<br /><em>a little time for you.</em></div></div>
        <div className="xm-letter"><span className="xm-letter-stamp" aria-hidden="true">NORTH POLE<br />✦<br />SPECIAL DELIVERY</span><p className="xm-eyebrow">FOR THE LITTLE BELIEVERS. AND THE BIG ONES.</p><h2>A little wonder.<br /><em>A whole lot of Christmas.</em></h2><p>There’s a tree full of twinkling lights, a cozy corner by the fireplace, and room for your family to make a little magic of your own.</p><p>Every session includes Santa and photographs across all three Christmas sets. Read a story, share a wish, enjoy cookies and warm milk. Then watch the post for a Santa letter addressed to your little ones, with a small complimentary printed keepsake as our thank-you gift tucked inside.</p><div className="xm-letter-note"><span aria-hidden="true">♡</span><p>Shy around Santa? That’s okay. No lap-sitting required, no pressure to smile on cue. A parent can stay close, and your child sets the pace.</p></div><p className="xm-letter-signature">With a little Christmas magic,<br /><span>Arman</span></p></div>
      </section>

      <section className="xm-portrait-gallery xm-wrap" aria-label="More Christmas portraits">
        <figure><ProtectedPhoto src="/christmas/toddler-reindeer-2026.webp?v=clean-1" alt="A smiling toddler riding a plush Christmas reindeer beside the tree" width="1024" height="1536" loading="lazy" /><figcaption>A little reindeer joy.</figcaption></figure>
        <figure><ProtectedPhoto src="/christmas/reindeer-glow-2026.webp?v=clean-1" alt="A little girl cuddling an illuminated reindeer among snowy Christmas trees" width="1200" height="900" loading="lazy" /><figcaption>All aglow for Christmas.</figcaption></figure>
      </section>

      <section id="packages" className="xm-packages"><div className="xm-wrap"><div className="xm-section-heading"><p className="xm-eyebrow">A LITTLE SOMETHING FOR YOUR FAMILY</p><h2>One session.<br /><em>All the magic.</em></h2><p>Family photographs, a private Santa visit, and memories to bring home.</p></div>
        <div className="xm-package-grid">{PACKAGES.map(p => <article key={p.id} className={`xm-package ${p.id === "santa" ? "xm-package-featured" : ""}`}>
          <div className="xm-package-ornament" aria-hidden="true">{p.santa ? "✦" : "❄"}</div><div className="xm-package-top"><span className="xm-eyebrow">{p.tag}</span>{p.santa && <span className="xm-santa-label">Santa’s on the guest list</span>}</div>
          <h3>{p.name}</h3><p className="xm-package-description">{p.description}</p><div className="xm-price">{money(p.price)}<span>CAD + GST · $262.50 total</span></div>
          <ul>{p.features.map(f => <li key={f}><Check />{f}</li>)}</ul>
          {!p.santa && <p className="xm-no-santa">Family portraits · Santa is not included</p>}
          <button onClick={() => choosePackage(p.id)} className="xm-button">{p.santa ? "Book a visit with Santa" : "Book our family session"} <Arrow /></button>
        </article>)}</div>
        <p className="xm-package-foot">One household, up to five people. One $250 CAD package, plus 5% GST ($262.50 total). Reserve with $50 including GST. The remaining $212.50 is due on arrival before your session starts. Optional albums increase the balance, not today’s deposit.</p>
      </div></section>

      <section className="xm-album-banner" aria-labelledby="xm-album-banner-title"><div className="xm-album-banner-panel">
        <div className="xm-album-banner-copy"><p className="xm-eyebrow">OPTIONAL ADD-ON</p><h2 id="xm-album-banner-title">Add a printed<br /><em>Christmas album.</em></h2><p><strong>10 pages · 20 photos · $67 + tax</strong><br />Includes 20 edited digital photos.</p><p>Extra copies: $55 for the second, $45 for the third.<br />Hand-delivered across Greater Vancouver, through Surrey.</p><button type="button" className="xm-button" onClick={()=>{setAlbums(n => Math.max(1, n));document.getElementById("booking")?.scrollIntoView({behavior:"smooth",block:"start"});}}>Add an album <Arrow /></button></div>
        <div className="xm-album-banner-ornament" aria-hidden="true"><span>FIRST ALBUM</span><b>$67</b><small>PLUS TAX</small><i>✦</i></div>
      </div></section>

      <div className="xm-mail-gift" aria-label="More Christmas magic included"><div><span className="xm-gift-icon" aria-hidden="true">✉</span><strong>A letter from Santa</strong><p>A Santa letter mailed to the kids, with a small complimentary printed keepsake as our thank-you gift tucked inside. BC postage included.</p></div><div><span className="xm-gift-icon" aria-hidden="true">❄</span><strong>Three Christmas sets</strong><p>We photograph your family across all three styled corners: fireside, by the winter window, and on the cozy Christmas sofa.</p></div><div><span className="xm-gift-icon" aria-hidden="true">☕</span><strong>Cookies &amp; warm milk</strong><p>A little treat while you settle into the Christmas spirit. Please tell us about food allergies before your visit.</p></div></div>
      <div className="xm-little-things xm-wrap"><div><span aria-hidden="true">❄</span><strong>Come in from the cold</strong><p>A styled indoor Christmas studio.</p></div><div><span aria-hidden="true">♡</span><strong>Stay close. Be yourselves.</strong><p>Gentle guidance, room for little personalities.</p></div><div><span aria-hidden="true">✧</span><strong>Keep a little of the magic</strong><p>Edited photographs, ready to print and share.</p></div></div>

      </>}

      <section id="booking" className="xm-booking"><div className="xm-wrap"><div className="xm-section-heading">{simple ? <><p className="xm-eyebrow">CHRISTMAS WITH SANTA · $250 + GST</p><h2>Choose a time.<br /><em>Reserve with $50.</em></h2><p className="xm-calendar-deposit">No full payment required today.<br />$50 now · $212.50 on arrival before your session starts.<br /><small>$262.50 including GST. Optional albums added to the balance.</small></p></> : <><p className="xm-eyebrow">YOUR NAME ON THE NICE LIST</p><h2>Let’s save you<br /><em>a little Christmas.</em></h2><p>Pick your day. Choose your moment. We’ll keep the firelight warm.</p></>}</div>
        {data.mode === "live" && remaining > 0 && remaining <= 3 && <p className="xm-availability-note" role="status">{remaining === 1 ? "One appointment remains" : `${remaining} appointments remain`} for this collection in the current release.</p>}
        {data.mode === "closed" && !loading ? <div className="xm-closed"><Star /><h3>A little Christmas is on its way.</h3><p>{data.message || "Bookings are not open yet."}</p></div> : <ChristmasBooking data={data} loading={loading} selectedDate={selectedDate} selectedSlot={selectedSlot} albums={albums} busy={busy}
          onDate={date => { setSelectedDate(date); setSelectedSlot(""); setError(""); }}
          onSlot={id => { setSelectedSlot(id); setError(""); }} onAlbums={setAlbums}
          onBook={() => { setError(""); setStep("details"); }} />}

        {notice && <p className="xm-availability-note" role="status">{notice}</p>}
        {error && step === "booking" && <p className="xm-error" role="alert">{error}</p>}
      </div></section>

      {simple ? <div className="xm-character-finale xm-wrap" aria-hidden="true">{(["nutcracker", "grinch", "elf", "gnome", "snowman"] as const).map(character => <ChristmasCharacter key={character} character={character} />)}</div> : <section className="xm-ending"><div className="xm-ending-stars" aria-hidden="true">✧ <span>✦</span> ✧</div><p className="xm-eyebrow">ONE CHRISTMAS. YOUR PEOPLE. A LITTLE FOREVER.</p><h2>They’re only this little<br /><em>this Christmas.</em></h2><a className="xm-button" href="#booking">Make a little memory <Arrow /></a><p className="xm-ending-signature">See you by the Christmas tree.</p></section>}
    </main>
    <footer className="xm-footer xm-footer-minimal"><span>© 2026 Arman Arai</span><nav aria-label="Legal"><a href="https://www.armanarai.ca/privacy-policy">Privacy</a><a href="https://www.armanarai.ca/terms-of-service">Terms</a></nav></footer>
    {activity && <div className="xm-activity" role="status"><span aria-hidden="true">✓</span><div><strong>{activity}</strong><small>Recent confirmed booking</small></div><button type="button" aria-label="Dismiss recent booking" onClick={()=>setActivity("")}>×</button></div>}
    <div className="xm-mobile-cta"><span>{simple ? "Christmas with Santa" : "Your little Christmas"}<small>{simple ? "$250 + GST · $50 today" : "$250 with Santa · 3 sets + keepsake"}</small></span><a className="xm-button" href="#booking">{simple ? "Reserve $50" : "Find a time"} <Arrow /></a></div>
    <dialog ref={modalRef} aria-label="Book your Christmas session" className="xm-dialog" onCancel={e => { e.preventDefault(); if (!busy) closeModal(); }} onClick={e => { if (e.target === e.currentTarget && !busy) closeModal(); }}><div className="xm-dialog-inner"><button className="xm-dialog-close" aria-label="Close booking" onClick={closeModal} disabled={busy}>×</button>
      {step === "demo" ? <div className="xm-demo-complete"><Star /><p className="xm-eyebrow">YOUR BOOKING PREVIEW</p><h2>A little Christmas,<br /><em>ready to book.</em></h2><p>{pkg.name}<br />{slot && `${dateLabel(slot.date)} · ${timeLabel(slot.time)}`}<br />{money(subtotal)} + applicable taxes · {money(quote.total)} CAD total{albums ? ` · ${albums} album(s) included` : ""}<br />$50 today · {money(quote.balance)} due on arrival before your session starts.</p><p className="xm-demo-notice">This is a design preview. No payment has been taken, no contact details have been sent, and no appointment has been reserved.</p><button className="xm-button" onClick={closeModal}>Back to the Christmas page <Arrow /></button></div>
      : <><p className="xm-eyebrow">YOUR APPOINTMENT · YOUR DETAILS</p><h2>Let’s make<br /><em>it yours.</em></h2><div className="xm-dialog-summary"><strong>{pkg.name}</strong><span>{slot && `${dateLabel(slot.date)} · ${timeLabel(slot.time)}`} · Approximately {pkg.minutes} minutes</span><span>{money(quote.total)} CAD total, including tax{albums ? ` · ${albums} album(s) included` : ""}</span><strong>$50 deposit today · {money(quote.balance)} remaining</strong><span>Balance due {slot && balanceDeadline(slot.date, slot.time)}.</span></div>{step === "details" && slot && <ChristmasCheckoutDetails slotId={slot.id} albums={albums} preview={preview} busy={busy} error={error} policy={data.cancellationPolicy} paymentTerms={`$50 CAD including GST is charged today and credited to your ${money(quote.total)} CAD total. The remaining ${money(quote.balance)} CAD is due ${balanceDeadline(slot.date, slot.time)}.`} onPayment={beginPayment} onExpired={() => { closeModal(); setSelectedSlot(""); }} />}</>}
    </div></dialog>
  </div>;
}
