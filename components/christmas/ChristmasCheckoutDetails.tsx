"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CART_CONSENT, CART_WINDOW_MS } from "../../lib/christmas/cart-copy";
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "../../lib/portal/business";

interface Cart { id: string; token: string; expiresAt: number }
export default function ChristmasCheckoutDetails({ slotId, albums, preview, busy, error, policy, paymentTerms, onPayment, onExpired }: {
  slotId: string; albums: number; preview: boolean; busy: boolean; error: string; policy: string; paymentTerms: string;
  onPayment: (event: FormEvent<HTMLFormElement>) => void; onExpired: () => void;
}) {
  const [cart, setCart] = useState<Cart | null>(null), [now, setNow] = useState(Date.now());
  const [contact, setContact] = useState<{ name: string; email: string } | null>(null);
  const [saving, setSaving] = useState(false), [message, setMessage] = useState("");
  const cartRequest = useRef<Promise<Cart> | null>(null);
  useEffect(() => {
    let active = true;
    if (preview) { setCart({ id: "preview", token: "preview", expiresAt: Date.now() + CART_WINDOW_MS }); return; }
    cartRequest.current ??= fetch("/api/christmas/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId, albums }) }).then(async r => {
      const value = await r.json(); if (!r.ok) throw Error(value.error || "Checkout could not open.");
      return value as Cart;
    });
    cartRequest.current.then(value => { if (active) setCart(value); }).catch(e => { if (active) setMessage(e.message); });
    return () => { active = false; };
  }, [slotId, albums, preview]);
  useEffect(() => { const interval = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(interval); }, []);
  const seconds = cart ? Math.min(CART_WINDOW_MS / 1000, Math.max(0, Math.ceil((cart.expiresAt - now) / 1000))) : 0;
  const expired = !!cart && seconds === 0;
  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!cart || expired) return;
    const data = new FormData(event.currentTarget), name = String(data.get("name")).trim(), email = String(data.get("email")).trim().toLowerCase();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const reminders = submitter?.getAttribute("name") === "reminders" && submitter.getAttribute("value") === "yes";
    setSaving(true); setMessage("");
    try {
      if (!preview) {
        const r = await fetch("/api/christmas/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cart.id, token: cart.token, name, email, reminders }) });
        const value = await r.json(); if (!r.ok) throw Error(value.error || "Your details could not be saved.");
      }
      setContact({ name, email });
    } catch (e) { setMessage(e instanceof Error ? e.message : "Please try again."); }
    finally { setSaving(false); }
  }
  return <div className="xm-checkout-details">
    <div className={`xm-cart-clock${seconds <= 60 ? " xm-clock-ending" : ""}`}><div><strong>{expired ? "Your checkout window has ended" : "Complete your details in"}</strong><p>{expired ? "Choose an available appointment to start again." : "Your selected time is checked again before payment."}</p></div>{cart && !expired && <span role="timer" aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>}</div>
    {expired ? <div role="status"><p>Your appointment has not been booked. No payment was taken here.</p><button type="button" className="xm-button" onClick={onExpired}>Back to available times ↗</button></div> : !contact ? <form className="xm-contact-form" onSubmit={saveContact}>
      <p className="xm-eyebrow">01 · WHERE CAN WE REACH YOU?</p>
      <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={100} required placeholder="First and last name" /></label>
      <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" /></label>
      {message && <p className="xm-error" role="alert">{message}</p>}
      <div className="xm-checkout-contact-actions">
        <button type="submit" name="reminders" value="yes" className="xm-button" disabled={!cart || saving}>{saving ? "Saving…" : "Continue with reminders"} ↗</button>
        <button type="submit" name="reminders" value="no" className="xm-checkout-skip-reminders" disabled={!cart || saving}>Continue without reminders</button>
      </div>
      <details className="xm-checkout-reminder-details"><summary>Reminder details &amp; privacy</summary><div><p>{CART_CONSENT}</p><address>{BUSINESS.tradeName} ({BUSINESS.legalName})<br />{BUSINESS_ADDRESS_ONE_LINE}<br /><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> · {BUSINESS.phone}</address><a href="https://www.armanarai.ca/privacy-policy" target="_blank" rel="noreferrer">Privacy policy</a></div></details>
      {preview && <p className="xm-small">Preview only. Nothing is sent or saved.</p>}
    </form> : <form className="xm-contact-form" onSubmit={onPayment}>
      <p className="xm-eyebrow">02 · THE LITTLE DETAILS</p>
      <p className="xm-checkout-contact">{contact.name}<br />{contact.email}</p>
      <input type="hidden" name="name" value={contact.name} /><input type="hidden" name="email" value={contact.email} />
      <input type="hidden" name="cartId" value={cart?.id || ""} /><input type="hidden" name="cartToken" value={cart?.token || ""} />
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={35} required placeholder="For your appointment" /></label>
      <fieldset><legend>Santa’s special delivery</legend><p className="xm-small">For your mailed Santa letter and printed keepsake. BC postage is included.</p>
        <label>Names for Santa’s letter<input name="letterNames" maxLength={160} required placeholder="Children’s first names or your family name" /></label>
        <label>Mailing street address<input name="mailLine1" autoComplete="shipping address-line1" minLength={3} maxLength={150} required /></label>
        <label>Apartment / unit (if applicable)<input name="mailLine2" autoComplete="shipping address-line2" maxLength={100} /></label>
        <label>City<input name="mailCity" autoComplete="shipping address-level2" minLength={2} maxLength={100} required /></label>
        <label>BC postal code<input name="mailPostalCode" autoComplete="shipping postal-code" maxLength={7} pattern="[Vv][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]" required placeholder="V7L 1A1" /></label>
        <p className="xm-small">British Columbia, Canada. Contact Arman before booking if your letter needs to be sent elsewhere.</p>
      </fieldset>
      {albums > 0 && <label className="xm-activity-consent"><input type="checkbox" name="albumDeliveryConsent" required /><span>My album delivery address is in Greater Vancouver, as far as Surrey. Delivery will be arranged after my photo selections; pre-Christmas delivery is not guaranteed.</span></label>}
      <label className="xm-activity-consent"><input type="checkbox" name="shareActivity" /><span>Optional: show my first name and city in a recent-booking message on this page. My contact details and appointment time stay private.</span></label>
      <label className="xm-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className="xm-policy"><p>{policy}</p><p>{paymentTerms}</p><label><input type="checkbox" name="consent" required /><span>I agree to the booking and payment policy above and the <a href="https://www.armanarai.ca/terms-of-service" target="_blank" rel="noreferrer">terms</a>. I understand the selected collection’s inclusions and appointment time.</span></label></div>
      {error && <p role="alert" className="xm-error">{error}</p>}
      <button className="xm-button" disabled={busy || !cart}>{busy ? "Opening secure payment…" : preview ? "Preview $50 deposit checkout" : "Pay $50 deposit with Stripe"} ↗</button>
      <p className="xm-small">{preview ? "Preview only. These details are not sent or saved." : "Stripe gives you a separate 35-minute payment window. Your appointment is confirmed only after successful payment."}</p>
    </form>}
  </div>;
}
