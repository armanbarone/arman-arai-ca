"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { listenForContactClicks, pricingThankYouPath, trackPageView, trackWeddingInquiry } from "@/lib/analytics";
import { CTA_LABEL, FORM_ID, longDate, weekdayOf } from "@/lib/ads/pricing-request";
import { PROMISE_LABEL, PROMISE_NOTE, PROMISE_OPTIONS, REFERRAL_OPTIONS } from "@/lib/contact-form";
import { weddingToday } from "@/lib/wedding-availability";
import WeddingCalendar from "./wedding-calendar";
import { ATTRIBUTION_KEYS, fbclidFromCookie, gclidFromCookie } from "@/lib/attribution";
import styles from "./vancouver.module.css";
import funnel from "./inquiry.module.css";

/* The pricing-request funnel: ad → this page → a short form → a thank-you
 * screen that plays their answers back and opens their pricing guide.
 *
 * One action. The form's button is the only button on the page, and every
 * other call to action on it is that same button, with the same words,
 * scrolling back to the form. WhatsApp and text sit under it as a quiet line.
 * Every WhatsApp, email, phone or text tap is reported to GA4 as contact_click.
 *
 * The form is the conversion, not the call. It is sent before anything else
 * happens, so a couple who never books a time has still left a name, an email
 * and their wedding plans, and the auto-reply (lib/auto-reply.ts) reaches their
 * inbox within a minute. The page checks no calendar and says nothing about
 * whether a date is free.
 *
 * A sent form moves the browser to its own URL,
 * /wedding-photography/<city>-pricing/thank-you, so Google Ads can count an
 * inquiry by URL. That page loads the Google tag only when this tab really
 * sent the form (sessionStorage, see ThankYouFromSession); a typed or shared
 * visit to it loads no tags and cannot count as a conversion.
 */


export type FunnelCollection = { slug: string; name: string; hoursLabel: string; price: number; items: string[] };

type Sent = {
  market: string;
  sentAt: number;
  names: string;
  email: string;
  phone: string;
  date?: string;
  location: string;
  referral: string;
  message: string;
  /** True when the server has queued the auto-reply email. */
  emailed: boolean;
};

const FunnelContext = createContext<(sent: Sent) => void>(() => {});

const SENT_KEY = "aa_ca_pricing_inquiry_v1";
const REPORTED_KEY = "aa_ca_pricing_inquiry_reported_v1";
const SENT_LIFETIME = 2 * 60 * 60 * 1000;

/** True when the sent form was stored, so the thank-you URL can show it. */
function storeSent(sent: Sent) {
  try { sessionStorage.setItem(SENT_KEY, JSON.stringify(sent)); return true; } catch { return false; }
}
function readSent(market: string): Sent | null {
  try {
    const sent = JSON.parse(sessionStorage.getItem(SENT_KEY) || "null") as Sent | null;
    if (!sent || sent.market !== market || typeof sent.names !== "string" || Date.now() - sent.sentAt > SENT_LIFETIME) return null;
    return sent;
  } catch { return null; }
}
const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;

type Contact = { phone: string; phoneE164: string };
const whatsappHref = (phoneE164: string, text: string) => `https://wa.me/${phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

/** WhatsApp, text or call, as the secondary line under the form and on the
 *  thank-you view. The number is inside the tel: link rather than loose text
 *  after "text", so a tap dials what it says it will and listenForContactClicks
 *  can report the call (contactMethodOf reads tel: as "phone"). */
export function MessageLinks({ phone, phoneE164, city }: Contact & { city: string }) {
  return <><a href={whatsappHref(phoneE164, `Hi Arman, I'm asking about wedding photography in ${city}.`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>, <a href={`sms:${phoneE164}`}>text</a> or <a href={`tel:${phoneE164}`}>call <span className={funnel.nowrap}>{phone}</span></a></>;
}

export default function InquiryFunnel({ children, collections, city, page, phone, phoneE164, travelNote }: {
  children: ReactNode;
  collections: FunnelCollection[];
  city: string;
  /** "wedding-photography/vancouver-pricing", as the calendar's utm_content. */
  page: string;
  travelNote: string;
} & Contact) {
  const [sent, setSent] = useState<Sent | null>(null);
  useEffect(listenForContactClicks, []);
  const show = (value: Sent) => { setSent(value); window.scrollTo({ top: 0 }); };
  const edit = () => {
    setSent(null);
    requestAnimationFrame(() => document.getElementById(FORM_ID)?.scrollIntoView());
  };
  return <FunnelContext.Provider value={show}>
    <div hidden={!!sent}>{children}</div>
    {sent && <ThankYou sent={sent} collections={collections} city={city} page={page} phone={phone} phoneE164={phoneE164} travelNote={travelNote} onEdit={edit} />}
  </FunnelContext.Provider>;
}

/* The nine questions every form on this site asks (lib/contact-form.ts).
   The mobile number, how they found me, the message and the spam-folder
   promise are all required now (owner, 2026-10-14): the reply he sends within
   the hour is often a text, and a lead with no number is a lead he cannot
   chase. The "minimal" variant is the same questions in a tighter order for
   the hero form, not a shorter set. */
export function InquiryForm({ city, market, page, variant = "standard", className }: {
  city: string; market: string; page: string; variant?: "standard" | "minimal"; className?: string;
}) {
  const send = useContext(FunnelContext);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [today, setToday] = useState("");
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const sending = useRef(false);

  useEffect(() => {
    setToday(weddingToday());
    const q = new URLSearchParams(window.location.search);
    const captured: Record<string, string> = { page: window.location.pathname, referrer: document.referrer || "" };
    for (const key of ATTRIBUTION_KEYS) {
      const value = q.get(key);
      if (value) captured[key] = value;
    }
    captured.gclid = q.get("gclid") || q.get("wbraid") || q.get("gbraid") || gclidFromCookie();
    captured.fbclid = q.get("fbclid") || fbclidFromCookie();
    setAttribution(captured);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setStatus("sending");
    setError("");
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) || "").trim();
    const payload = {
      type: "wedding-inquiry",
      subjectLabel: "Wedding inquiry — " + city,
      pricingMarket: market,
      firstName: value("firstName"),
      lastName: value("lastName"),
      email: value("email"),
      phone: value("phone"),
      referral: value("referral"),
      weddingDate: value("weddingDate"),
      location: value("location"),
      message: value("message"),
      promise: value("promise"),
      company: value("company"), // honeypot
      ...attribution,
    };
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || data.success !== true) throw new Error(data.error || "That did not send. Please try again or email i@armanarai.com.");
      const sent: Sent = {
        market,
        sentAt: Date.now(),
        names: [payload.firstName, payload.lastName].filter(Boolean).join(" "),
        email: payload.email,
        phone: payload.phone,
        date: payload.weddingDate || undefined,
        location: payload.location,
        referral: payload.referral,
        message: payload.message,
        emailed: data.autoReply === true,
      };
      // Keep the conversion URL and the session gate for genuine submissions.
      if (storeSent(sent)) { window.location.assign(pricingThankYouPath(market)); return; }
      try { trackWeddingInquiry(page, String(sent.sentAt)); } catch { /* Analytics must never interrupt a lead. */ }
      setStatus("idle");
      send(sent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not send.");
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  const minimal = variant === "minimal";
  const field = (id: string, label: React.ReactNode, input: React.ReactNode, wide = false) =>
    <div className={[styles.checkField, wide ? styles.checkWide : ""].filter(Boolean).join(" ")} key={id}>
      <label htmlFor={id}>{label}</label>
      {input}
    </div>;

  return <form className={[styles.check, className].filter(Boolean).join(" ")} onSubmit={onSubmit} aria-labelledby={minimal ? "inquiry-title" : "inq-title"}>
    <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.honeypot} />
    {!minimal && <p className={styles.checkTitle} id="inq-title">Let’s start with you</p>}
    <div className={styles.checkRow}>
      {field("inq-first", "First name", <input id="inq-first" name="firstName" type="text" required maxLength={60} autoComplete="given-name" placeholder="Sarah" />)}
      {field("inq-last", "Last name", <input id="inq-last" name="lastName" type="text" required maxLength={60} autoComplete="family-name" placeholder="Chen" />)}
      {field("inq-email", "Email", <input id="inq-email" name="email" type="email" required maxLength={100} autoComplete="email" />)}
      {field("inq-phone", "Mobile", <input id="inq-phone" name="phone" type="tel" required maxLength={40} autoComplete="tel" placeholder="604 000 0000" />)}
      {field("inq-referral", "How did you hear about me?", <select id="inq-referral" name="referral" required defaultValue="">
        <option value="" disabled>Choose your option</option>
        {REFERRAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>, true)}
      {field("inq-date", <>Wedding date <span>Optional</span></>, <input id="inq-date" name="weddingDate" type="date" min={today || undefined} />)}
      {field("inq-venue", "Wedding location", <input id="inq-venue" name="location" type="text" required maxLength={120} placeholder="City, or the venue if it’s booked" />)}
      {field("inq-message", "Your message", <textarea id="inq-message" name="message" required maxLength={4000} rows={3} placeholder="Tell me about the day. Anything you know so far, or anything you want to ask." />, true)}
      {field("inq-promise", PROMISE_LABEL, <select id="inq-promise" name="promise" required defaultValue="">
        <option value="" disabled>Say you promise</option>
        {PROMISE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>, true)}
    </div>
    <p className={styles.checkMicro}>{PROMISE_NOTE}</p>
    {status === "error" && <p className={styles.checkError} role="alert">{error}</p>}
    <button className={styles.checkButton} type="submit" disabled={status === "sending"}>
      {status === "sending" ? "Sending…" : CTA_LABEL}<span aria-hidden="true">↗</span>
    </button>
    <p className={styles.checkMicro}>I reply personally within 60 minutes. <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a>.</p>
  </form>;
}

type ThankYouProps = {
  collections: FunnelCollection[];
  city: string;
  page: string;
  travelNote: string;
} & Contact;

/** The thank-you URL's content: the sent form from this tab, or a pointer
 *  back to the form. Tags start here, and only for a real submission. */
export function ThankYouFromSession({ market, ...props }: ThankYouProps & { market: string }) {
  const [sent, setSent] = useState<Sent | null | undefined>(undefined);
  useEffect(() => {
    const found = readSent(market);
    setSent(found);
    if (!found) return;
    const stopListening = listenForContactClicks();
    try {
      trackPageView();
      if (sessionStorage.getItem(REPORTED_KEY) !== String(found.sentAt)) {
        trackWeddingInquiry(`/${props.page}`, String(found.sentAt));
        sessionStorage.setItem(REPORTED_KEY, String(found.sentAt));
      }
    } catch { /* Analytics must never interrupt a lead. */ }
    return stopListening;
  }, [market, props.page]);
  if (sent === undefined) return null;
  if (!sent) return <section className={funnel.thanks} aria-labelledby="thanks-title">
    <header className={styles.header}><a className={styles.wordmark} href={`/${props.page}`}>Arman Arai<span>WEDDING PHOTOGRAPHY</span></a></header>
    <div className={funnel.thanksGrid}><div className={funnel.thanksCopy}>
      <p className={styles.eyebrow}>{props.city} wedding photography</p>
      <h1 id="thanks-title" className={funnel.thanksTitle}>Your pricing starts here.</h1>
      <p className={funnel.thanksLead}>This page opens once you send the short form. It takes a minute.</p>
      <p style={{ marginTop: 24 }}><a className={styles.button} href={`/${props.page}#${FORM_ID}`}>{CTA_LABEL} <span aria-hidden="true">↗</span></a></p>
    </div></div>
  </section>;
  return <ThankYou sent={sent} {...props} />;
}

/* The thank-you screen. Their inquiry played back, then the four things the
   email is about to carry, so a couple whose email lands in Promotions still
   has the pricing, the guide, the vendor list and a way to book a call. The
   per-inquiry /guide/<id> page is gone (owner, 2026-10-14); the published
   guide at /wedding-guide is what everything links to now. */
function ThankYou({ sent, collections, city, page, phone, phoneE164, travelNote, onEdit }: ThankYouProps & { sent: Sent; onEdit?: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  const when = sent.date ? `${weekdayOf(sent.date)}, ${longDate(sent.date)}` : "";
  const recap: [string, string][] = [
    ["Date", when || "To be decided"],
    ["Where", sent.location || "To be decided"],
    ["Mobile", sent.phone],
    ...(sent.message ? [["What you told me", sent.message] as [string, string]] : []),
  ];

  return <section className={funnel.thanks} aria-labelledby="thanks-title">
    <header className={styles.header}><span className={styles.wordmark}>Arman Arai<span>WEDDING PHOTOGRAPHY</span></span></header>
    <div className={funnel.thanksGrid}>
      <div className={funnel.thanksCopy}>
        <p className={styles.eyebrow}>Your inquiry · {city}</p>
        <h1 id="thanks-title" ref={heading} tabIndex={-1} className={funnel.thanksTitle}>Thank you, {sent.names}.</h1>
        <p className={funnel.thanksLead}>
          I&rsquo;ll read this properly and reply to you myself within 60 minutes.
          {sent.emailed ? ` Everything below is on its way to ${sent.email} as well, so check your spam and promotions folders if it hasn’t landed in a few minutes.` : ""}
        </p>
        <dl className={funnel.recap}>{recap.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <ol className={funnel.pricing} aria-label="Your pricing">
          {collections.map((collection) => <li key={collection.slug} className={funnel.collection}>
            <details>
              <summary>
                <span className={funnel.collectionName}>{collection.name}<small>{collection.hoursLabel}</small></span>
                <span className={funnel.collectionPrice}>{money(collection.price)}</span>
              </summary>
              <ul>{collection.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          </li>)}
        </ol>
        <p className={funnel.pricingNote}>Canadian dollars before tax. {travelNote} Tap a collection to see everything in it.</p>
        <p style={{ marginTop: 20 }}>
          <a className={`${styles.button} ${funnel.guideButton}`} href="/wedding-guide">Open the wedding guide <span aria-hidden="true">↗</span></a>
        </p>
        <p className={funnel.guideNote}>
          How I work a wedding day, start to finish. The people I&rsquo;d put on your day are on <a href="/preferred-vendors">my preferred vendor list</a>.
        </p>
      </div>
      <div className={funnel.nextStep}>
        <p className={styles.eyebrow}>The next step</p>
        <h2 className={funnel.nextTitle}>A free 30-minute<br /><em>video call.</em></h2>
        <p>Pick a time that suits you. We&rsquo;ll walk through your day and the collection that fits. No obligation.</p>
        <WeddingCalendar page={page} theme="dark" classes={styles} prefill={{ name: sent.names, email: sent.email }} />
      </div>
      <div className={funnel.noCall}>
        <p><strong>Rather not do a call?</strong> That&rsquo;s fine. {sent.emailed ? "Reply to my email, or message me on " : `I’ll reply to ${sent.email} within the hour, or message me on `}<MessageLinks phone={phone} phoneE164={phoneE164} city={city} />.</p>
        <p className={styles.checkMicro}>A signed contract and a non-refundable 30% deposit secure your date.</p>
        {onEdit
          ? <button type="button" className={styles.checkAnother} onClick={onEdit}>Change my details</button>
          : <a className={styles.checkAnother} href={`/${page}#${FORM_ID}`}>Change my details</a>}
      </div>
    </div>
  </section>;
}
