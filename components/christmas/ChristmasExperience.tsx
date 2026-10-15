"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PACKAGES, PREVIEW_AVAILABILITY, dateLabel, timeLabel, money, type Availability, type PackageId } from "../../lib/christmas/catalog";
import "./christmas.css";

type Checkout = { clientSecret: string; publishableKey: string; returnUrl: string; expiresAt: number };
type Embedded = { mount: (el: HTMLElement) => void; destroy: () => void };
declare global { interface Window { Stripe?: (key: string) => { initEmbeddedCheckout: (options: { clientSecret: string; onComplete: () => void }) => Promise<Embedded> } } }
const Arrow = () => <span aria-hidden="true">↗</span>;
const Star = () => <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M15 0v30M0 15h30M4.4 4.4l21.2 21.2M4.4 25.6L25.6 4.4" stroke="currentColor" strokeWidth="1" /></svg>;
const Check = () => <span className="xm-check" aria-hidden="true">✓</span>;

function StripePayment({ checkout }: { checkout: Checkout }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let disposed = false, embedded: Embedded | undefined;
    (async () => {
      if (!window.Stripe) await new Promise<void>((resolve, reject) => {
        let script = document.querySelector<HTMLScriptElement>("script[data-christmas-stripe]");
        if (!script) { script = document.createElement("script"); script.src = "https://js.stripe.com/v3/"; script.dataset.christmasStripe = "true"; document.head.appendChild(script); }
        script.addEventListener("load", () => resolve(), { once: true });
        script.addEventListener("error", () => reject(Error("Payment could not load. Check your connection and try again.")), { once: true });
      });
      if (disposed || !window.Stripe) return;
      embedded = await window.Stripe(checkout.publishableKey).initEmbeddedCheckout({ clientSecret: checkout.clientSecret, onComplete: () => window.location.assign(checkout.returnUrl) });
      if (disposed) embedded.destroy(); else if (ref.current) embedded.mount(ref.current);
    })().catch(e => setError(e instanceof Error ? e.message : "Payment could not load. Please contact Arman."));
    return () => { disposed = true; embedded?.destroy(); };
  }, [checkout]);
  return <div><p className="xm-payment-note">Your appointment is held until {new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver" }).format(checkout.expiresAt)} Vancouver time while you complete payment.</p>{error && <p role="alert" className="xm-error">{error}</p>}<div ref={ref} className="xm-stripe" /><p className="xm-small">Card details are processed securely by Stripe.</p></div>;
}

export default function ChristmasExperience({ preview = false }: { preview?: boolean }) {
  const [data, setData] = useState<Availability>(preview ? PREVIEW_AVAILABILITY : { mode: "closed", slots: [], location: "Vancouver, BC", cancellationPolicy: "", publishableKey: "" });
  const [loading, setLoading] = useState(!preview);
  const [selectedPackage, setSelectedPackage] = useState<PackageId>("santa");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [month, setMonth] = useState(11);
  const [step, setStep] = useState<"booking" | "details" | "payment" | "demo">("booking");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
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
    const first = eligible.find(s => s.available);
    if (!selectedDate && first) { setSelectedDate(first.date); setMonth(Number(first.date.slice(5, 7))); }
  }, [data, selectedPackage, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step === "details" || step === "payment" || step === "demo") modalRef.current?.showModal();
    else modalRef.current?.close();
  }, [step]);

  function choosePackage(id: PackageId) {
    if (checkout) return;
    setSelectedPackage(id); setSelectedSlot(""); setSelectedDate(""); setError("");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function closeModal() { setStep("booking"); setError(""); if (checkout) { setCheckout(null); setSelectedSlot(""); } }

  async function beginPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    if (!slot || !slot.available || (pkg.santa && !slot.santa)) { setError("Please choose another available appointment."); return; }
    if (data.mode === "preview") { setStep("demo"); return; }
    if (data.mode !== "live") { setError("Bookings are not open yet."); return; }
    const f = new FormData(e.currentTarget); setBusy(true);
    try {
      const response = await fetch("/api/christmas/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        slotId: slot.id, packageId: pkg.id, name: f.get("name"), email: f.get("email"), phone: f.get("phone"), consent: f.get("consent") === "on", website: f.get("website") || "", acceptedPolicy: data.cancellationPolicy, expectedSubtotal: pkg.price,
      }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not open payment.");
      setCheckout(result); setStep("payment");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  const firstWeekday = new Date(Date.UTC(2026, month - 1, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(2026, month, 0)).getUTCDate();
  return <div className="xm" data-christmas-preview={preview ? "true" : undefined}>
    <a className="xm-skip" href="#christmas-main">Skip to content</a>
    {data.mode === "preview" && <div className="xm-preview-bar">PRIVATE DESIGN PREVIEW · Sample appointments · No payments or bookings are taken</div>}
    <header className="xm-header"><a className="xm-brand" href="https://www.armanarai.ca">Arman Arai<span>PHOTOGRAPHS TO COME BACK TO</span></a><nav aria-label="Christmas sessions"><a href="#experience">The experience</a><a href="#packages">The collections</a><a href="#faq">Good to know</a><a className="xm-nav-cta" href="#booking">Find your moment <Arrow /></a></nav></header>
    <main id="christmas-main">
      <section className="xm-hero">
        <div className="xm-hero-copy"><p className="xm-eyebrow"><span className="xm-dot" /> THE CHRISTMAS SESSIONS · VANCOUVER 2026</p>
          <h1>A little <em>Christmas.</em><br />A lot of you.</h1>
          <p className="xm-lead">The little hands. The big cuddles. That look when Santa opens his book. Let’s keep a little of this Christmas, just as it feels.</p>
          <a href="#booking" className="xm-button">Find your family’s session <Arrow /></a>
          <div className="xm-hero-meta"><span>November 27 — December 23</span><i /><span>Collections from $249 CAD + tax</span></div>
          <p className="xm-hero-foot">Private sessions. A thoughtfully styled Christmas studio. Your people, together.</p>
        </div>
        <figure className="xm-hero-image"><img src="/christmas/family-fireside.webp" alt="AI-generated set concept: a family cuddling on an ivory sofa beside a Christmas tree and fireplace" width="1536" height="1024" fetchPriority="high" /><figcaption>2026 styling concept · AI-generated image</figcaption><div className="xm-photo-note"><Star /><span>A season that passes.<br /><em>A photograph that stays.</em></span></div></figure>
      </section>
      <div className="xm-strip"><span>FAMILY PORTRAITS</span><Star /><span>PRIVATE SANTA VISITS</span><Star /><span>WARM LIGHT & REAL CONNECTION</span><Star /><span>VANCOUVER, BC</span></div>

      <section id="experience" className="xm-experience xm-wrap">
        <div className="xm-experience-image"><img src="/christmas/santa-story.webp" alt="AI-generated concept: children sharing a storybook with Santa in a Christmas living room" width="1024" height="1280" loading="lazy" /><span className="xm-image-label">AI-generated set concept</span></div>
        <div className="xm-experience-copy"><p className="xm-eyebrow">A LITTLE SPACE FOR CHRISTMAS MAGIC</p><h2>More than a photo.<br /><em>A moment of their own.</em></h2>
          <p>A quiet, private session with time to settle in. Family portraits by the tree, siblings beside the window, and a story with Santa when you choose a Santa collection.</p>
          <p>We’ll guide you gently, keep the little ones moving, and make room for the smiles you couldn’t have planned.</p>
          <div className="xm-detail-row"><span>01</span><div><h3>Come as your family</h3><p>One household, up to five people. Contact us first for a larger group.</p></div></div>
          <div className="xm-detail-row"><span>02</span><div><h3>Let them warm up</h3><p>No pressure to sit with Santa. Parents can stay close, and we follow your child’s comfort.</p></div></div>
          <div className="xm-detail-row"><span>03</span><div><h3>Keep the photographs</h3><p>Your selected, edited images arrive in a private gallery, ready to download, print and share.</p></div></div>
          <a className="xm-text-link" href="#packages">Find the collection that fits <Arrow /></a>
        </div>
      </section>

      <section id="packages" className="xm-packages"><div className="xm-wrap"><div className="xm-section-heading"><p className="xm-eyebrow">THREE WAYS TO KEEP THIS CHRISTMAS</p><h2>Your family.<br className="xm-mobile-break" /> <em>Your little tradition.</em></h2><p>Choose your collection, find a time, and make it yours.</p></div>
        <div className="xm-package-grid">{PACKAGES.map(p => <article key={p.id} className={`xm-package ${p.id === "santa" ? "xm-package-featured" : ""}`}>
          <div className="xm-package-top"><span className="xm-eyebrow">{p.tag}</span>{p.santa && <span className="xm-santa-label">Santa included</span>}</div>
          <h3>{p.name}</h3><p className="xm-package-description">{p.description}</p><div className="xm-price">${p.price / 100}<span>CAD + applicable tax</span></div>
          <ul>{p.features.map(f => <li key={f}><Check />{f}</li>)}</ul>
          {!p.santa && <p className="xm-no-santa">Family portraits · Santa is not included</p>}
          <button onClick={() => choosePackage(p.id)} className="xm-button">Choose this collection <Arrow /></button>
        </article>)}</div>
        <p className="xm-package-foot">All collections are for one household, up to five people. Full payment reserves your appointment. No consultation needed.</p>
      </div></section>

      <section className="xm-window xm-wrap"><div><p className="xm-eyebrow">SMALL MOMENTS. A WHOLE SEASON.</p><h2>For the ones<br />who make it <em>Christmas.</em></h2><p>The fireplace, the tree, the soft light by the window. Different corners of one welcoming space, styled to feel like a Christmas you want to remember.</p><p className="xm-small">The photographs on this page are AI-generated styling concepts, rather than previous client sessions. Final sets and the Santa performer may differ.</p></div><figure><img src="/christmas/winter-window.webp" alt="AI-generated styling concept: siblings on a pine bench by a winter window and small Christmas tree" width="1536" height="1024" loading="lazy" /><figcaption>Winter window · AI-generated set concept</figcaption></figure></section>

      <section id="booking" className="xm-booking"><div className="xm-wrap"><div className="xm-section-heading"><p className="xm-eyebrow">MAKE A LITTLE ROOM IN THE CALENDAR</p><h2>Your Christmas<br className="xm-mobile-break" /> <em>starts here.</em></h2><p>One family. One appointment. A little time that’s all yours.</p></div>
        {data.mode === "live" && remaining > 0 && remaining <= 3 && <p className="xm-availability-note" role="status">{remaining === 1 ? "One appointment remains" : `${remaining} appointments remain`} for this collection in the current release.</p>}
        {data.mode === "preview" && <p className="xm-availability-note">Try the booking experience below. These are sample dates; no appointments are reserved.</p>}
        {data.mode === "closed" && !loading ? <div className="xm-closed"><Star /><h3>A little Christmas is on its way.</h3><p>{data.message || "Bookings are not open yet."}</p><a className="xm-button" href="mailto:i@armanarai.com?subject=Christmas%20sessions%202026">Ask about Christmas sessions <Arrow /></a></div> : <div className="xm-booking-grid">
          <div className="xm-calendar-panel"><label className="xm-eyebrow" htmlFor="xm-collection">01 · YOUR COLLECTION</label><select id="xm-collection" value={selectedPackage} onChange={e => { setSelectedPackage(e.target.value as PackageId); setSelectedDate(""); setSelectedSlot(""); }}>{PACKAGES.map(p => <option key={p.id} value={p.id}>{p.name} · {money(p.price)} CAD</option>)}</select>
            <p className="xm-eyebrow xm-calendar-step">02 · YOUR DATE</p><div className="xm-calendar-heading"><h3>{month === 11 ? "November" : "December"} <span>2026</span></h3><div><button disabled={month === 11} onClick={() => setMonth(11)} aria-label="Show November">←</button><button disabled={month === 12} onClick={() => setMonth(12)} aria-label="Show December">→</button></div></div>
            <div className="xm-calendar" aria-label={`${month === 11 ? "November" : "December"} 2026 appointments`}><div className="xm-weekdays">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}</div><div className="xm-days">{Array.from({ length: firstWeekday }, (_, i) => <span key={`empty-${i}`} />)}{Array.from({ length: dayCount }, (_, i) => {
              const day = i + 1, date = `2026-${month}-${String(day).padStart(2, "0")}`;
              const open = eligible.filter(s => s.date === date && s.available).length;
              return <button key={date} disabled={!open || loading} aria-label={`${dateLabel(date)}, ${open} appointments available${data.mode === "preview" ? ", sample schedule" : ""}`} aria-pressed={selectedDate === date} className={selectedDate === date ? "selected" : ""} onClick={() => { setSelectedDate(date); setSelectedSlot(""); }}><span>{day}</span>{open > 0 && <i />}</button>;
            })}</div></div><p className="xm-calendar-key"><span /> Dates with released appointments · Vancouver time</p>
            <p className="xm-eyebrow xm-calendar-step">03 · YOUR TIME</p><div className="xm-time-heading">{selectedDate ? dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" }) : "Choose an available date"}{pkg.santa && <span>Santa included</span>}</div>
            <div className="xm-times">{eligible.filter(s => s.date === selectedDate).map(s => <button key={s.id} disabled={!s.available} className={selectedSlot === s.id ? "selected" : ""} aria-pressed={selectedSlot === s.id} onClick={() => { setSelectedSlot(s.id); setError(""); }}>{timeLabel(s.time)}{!s.available && <small>Unavailable</small>}</button>)}</div>
            {!eligible.some(s => s.available) && !loading && <p>No appointments currently available for this collection. Try another collection or <a href="mailto:i@armanarai.com">email Arman</a>.</p>}
            {loading && <p aria-live="polite">Loading the booking calendar…</p>}
          </div>
          <aside className="xm-cart"><p className="xm-eyebrow">YOUR LITTLE CHRISTMAS</p><img src={pkg.santa ? "/christmas/santa-story.webp" : "/christmas/family-fireside.webp"} alt="AI-generated styling concept for your selected collection" width="600" height="380" loading="lazy" /><h3>{pkg.name}</h3><p>{pkg.minutes} minutes · {pkg.images} edited photographs</p><div className="xm-cart-detail"><span>Your appointment</span><strong>{slot ? `${dateLabel(slot.date)} · ${timeLabel(slot.time)}` : "Choose your date + time"}</strong></div><div className="xm-cart-detail"><span>Santa</span><strong>{pkg.santa ? "Private visit included" : "Family session, without Santa"}</strong></div><div className="xm-cart-detail"><span>Location</span><strong>{data.location}</strong></div><div className="xm-cart-price"><span>Collection subtotal</span><strong>{money(pkg.price)}</strong></div><p className="xm-small">CAD. Applicable taxes calculated in Stripe before payment.</p>
            <button className="xm-button" disabled={!slot || !slot.available || busy} onClick={() => { setError(""); setStep("details"); }}>{data.mode === "preview" ? "Preview your booking" : "Reserve this appointment"} <Arrow /></button><p className="xm-cart-reassurance">{data.mode === "preview" ? "Preview only · No card details collected" : "Secure payment with Stripe · Full payment reserves your time"}</p>
          </aside>
        </div>}
        {error && step === "booking" && <p className="xm-error" role="alert">{error}</p>}
      </div></section>

      <section id="faq" className="xm-faq xm-wrap"><div><p className="xm-eyebrow">BEFORE YOUR LITTLE VISIT</p><h2>Good<br /><em>to know.</em></h2><p>Something else on your mind?<br /><a href="mailto:i@armanarai.com">Ask Arman ↗</a></p></div><div className="xm-faq-list">{[
        ["Is Santa included in every collection?", "Santa is included in A little Santa magic and The whole Christmas story, on dates marked for Santa. Christmas together is a family portrait session without Santa."],
        ["What if my child feels shy around Santa?", "There is no pressure to sit on Santa’s lap or pose alone. We can start with family photographs, read a story from a little distance, and keep a parent close. Your child sets the pace."],
        ["How many people can come?", "Collections include one household of up to five people. Please email before booking a larger family or extended-family group so we can check the space and timing."],
        ["When will we receive our photographs?", "Your included edited digital photographs arrive in a private download gallery within five days. Sessions from December 18 onward have a 48-hour turnaround. Book by December 21 if you need images before Christmas. RAW files are not included."],
        ["What should we wear?", "Cream, olive, burgundy, warm neutrals, and simple knitwear suit the sets. Coordinate rather than matching every outfit. Arrive dressed and ready; a short session works best without outfit changes."],
        ["Where is the studio?", data.mode === "live" ? `${data.location}. Arrival instructions are included with your booking confirmation. Please contact us before booking if you have access requirements.` : "The sessions are planned for Vancouver, BC. The exact studio address, arrival information and access details will be confirmed before paid bookings open."],
        ["Can we cancel or reschedule?", data.cancellationPolicy || "The cancellation and rescheduling policy will be published before bookings open. Please contact Arman with any questions before purchasing."],
        ["Are these photographs from your studio?", "These are AI-generated styling concepts showing the planned atmosphere and set direction, not photographs of previous clients or the completed studio. Final sets and the Santa performer may differ."],
      ].map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
      <section className="xm-ending"><Star /><p className="xm-eyebrow">THIS YEAR, KEEP A LITTLE OF THE MAGIC.</p><h2>They’re only this little<br /><em>this Christmas.</em></h2><a className="xm-button xm-button-light" href="#booking">Find your family’s moment <Arrow /></a></section>
    </main>
    <footer className="xm-footer"><a className="xm-brand" href="https://www.armanarai.ca">Arman Arai<span>CHRISTMAS SESSIONS · VANCOUVER</span></a><div><a href="mailto:i@armanarai.com">i@armanarai.com</a><a href="https://www.armanarai.ca">Wedding photography ↗</a></div><div className="xm-footer-bottom"><span>© 2026 Arasaka Inc., operating as Arman Arai.</span><span><a href="https://www.armanarai.ca/privacy-policy">Privacy</a> · <a href="https://www.armanarai.ca/terms-of-service">Terms</a></span><span>Styling images are AI-generated concepts.</span></div></footer>
    <div className="xm-mobile-cta"><span>Christmas sessions<small>From $249 CAD + tax</small></span><a className="xm-button" href="#booking">Find a time <Arrow /></a></div>
    <dialog ref={modalRef} className="xm-dialog" onCancel={e => { e.preventDefault(); if (!busy) closeModal(); }} onClick={e => { if (e.target === e.currentTarget && !busy) closeModal(); }}><div className="xm-dialog-inner"><button className="xm-dialog-close" aria-label="Close booking" onClick={closeModal} disabled={busy}>×</button>
      {step === "demo" ? <div className="xm-demo-complete"><Star /><p className="xm-eyebrow">YOUR BOOKING PREVIEW</p><h2>A little Christmas,<br /><em>ready to book.</em></h2><p>{pkg.name}<br />{slot && `${dateLabel(slot.date)} · ${timeLabel(slot.time)}`}<br />{money(pkg.price)} CAD + applicable tax</p><p className="xm-demo-notice">This is a design preview. No payment has been taken, no contact details have been sent, and no appointment has been reserved.</p><button className="xm-button" onClick={closeModal}>Back to the Christmas page <Arrow /></button></div>
      : step === "payment" && checkout ? <><p className="xm-eyebrow">YOUR APPOINTMENT · SECURE PAYMENT</p><h2>A little Christmas,<br /><em>almost yours.</em></h2><StripePayment checkout={checkout} /></>
      : <><p className="xm-eyebrow">YOUR APPOINTMENT · YOUR DETAILS</p><h2>Let’s make<br /><em>it yours.</em></h2><div className="xm-dialog-summary"><strong>{pkg.name}</strong><span>{slot && `${dateLabel(slot.date)} · ${timeLabel(slot.time)}`} · {pkg.minutes} minutes</span><span>{money(pkg.price)} CAD + applicable tax</span></div><form onSubmit={beginPayment} className="xm-contact-form"><label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={100} required placeholder="First and last name" /></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={35} required placeholder="For your appointment" /></label><label className="xm-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><div className="xm-policy"><p>{data.cancellationPolicy}</p><label><input type="checkbox" name="consent" required /><span>I agree to the booking policy above and the <a href="https://www.armanarai.ca/terms-of-service" target="_blank" rel="noreferrer">terms</a>. I understand the selected collection’s inclusions and appointment time.</span></label></div>{error && <p role="alert" className="xm-error">{error}</p>}<button className="xm-button" disabled={busy}>{busy ? "Opening secure payment…" : data.mode === "preview" ? "Preview checkout" : "Continue to secure payment"} <Arrow /></button><p className="xm-small">{data.mode === "preview" ? "Preview only. These details are not sent or saved." : "Your appointment is confirmed only after successful payment. Your contact details are used for your booking."}</p></form></>}
    </div></dialog>
  </div>;
}
