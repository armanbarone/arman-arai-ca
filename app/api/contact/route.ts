import { after, NextRequest, NextResponse } from "next/server";
import { fullName, splitName, validateInquiry } from "@/lib/contact-form";
import { pricingMarket, weekdayOf } from "@/lib/ads/pricing-request";
import { WEDDING_CITIES } from "@/lib/ads/city-wedding-pages";
import { autoReplyEnabled, sendInquiryAutoReply, type Inquiry } from "@/lib/auto-reply";
import { leadSource, leadSourceBox, leadSourceTag } from "@/lib/lead-source";
import { recordLead } from "@/lib/portal/leads";

/* One inquiry endpoint for every form on the site.
 *
 * The site's contact page, the quick modal and the ads landing pages now ask
 * the same nine questions (lib/contact-form.ts) and post the same shape here,
 * so there is one validation path, one lead email to Arman, and one auto-reply
 * to the couple. The old per-form branches are gone, along with the
 * per-inquiry /guide/<id> page this route used to build: the email links the
 * published guide at /wedding-guide instead.
 *
 * `type` survives only to label the lead email with which form was used.
 *
 * The auto-reply runs after the response, inside this function's lifetime, so
 * the form never waits on it. It sends about 30 seconds after the form.
 */
export const maxDuration = 60;

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

/** An ISO date gets its weekday spelled out, because a Friday wedding and a
 *  Saturday wedding are different conversations. Free text is left alone. */
function dateLine(value: string) {
  if (!value) return "Not given";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value} (${weekdayOf(value)})` : value;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    // Every form carries a honeypot field no human ever sees. Anything that
    // fills it is a bot: answer 200 so it believes it succeeded, and send
    // nothing. Silently dropping beats a 400 that tells a scraper to retry.
    if (typeof body.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // Older open tabs can still post a single `name`. Split it rather than
    // rejecting a real couple because their tab was open since last week.
    if (!body.firstName && typeof body.name === "string") {
      const parts = splitName(body.name);
      body.firstName = parts.firstName;
      body.lastName = body.lastName || parts.lastName;
    }

    const checked = validateInquiry(body);
    if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
    const values = checked.values;
    const names = fullName(values);

    /* The landing pages send which city page they came from. It sets the
       travel sentence in the auto-reply and opens the vendor list on their
       own city; everything else works without it. */
    const market = pricingMarket(String(body.pricingMarket ?? ""));
    const cityName = market ? WEDDING_CITIES.find((city) => city.slug === market.slug)?.name : undefined;

    const autoReply: Inquiry | null = autoReplyEnabled()
      ? {
          ...values,
          market: market ?? undefined,
          cityName,
          page: typeof body.page === "string" && body.page ? body.page.replace(/^\//, "") : "wedding-photography/vancouver-pricing",
          receivedAt: Date.now(),
        }
      : null;

    // Google Ads, Meta or neither, for the owner's lead email (lib/lead-source.ts).
    const source = leadSource(body);
    const ghlData: Record<string, string> = {
      source: "armanarai.ca",
      type: type ?? "inquiry",
      name: names,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      email: values.email,
      weddingDate: values.weddingDate,
      location: values.location,
      referral: values.referral,
      message: values.message,
      promise: values.promise,
      pricingMarket: body.pricingMarket ?? "",
      // Ad attribution, so a booking can be traced to the click that produced it.
      utm_source: body.utm_source ?? "",
      utm_medium: body.utm_medium ?? "",
      utm_campaign: body.utm_campaign ?? "",
      utm_content: body.utm_content ?? "",
      utm_term: body.utm_term ?? "",
      gclid: body.gclid ?? "",
      fbclid: body.fbclid ?? "",
      leadSource: source.label,
      landingPage: body.page ?? "",
      referrer: body.referrer ?? "",
    };

    const label = body.subjectLabel || (cityName ? `Wedding inquiry — ${cityName}` : "Wedding inquiry");
    const subject = `${leadSourceTag(source)}${label} — ${names}`;

    /* An ad click is worth knowing about on the email itself, not only in the
       CRM: the campaign that produced a lead changes how fast it gets answered. */
    const attribution: [string, string][] = [
      ["Campaign", [body.utm_source, body.utm_medium, body.utm_campaign].filter(Boolean).join(" / ")],
      ["Ad content", body.utm_content || ""],
      ["Google click id", body.gclid || ""],
      ["Landing page", body.page || ""],
    ].filter((r): r is [string, string] => Boolean(r[1]));

    const rows: [string, string][] = [
      ["Name", names],
      ["Email", values.email],
      ["Mobile", values.phone],
      ["Wedding date", dateLine(values.weddingDate)],
      ["Where", values.location],
      ["How they found you", values.referral],
      ["Form", cityName ? `${cityName} landing page` : type === "quick" ? "Quick inquiry modal" : "Contact page"],
      ["Auto-reply", autoReply ? "Sending to them about 30 seconds after this; you are BCC'd" : "OFF: RESEND_API_KEY is not set"],
      ...attribution,
    ];

    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2420;">
        <h2 style="font-size:1.3rem;font-weight:normal;border-bottom:1px solid #D9CEBC;padding-bottom:0.75rem;margin-bottom:1.5rem;">
          ${escapeHtml(label)}
        </h2>
        ${leadSourceBox(source)}
        <table style="width:100%;border-collapse:collapse;">
          ${rows.map(([rowLabel, value]) => `<tr><td style="padding:0.5rem 0;color:#A67268;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;width:140px;vertical-align:top;">${escapeHtml(rowLabel)}</td><td style="padding:0.5rem 0;">${escapeHtml(value)}</td></tr>`).join("")}
        </table>
        <div style="margin-top:1.5rem;padding:1.25rem;background:#F7F3EC;border-left:2px solid #C9A89A;"><p style="margin:0 0 0.5rem;color:#A67268;font-size:0.75rem;text-transform:uppercase;">Their message</p><p style="margin:0;line-height:1.7;white-space:pre-wrap;">${escapeHtml(values.message)}</p></div>
        <p style="margin-top:2rem;font-size:0.75rem;color:#6B7280;border-top:1px solid #EDE7DA;padding-top:1rem;">Sent via armanarai.ca · You said you&rsquo;d reply within 60 minutes.</p>
      </div>`;

    /* Keep the inquiry before trying to deliver it. An email that fails is a
       lead Arman can still call; a lead nobody wrote down is gone. recordLead
       swallows its own errors so the form can never fail because of this. */
    after(() =>
      recordLead({
        receivedAt: new Date().toISOString(),
        name: names,
        email: values.email.toLowerCase(),
        phone: values.phone,
        source: source.label,
        formType: type ?? "inquiry",
        weddingDate: values.weddingDate || undefined,
        market: cityName,
        venue: values.location,
        message: values.message,
        attribution: {
          utmSource: body.utm_source ?? undefined,
          utmMedium: body.utm_medium ?? undefined,
          utmCampaign: body.utm_campaign ?? undefined,
          utmContent: body.utm_content ?? undefined,
          utmTerm: body.utm_term ?? undefined,
          gclid: body.gclid ?? undefined,
          fbclid: body.fbclid ?? undefined,
          landingPage: body.page ?? undefined,
          referrer: body.referrer ?? undefined,
        },
      }),
    );

    let sent = false;
    // Resend is the site's primary email provider. Retain the existing webhook
    // only as a fallback for deployments where it is explicitly configured.
    if (process.env.RESEND_API_KEY) sent = await sendViaResend(subject, html, values.email);
    if (!sent && process.env.GHL_WEBHOOK_URL) sent = await sendViaGHL(ghlData);
    if (!sent) {
      console.warn("Contact inquiry delivery failed or no provider is configured.");
      return NextResponse.json({ error: "Your inquiry could not be sent. Please try again or email i@armanarai.com." }, { status: 503 });
    }

    // The couple's email goes out after this response, so the form never waits
    // on it. after() keeps the function alive until it is sent.
    if (autoReply) {
      const inquiry = autoReply;
      after(() => sendInquiryAutoReply(inquiry));
    }

    return NextResponse.json({ success: true, autoReply: Boolean(autoReply) });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
