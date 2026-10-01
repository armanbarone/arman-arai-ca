"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { pricingThankYouPath, trackPageView, trackWeddingInquiry } from "@/lib/analytics";
import { BUDGET_OPTIONS, COVERAGE_OPTIONS, STEP_UP_REASON, longDate, recommendCollection, seasonOptions, weekdayOf } from "@/lib/ads/pricing-request";
import { weddingToday } from "@/lib/wedding-availability";
import WeddingCalendar from "./wedding-calendar";
import { ATTRIBUTION_KEYS, gclidFromCookie } from "@/lib/attribution";
import styles from "./vancouver.module.css";
import funnel from "./inquiry.module.css";

/* The pricing-request funnel: ad → this page → one form → pricing and the
 * calendar on the same screen.
 *
 * One action. The form's button is the only button on the page, and every
 * other call to action on it is that same button, with the same words,
 * scrolling back to the form. WhatsApp and text sit under it as a quiet line.
 *
 * The form is the conversion, not the call. It is sent before anything else
 * happens, so a couple who never books a time has still left a name, an email
 * and a mobile number, and the auto-reply (lib/auto-reply.ts) reaches their
 * inbox within a minute. The page checks no calendar and says nothing about
 * whether a date is free.
 *
 * A sent form moves the browser to its own URL,
 * /wedding-photography/<city>-pricing/thank-you, so Google Ads can count an
 * inquiry by URL. That page loads the Google tag only when this tab really
 * sent the form (sessionStorage, see ThankYouFromSession); a typed or shared
 * visit to it loads no tags and cannot count as a conversion.
 */

export const FORM_ID = "get-pricing";
export const CTA_LABEL = "Get Pricing";

export type FunnelCollection = { slug: string; name: string; hoursLabel: string; price: number; items: string[] };

type Sent = {
  market: string;
  sentAt: number;
  names: string;
  email: string;
  date?: string;
  season?: string;
  location: string;
  coverage: string;
  budget: string;
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

/** WhatsApp or text, as the secondary line under the form and on the thank-you view. */
export function MessageLinks({ phone, phoneE164, city }: Contact & { city: string }) {
  return <><a href={whatsappHref(phoneE164, `Hi Arman, I'm asking about wedding photography in ${city}.`)} target="_blank" rel="noopener noreferrer">WhatsApp</a> or <a href={`sms:${phoneE164}`}>text</a> <span className={funnel.nowrap}>{phone}</span></>;
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

export function InquiryForm({ city, market, page }: { city: string; market: string; page: string }) {
  const send = useContext(FunnelContext);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [today, setToday] = useState("");
  const [noDate, setNoDate] = useState(false);
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
      subjectLabel: `Pricing request — ${city}`,
      pricingMarket: market,
      name: value("names"),
      email: value("email"),
      phone: value("phone"),
      weddingDate: noDate ? "" : value("weddingDate"),
      weddingSeason: noDate ? value("weddingSeason") : "",
      location: value("location"),
      coverage: value("coverage"),
      budget: value("budget"),
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
        names: payload.name,
        email: payload.email,
        date: payload.weddingDate || undefined,
        season: payload.weddingSeason || undefined,
        location: payload.location,
        coverage: payload.coverage,
        budget: payload.budget,
        emailed: data.autoReply === true,
      };
      // Its own URL, so the conversion can be counted by URL. Only if storage
      // is blocked does the thank-you view open in place instead.
      if (storeSent(sent)) { window.location.assign(pricingThankYouPath(market)); return; }
      try { trackWeddingInquiry(page); } catch { /* Analytics must never interrupt a lead. */ }
      setStatus("idle");
      send(sent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not send.");
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  return <form className={styles.check} onSubmit={onSubmit} aria-labelledby="inq-title">
    <p className={styles.checkTitle} id="inq-title">Get your pricing</p>
    {/* Honeypot. No human ever sees this; anything that fills it is dropped. */}
    <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.honeypot} />
    <div className={styles.checkRow}>
      <div className={`${styles.checkField} ${styles.checkWide}`}>
        <label htmlFor="inq-names">Your names</label>
        <input id="inq-names" name="names" type="text" required maxLength={80} autoComplete="name" placeholder="e.g. Sarah & James" />
      </div>
      <div className={styles.checkField}>
        <label htmlFor="inq-email">Email</label>
        <input id="inq-email" name="email" type="email" required maxLength={100} autoComplete="email" />
      </div>
      <div className={styles.checkField}>
        <label htmlFor="inq-phone">Mobile</label>
        <input id="inq-phone" name="phone" type="tel" required maxLength={30} autoComplete="tel" inputMode="tel" />
      </div>
      <div className={styles.checkField}>
        <div className={funnel.labelRow}>
          <label htmlFor={noDate ? "inq-season" : "inq-date"}>{noDate ? "Roughly when" : "Wedding date"}</label>
          <button type="button" className={funnel.dateToggle} onClick={() => setNoDate((value) => !value)}>{noDate ? "I have a date" : "No date yet?"}</button>
        </div>
        {noDate
          ? <select id="inq-season" name="weddingSeason" required className={funnel.select} defaultValue=""><option value="" disabled>Choose</option>{(today ? seasonOptions(today) : []).map((season) => <option key={season}>{season}</option>)}</select>
          : <input id="inq-date" name="weddingDate" type="date" required min={today || undefined} />}
      </div>
      <div className={styles.checkField}>
        <label htmlFor="inq-where">Venue or area</label>
        <input id="inq-where" name="location" type="text" required maxLength={90} placeholder="Venue, or area" />
      </div>
      <div className={styles.checkField}>
        <label htmlFor="inq-coverage">Coverage</label>
        <select id="inq-coverage" name="coverage" required className={funnel.select} defaultValue=""><option value="" disabled>Choose</option>{COVERAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      </div>
      <div className={styles.checkField}>
        <label htmlFor="inq-budget">Photography budget</label>
        <select id="inq-budget" name="budget" required className={funnel.select} defaultValue=""><option value="" disabled>Choose</option>{BUDGET_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      </div>
    </div>
    {status === "error" && <p className={styles.checkError} role="alert">{error}</p>}
    <button className={styles.checkButton} type="submit" disabled={status === "sending"}>
      {status === "sending" ? "Sending…" : CTA_LABEL}
      <span aria-hidden="true">↗</span>
    </button>
    <p className={styles.checkMicro}>
      Your pricing appears straight away. Answered the same day, by me. <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a>.
    </p>
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
    try {
      trackPageView();
      if (sessionStorage.getItem(REPORTED_KEY) !== String(found.sentAt)) {
        trackWeddingInquiry(`/${props.page}`);
        sessionStorage.setItem(REPORTED_KEY, String(found.sentAt));
      }
    } catch { /* Analytics must never interrupt a lead. */ }
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

function ThankYou({ sent, collections, city, page, phone, phoneE164, travelNote, onEdit }: ThankYouProps & { sent: Sent; onEdit?: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  const fit = recommendCollection(sent.coverage, sent.budget);
  const coverage = COVERAGE_OPTIONS.find((option) => option.value === sent.coverage)?.label.toLowerCase();
  const reason = fit.basis === "coverage" ? `Matches the ${coverage} you asked for.`
    : fit.basis === "budget" ? "Closest to the budget you gave."
      : "The collection most couples book.";
  const when = sent.date ? `your ${weekdayOf(sent.date)}, ${longDate(sent.date)}` : sent.season && sent.season !== "Later than that" ? sent.season : "";
  const lead = `Here’s your pricing${when ? ` for ${when}` : ""}${sent.location ? ` at ${sent.location}` : ""}.${sent.emailed ? ` A note from me about your day is on its way to ${sent.email}.` : ""}`;

  return <section className={funnel.thanks} aria-labelledby="thanks-title">
    <header className={styles.header}><span className={styles.wordmark}>Arman Arai<span>WEDDING PHOTOGRAPHY</span></span></header>
    <div className={funnel.thanksGrid}>
      <div className={funnel.thanksCopy}>
        <p className={styles.eyebrow}>Your pricing · {city}</p>
        <h1 id="thanks-title" ref={heading} tabIndex={-1} className={funnel.thanksTitle}>Thank you, {sent.names}.</h1>
        <p className={funnel.thanksLead}>{lead}</p>
        <ol className={funnel.pricing} aria-label="Your pricing">
          {collections.map((collection) => {
            const best = collection.slug === fit.slug;
            const stepUp = collection.slug === fit.stepUp;
            return <li key={collection.slug} className={`${funnel.collection}${best ? ` ${funnel.best}` : ""}`}>
              {best && <p className={funnel.bestTag}>Best fit · {reason}</p>}
              {stepUp && <p className={funnel.stepUpTag}>Worth a look · {STEP_UP_REASON[collection.slug]}</p>}
              <details open={best}>
                <summary>
                  <span className={funnel.collectionName}>{collection.name}<small>{collection.hoursLabel}</small></span>
                  <span className={funnel.collectionPrice}>{money(collection.price)}</span>
                </summary>
                <ul>{collection.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </details>
            </li>;
          })}
        </ol>
        <p className={funnel.pricingNote}>Canadian dollars before tax. {travelNote} Tap a collection to see everything in it.</p>
      </div>
      <div className={funnel.nextStep}>
        <p className={styles.eyebrow}>The next step</p>
        <h2 className={funnel.nextTitle}>A free 30-minute<br /><em>video call.</em></h2>
        <p>Pick a time that suits you. We’ll talk through your day, the photographs you love and the collection that fits. No obligation.</p>
        <WeddingCalendar page={page} theme="dark" classes={styles} prefill={{ name: sent.names, email: sent.email }} />
      </div>
      <div className={funnel.noCall}>
        <p><strong>Rather not do a call?</strong> That’s fine. {sent.emailed ? "Reply to my email, or message me on " : `I’ll reply to ${sent.email} the same day, or message me on `}<MessageLinks phone={phone} phoneE164={phoneE164} city={city} />.</p>
        <p className={styles.checkMicro}>A signed contract and a non-refundable 30% deposit secure your date.</p>
        {onEdit
          ? <button type="button" className={styles.checkAnother} onClick={onEdit}>Change my details</button>
          : <a className={styles.checkAnother} href={`/${page}#${FORM_ID}`}>Change my details</a>}
      </div>
    </div>
  </section>;
}
