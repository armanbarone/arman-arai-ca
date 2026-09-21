import { NextRequest, NextResponse } from "next/server";
import { checkWeddingDate } from "@/lib/wedding-availability";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

async function sendViaGHL(data: Record<string, string>) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) return false;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendViaResend(subject: string, html: string, replyTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Arman Arai <i@armanarai.ca>",
      to: ["i@armanarai.com"],
      replyTo,
      subject,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    // The ads landing pages carry a honeypot field no human ever sees. Anything
    // that fills it is a bot: answer 200 so it believes it succeeded, and send
    // nothing. Silently dropping beats a 400 that tells a scraper to retry.
    if (typeof body.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const isDateCheck = type === "wedding-date-check";
    const availability = isDateCheck ? checkWeddingDate(body.weddingDate) : null;
    if (availability && "error" in availability) {
      return NextResponse.json({ error: availability.error }, { status: 400 });
    }
    if (isDateCheck) {
      for (const [key, max] of [["name", 60], ["email", 100], ["location", 90]] as const) {
        if (typeof body[key] !== "string" || !body[key].trim() || body[key].length > max) {
          return NextResponse.json({ error: "Please enter your name, email and wedding location." }, { status: 400 });
        }
        body[key] = body[key].trim();
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
    }

    const ghlData: Record<string, string> = {
      source: "armanarai.ca",
      type: type ?? "quick",
      name: body.name ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      bestTime: body.bestTime ?? "",
      partnerName: body.partnerName ?? "",
      weddingDate: body.weddingDate ?? "",
      ...(availability && "availability" in availability ? { dateAvailability: availability.availability } : {}),
      market: body.market ?? "",
      venue: body.venue ?? "",
      guestCount: body.guestCount ?? "",
      collection: body.collection ?? "",
      message: body.message ?? "",
      referral: body.referral ?? "",
      // Landing-page fields (LeadForm). Empty on the site's own forms.
      preferredMonth: body.preferredMonth ?? "",
      location: body.location ?? "",
      guests: body.guests ?? "",
      // Ad attribution, so a booking can be traced to the click that produced it.
      utm_source: body.utm_source ?? "",
      utm_medium: body.utm_medium ?? "",
      utm_campaign: body.utm_campaign ?? "",
      utm_content: body.utm_content ?? "",
      utm_term: body.utm_term ?? "",
      gclid: body.gclid ?? "",
      landingPage: body.page ?? "",
      referrer: body.referrer ?? "",
    };

    const isQuick = type === "quick";
    // "founding" is what the ads landing pages send; subjectLabel names which one.
    const isLanding = type === "founding" || isDateCheck;
    const subject = isLanding
      ? `${body.subjectLabel || "Landing Page Inquiry"} — ${body.name}`
      : isQuick
        ? `New Inquiry — ${body.name}`
        : `Wedding Inquiry — ${body.name}${body.partnerName ? ` & ${body.partnerName}` : ""}`;

    // An ad click is worth knowing about on the email itself, not only in the
    // CRM: the campaign that produced a lead changes how fast it gets answered.
    const attribution: [string, string][] = [
      ["Campaign", [body.utm_source, body.utm_medium, body.utm_campaign].filter(Boolean).join(" / ")],
      ["Ad content", body.utm_content || ""],
      ["Google click id", body.gclid || ""],
      ["Landing page", body.page || ""],
    ].filter((r): r is [string, string] => Boolean(r[1]));

    const rows: [string, string][] = isLanding
      ? [
          ["Name", body.name ?? ""],
          ["Email", body.email ?? ""],
          ["Phone", body.phone || "Not provided"],
          // The date-check form on /wedding-photography asks for the actual
          // date rather than a preferred month, because its whole question is
          // "are you free on this day". Both shapes post here, so each row
          // appears only when that form sent it.
          ...(body.weddingDate ? ([["Wedding date", body.weddingDate]] as [string, string][]) : []),
          ...(availability && "availability" in availability ? ([["Availability", availability.availability]] as [string, string][]) : []),
          ...(body.preferredMonth ? ([["Preferred month", body.preferredMonth]] as [string, string][]) : []),
          ["Where", body.location || "Not specified"],
          ...(body.guests ? ([["Guests", body.guests]] as [string, string][]) : []),
          ...attribution,
        ]
      : isQuick
      ? [
          ["Name", body.name ?? ""],
          ["Email", body.email ?? ""],
          ["Phone", body.phone || "Not provided"],
          // The quick form asks for these two now, because without them the
          // first reply cannot answer the only question it is asked.
          ["Wedding Date", body.weddingDate || "Not provided"],
          ["Where", body.venue || "Not provided"],
          ["Best Time", body.bestTime || "Not specified"],
        ]
      : [
          ["Couple", `${body.name ?? ""}${body.partnerName ? ` & ${body.partnerName}` : ""}`],
          ["Phone", body.phone || "Not provided"],
          ["Email", body.email ?? ""],
          ["Wedding Date", body.weddingDate || "Not provided"],
          // "Where" and "Coverage" are asked on the contact form (Where is even
          // required) but were never put on the email, so the two answers that
          // decide availability and the recommendation arrived nowhere.
          ["Where", body.market || "Not provided"],
          ["Venue", body.venue || "Not provided"],
          ["Guests", body.guestCount || "Not provided"],
          ["Coverage", body.collection || "Not specified"],
          ["Referral", body.referral || "Not provided"],
        ];

    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2420;">
        <h2 style="font-size:1.3rem;font-weight:normal;border-bottom:1px solid #D9CEBC;padding-bottom:0.75rem;margin-bottom:1.5rem;">
          ${escapeHtml(isLanding ? (body.subjectLabel || "Landing Page Inquiry") : isQuick ? "New Website Inquiry" : "Wedding Inquiry")}
        </h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows.map(([label, value]) => `<tr><td style="padding:0.5rem 0;color:#A67268;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;width:140px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:0.5rem 0;">${escapeHtml(value)}</td></tr>`).join("")}
        </table>
        ${body.message ? `<div style="margin-top:1.5rem;padding:1.25rem;background:#F7F3EC;border-left:2px solid #C9A89A;"><p style="margin:0 0 0.5rem;color:#A67268;font-size:0.75rem;text-transform:uppercase;">Message</p><p style="margin:0;line-height:1.7;">${escapeHtml(body.message)}</p></div>` : ""}
        <p style="margin-top:2rem;font-size:0.75rem;color:#6B7280;border-top:1px solid #EDE7DA;padding-top:1rem;">Sent via armanarai.ca</p>
      </div>`;

    let sent = false;
    if (process.env.GHL_WEBHOOK_URL) sent = await sendViaGHL(ghlData);
    if (!sent && process.env.RESEND_API_KEY) sent = await sendViaResend(subject, html, body.email);
    if (!sent) {
      console.warn("Contact inquiry delivery failed or no provider is configured.");
      return NextResponse.json({ error: "Your inquiry could not be sent. Please try again or email i@armanarai.com." }, { status: 503 });
    }

    return NextResponse.json({ success: true, ...(availability && "availability" in availability ? availability : {}) });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
