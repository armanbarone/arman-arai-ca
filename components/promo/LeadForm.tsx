"use client";

import { useEffect, useState } from "react";
import { trackLead } from "@/lib/analytics";

const IN = "#e8dfd0";
const AC = "#B8956A";

const field: React.CSSProperties = {
  width: "100%", background: "#141110", border: "1px solid rgba(184,149,106,.45)",
  color: IN, padding: "0.95rem 0.9rem", fontSize: "1rem", fontFamily: "var(--font-jost)",
  outline: "none", borderRadius: 0, appearance: "none", WebkitAppearance: "none",
};
const label: React.CSSProperties = {
  display: "block", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase",
  color: "rgba(199,166,122,.95)", marginBottom: "0.5rem", fontFamily: "var(--font-jost)",
};

export interface LeadFormProps {
  endpoint: string;
  leadMethod: string;          // GA4 generate_lead method tag, e.g. "banff_promotion_form"
  /** What the notification email calls this lead, e.g. "Banff Elopement Inquiry". */
  inquiryLabel: string;
  monthOptions: string[];
  locationLabel: string;       // e.g. "Vancouver or Whistler?"
  locationOptions: string[];
  /** Second qualifier. Defaults to guest count, which is what changes the quote. */
  guestsLabel?: string;
  guestOptions?: string[];
}

const DEFAULT_GUEST_LABEL = "Who's coming with you?";
const DEFAULT_GUEST_OPTIONS = [
  "Just the two of us",
  "Us plus a witness or two",
  "A handful of guests, under 10",
  "More than 10",
  "Still deciding",
];

/** Google Ads writes the click id into the _gcl_aw cookie as "GCL.<ts>.<gclid>".
 *  Reading it back covers the case where someone lands on the ad, wanders the
 *  site, and comes back to the form on a URL that no longer carries ?gclid. */
function gclidFromCookie(): string {
  const m = /(?:^|;\s*)_gcl_aw=([^;]*)/.exec(document.cookie);
  if (!m) return "";
  const parts = decodeURIComponent(m[1]).split(".");
  return parts.length >= 3 ? parts.slice(2).join(".") : "";
}

interface Attribution {
  utm_source: string; utm_medium: string; utm_campaign: string;
  utm_content: string; utm_term: string;
  gclid: string; page: string; referrer: string;
}

const EMPTY_ATTR: Attribution = {
  utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", utm_term: "",
  gclid: "", page: "", referrer: "",
};

export default function LeadForm({
  endpoint, leadMethod, inquiryLabel, monthOptions, locationLabel, locationOptions,
  guestsLabel = DEFAULT_GUEST_LABEL, guestOptions = DEFAULT_GUEST_OPTIONS,
}: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [utm, setUtm] = useState<Attribution>(EMPTY_ATTR);

  // Capture the ad click so every lead is attributable. Empty values are dropped
  // on the server rather than emailed as "None".
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setUtm({
      utm_source: q.get("utm_source") ?? "",
      utm_medium: q.get("utm_medium") ?? "",
      utm_campaign: q.get("utm_campaign") ?? "",
      utm_content: q.get("utm_content") ?? "",
      utm_term: q.get("utm_term") ?? "",
      gclid: q.get("gclid") || q.get("wbraid") || q.get("gbraid") || gclidFromCookie(),
      page: window.location.pathname,
      referrer: document.referrer || "",
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrMsg("");
    const f = new FormData(e.currentTarget);
    const payload = {
      type: "founding",
      subjectLabel: inquiryLabel,
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone"),
      preferredMonth: f.get("preferredMonth"),
      location: f.get("location"),
      guests: f.get("guests"),
      company: f.get("company"), // honeypot
      ...utm,
    };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      // GA4, Google Ads and Meta in one call. Events queue through the
      // dataLayer stub, so nothing is lost if the tag has not loaded yet.
      trackLead(leadMethod);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{ border: `0.5px solid rgba(184,149,106,.35)`, padding: "2.5rem 2rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.35rem", color: IN, margin: 0 }}>
          Got it. I&rsquo;ll reply back within 10 minutes.
        </p>
        <p style={{ fontSize: "0.9rem", color: "rgba(232,223,208,.75)", marginTop: "0.9rem", lineHeight: 1.7 }}>
          If your date is close, skip the wait and book the call directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Honeypot: humans never see this */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} aria-hidden="true" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }} className="fc-grid">
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={label} htmlFor="fc-name">Your name</label>
          <input style={field} id="fc-name" name="name" type="text" required maxLength={60} />
        </div>
        <div>
          <label style={label} htmlFor="fc-email">Email</label>
          <input style={field} id="fc-email" name="email" type="email" required maxLength={100} />
        </div>
        <div>
          <label style={label} htmlFor="fc-phone">Phone (optional)</label>
          <input style={field} id="fc-phone" name="phone" type="tel" maxLength={30} />
        </div>
        <div>
          <label style={label} htmlFor="fc-month">Preferred month</label>
          <select style={field} id="fc-month" name="preferredMonth" defaultValue="">
            <option value="" disabled>Choose…</option>
            {monthOptions.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={label} htmlFor="fc-loc">{locationLabel}</label>
          <select style={field} id="fc-loc" name="location" defaultValue="">
            <option value="" disabled>Choose…</option>
            {locationOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* "How did you hear about us?" is dead weight on an ads landing page:
            the click already answers it, and the gclid answers it better. Guest
            count is the answer that actually changes the day and the quote. */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={label} htmlFor="fc-guests">{guestsLabel}</label>
          <select style={field} id="fc-guests" name="guests" defaultValue="">
            <option value="" disabled>Choose…</option>
            {guestOptions.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {status === "error" && (
        <p style={{ color: "#c96a5a", fontSize: "0.85rem", marginTop: "1rem" }}>{errMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          marginTop: "1.6rem", width: "100%", background: AC, color: "#080704", border: "none",
          padding: "1.05rem", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "var(--font-jost)", opacity: status === "sending" ? 0.6 : 1,
        }}
      >
        {status === "sending" ? "Sending…" : "Send. I'll reply back within 10 minutes"}
      </button>
      <p style={{ fontSize: "0.75rem", color: "rgba(232,223,208,.62)", marginTop: "0.9rem", lineHeight: 1.65, textAlign: "center" }}>
        Your details are used only to reply to this inquiry. Never sold, never added to a list without asking.
      </p>
    </form>
  );
}
