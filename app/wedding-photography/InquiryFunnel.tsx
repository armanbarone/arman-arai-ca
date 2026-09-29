"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { trackWeddingInquiry } from "@/lib/analytics";
import { BUDGET_OPTIONS, COVERAGE_OPTIONS, recommendCollection, seasonOptions } from "@/lib/ads/short-story";
import { weddingToday, type WeddingAvailability } from "@/lib/wedding-availability";
import WeddingCalendar from "../2728-cc-weddings/wedding-calendar";
import { ATTRIBUTION_KEYS, gclidFromCookie } from "./DateCheck";
import styles from "./vancouver.module.css";
import funnel from "./inquiry.module.css";

/* The pricing-request funnel: ad → this page → one form → pricing and the
 * calendar on the same screen.
 *
 * The form is the conversion, not the call. It is sent before anything else
 * happens, so a couple who never books a time has still left a name, an email
 * and a mobile number. Once it is sent the whole page is replaced by the
 * thank-you view: their date, their pricing with the collection that fits
 * marked, the calendar with their name and email already filled in, and a way
 * to carry on by email or text instead.
 */

export type FunnelCollection = { slug: string; name: string; hoursLabel: string; strap: string; price: number; items: string[] };

type Sent = {
  names: string;
  email: string;
  date?: string;
  season?: string;
  availability?: WeddingAvailability;
  /** Whether Short Story runs on their date; null without an exact date. */
  shortStory: boolean | null;
  coverage: string;
  budget: string;
};

const FunnelContext = createContext<(sent: Sent) => void>(() => {});
const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
const longDate = (date: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
const weekdayOf = (date: string) => new Intl.DateTimeFormat("en-CA", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

export default function InquiryFunnel({ children, collections, city, page, phone, phoneE164, travelNote }: {
  children: ReactNode;
  collections: FunnelCollection[];
  city: string;
  /** "wedding-photography/vancouver-pricing", as the calendar's utm_content. */
  page: string;
  phone: string;
  phoneE164: string;
  travelNote: string;
}) {
  const [sent, setSent] = useState<Sent | null>(null);
  const show = (value: Sent) => { setSent(value); window.scrollTo({ top: 0 }); };
  const edit = () => {
    setSent(null);
    requestAnimationFrame(() => document.getElementById("check-date")?.scrollIntoView());
  };
  return <FunnelContext.Provider value={show}>
    <div hidden={!!sent}>{children}</div>
    {sent && <ThankYou sent={sent} collections={collections} city={city} page={page} phone={phone} phoneE164={phoneE164} travelNote={travelNote} onEdit={edit} />}
  </FunnelContext.Provider>;
}

/** Any "check your date" link below the hero. On a collection card it also
 *  preselects that card's coverage, so the form already says which one. */
export function CheckDateLink({ coverage, className, children }: { coverage?: string; className?: string; children: ReactNode }) {
  return <a href="#check-date" className={className} onClick={() => {
    const select = document.getElementById("inq-coverage") as HTMLSelectElement | null;
    if (select && coverage) select.value = coverage;
  }}>{children}</a>;
}

export function InquiryForm({ city, page }: { city: string; page: string }) {
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
      // The inquiry has been delivered by now, so never ask for it twice: an
      // unexpected answer about the date only means the date is not shown.
      const checked = payload.weddingDate && data.date === payload.weddingDate && ["available", "unavailable"].includes(data.availability);
      try { trackWeddingInquiry(page); } catch { /* Analytics must never interrupt a lead. */ }
      setStatus("idle");
      send({
        names: payload.name,
        email: payload.email,
        date: checked ? payload.weddingDate : undefined,
        season: payload.weddingSeason || undefined,
        availability: checked ? data.availability : undefined,
        shortStory: typeof data.shortStory === "boolean" ? data.shortStory : null,
        coverage: payload.coverage,
        budget: payload.budget,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not send.");
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  return <form className={styles.check} onSubmit={onSubmit} aria-labelledby="inq-title">
    <p className={styles.checkTitle} id="inq-title">Your date and your pricing</p>
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
      {status === "sending" ? "Checking your date…" : "Check My Date & Get Pricing"}
      <span aria-hidden="true">↗</span>
    </button>
    <p className={styles.checkMicro}>
      See your availability and pricing straight away. Answered the same day, by me. <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a>.
    </p>
  </form>;
}

function ThankYou({ sent, collections, city, page, phone, phoneE164, travelNote, onEdit }: {
  sent: Sent;
  collections: FunnelCollection[];
  city: string;
  page: string;
  phone: string;
  phoneE164: string;
  travelNote: string;
  onEdit: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  const fit = recommendCollection(sent.coverage, sent.budget, sent.shortStory);
  const weekday = sent.date ? weekdayOf(sent.date) : "";
  const coverage = COVERAGE_OPTIONS.find((option) => option.value === sent.coverage)?.label;
  const reason = fit.shortStoryUnavailable
    ? `Short Story isn’t offered on your ${weekday}, so this is the closest fit.`
    : fit.basis === "coverage" ? `Matches the ${coverage} you asked for.`
      : fit.basis === "budget" ? "Closest to the budget you gave."
        : "The collection most couples book.";
  const booked = sent.availability === "unavailable";
  const title = !sent.date ? `Thank you, ${sent.names}.` : booked ? `I’m booked on ${longDate(sent.date)}.` : `${longDate(sent.date)} is open.`;
  const lead = !sent.date
    ? "Here’s your pricing. Once you’ve settled on a date, send it over and I’ll check it straight away."
    : booked
      ? "I’m already committed that day. If your date can still move, change it and I’ll check again. Your pricing is below either way."
      : `Your ${weekday} is available, ${sent.names}. Here’s your pricing, and a time for a free video call if you’d like one.`;

  return <section className={funnel.thanks} aria-labelledby="thanks-title">
    <header className={styles.header}><span className={styles.wordmark}>Arman Arai<span>WEDDING PHOTOGRAPHY</span></span></header>
    <div className={funnel.thanksGrid}>
      <div className={funnel.thanksCopy}>
        <p className={styles.eyebrow}>Your date check · {city}</p>
        <h1 id="thanks-title" ref={heading} tabIndex={-1} className={funnel.thanksTitle}>{title}</h1>
        <p className={funnel.thanksLead}>{lead}</p>
        <ol className={funnel.pricing} aria-label="Your pricing">
          {collections.map((collection) => {
            const best = collection.slug === fit.slug;
            const unavailable = collection.slug === "short-story" && sent.shortStory === false;
            return <li key={collection.slug} className={`${funnel.collection}${best ? ` ${funnel.best}` : ""}${unavailable ? ` ${funnel.unavailable}` : ""}`}>
              {best && <p className={funnel.bestTag}>Best fit · {reason}</p>}
              {unavailable && <p className={funnel.unavailableNote}>Not offered on your {weekday}.</p>}
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
        <p><strong>Rather not do a call?</strong> That’s fine. I’ll reply to {sent.email} the same day, or text me at <a href={`sms:${phoneE164}`}>{phone}</a>.</p>
        <p className={styles.checkMicro}>Checking a date doesn’t reserve it. A signed contract and a 30% retainer do.</p>
        <button type="button" className={styles.checkAnother} onClick={onEdit}>Change my details</button>
      </div>
    </div>
  </section>;
}
