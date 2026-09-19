"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { trackLead } from "@/lib/analytics";
import styles from "./landing.module.css";

/* The first thing under the headline.
 *
 * Someone arriving from "wedding photographer Montreal" has one question, and
 * it is not what the collections are called. It is whether the date is free.
 * So the date is the first field, the form is four fields long, and it is
 * above the fold on a phone.
 *
 * The form and the calendar are not competing paths. Sending the date captures
 * the lead even from someone who will not book a call at 11pm, and the success
 * state hands them straight to the calendar. Whoever would rather just pick a
 * time can skip the form entirely; the sticky bar and every section CTA go
 * there directly.
 */

/** Google Ads writes the click id into _gcl_aw as "GCL.<ts>.<gclid>". Reading
 *  it back covers a visitor who lands on the ad and comes back to the form on a
 *  URL that no longer carries ?gclid. Same helper as components/promo/LeadForm. */
function gclidFromCookie(): string {
  const m = /(?:^|;\s*)_gcl_aw=([^;]*)/.exec(document.cookie);
  if (!m) return "";
  const parts = decodeURIComponent(m[1]).split(".");
  return parts.length >= 3 ? parts.slice(2).join(".") : "";
}

type Attribution = Record<string, string>;

const ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
] as const;

export default function DateCheck({
  city,
  wherePlaceholder,
  page,
  classes = styles,
  replyTiming = "Answered the same day, by me.",
  confirmation = "Got it. I’ll come back on your date today.",
}: {
  /** "Montréal", or "Canada" on the national page. Used only in the email subject. */
  city: string;
  wherePlaceholder: string;
  page: string;
  classes?: Record<string, string>;
  replyTiming?: string;
  confirmation?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [attribution, setAttribution] = useState<Attribution>({});
  const done = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const captured: Attribution = { page: window.location.pathname, referrer: document.referrer || "" };
    for (const key of ATTRIBUTION_KEYS) {
      const value = q.get(key);
      if (value) captured[key] = value;
    }
    captured.gclid = q.get("gclid") || q.get("wbraid") || q.get("gbraid") || gclidFromCookie();
    setAttribution(captured);
  }, []);

  // Move focus to the confirmation so a screen reader is told the date went.
  useEffect(() => { if (status === "done") done.current?.focus(); }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "founding",
          subjectLabel: `Date check — ${city}`,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          weddingDate: form.get("weddingDate"),
          location: form.get("location"),
          company: form.get("company"), // honeypot
          ...attribution,
        }),
      });
      if (!res.ok) throw new Error("That did not send. Please try again or email i@armanarai.com.");
      setStatus("done");
      trackLead("wedding_date_check");
      try { track("Wedding Date Check", { page }); } catch { /* Analytics must never interrupt a lead. */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not send.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className={classes.checkDone} ref={done} tabIndex={-1} role="status">
        <p className={classes.checkDoneLead}>{confirmation}</p>
        <p>
          If you would rather not wait, pick a time below and I will check the
          date live while we talk.
        </p>
        <a className={classes.checkButton} href="#book-a-call">
          Pick a time <span aria-hidden="true">↓</span>
        </a>
      </div>
    );
  }

  return (
    <form className={classes.check} onSubmit={onSubmit} aria-labelledby="check-title">
      <p className={classes.checkTitle} id="check-title">Check your date</p>
      {/* Honeypot. No human ever sees this; anything that fills it is dropped. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className={classes.honeypot} />

      <div className={classes.checkRow}>
        <div className={classes.checkField}>
          <label htmlFor="dc-date">Wedding date</label>
          <input id="dc-date" name="weddingDate" type="date" required />
        </div>
        <div className={classes.checkField}>
          <label htmlFor="dc-where">Where</label>
          <input id="dc-where" name="location" type="text" required maxLength={90} placeholder={wherePlaceholder} />
        </div>
        <div className={classes.checkField}>
          <label htmlFor="dc-name">Your name</label>
          <input id="dc-name" name="name" type="text" required maxLength={60} autoComplete="name" />
        </div>
        <div className={classes.checkField}>
          <label htmlFor="dc-email">Email</label>
          <input id="dc-email" name="email" type="email" required maxLength={100} autoComplete="email" />
        </div>
        <div className={`${classes.checkField} ${classes.checkWide}`}>
          <label htmlFor="dc-phone">Phone <span>optional, only if you prefer a call</span></label>
          <input id="dc-phone" name="phone" type="tel" maxLength={30} autoComplete="tel" />
        </div>
      </div>

      {status === "error" && <p className={classes.checkError} role="alert">{error}</p>}

      <button className={classes.checkButton} type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "See if the date is free"}
        <span aria-hidden="true">↗</span>
      </button>
      <p className={classes.checkMicro}>
        {replyTiming} Your details are used to reply to your inquiry. <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a>.
      </p>
    </form>
  );
}
