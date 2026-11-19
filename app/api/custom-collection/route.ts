import { after, NextRequest, NextResponse } from "next/server";
import { EMAIL_PATTERN, PHONE_PATTERN } from "@/lib/contact-form";
import { buildSummary, buildTotal, priceBuild, type Selection } from "@/lib/custom-collection";
import { leadSource, leadSourceBox, leadSourceTag } from "@/lib/lead-source";
import { recordLead } from "@/lib/portal/leads";
import { weekdayOf } from "@/lib/ads/pricing-request";

/* The custom collection builder's inquiry (owner, 2026-11-18).
 *
 * Deliberately NOT /api/contact:
 *
 *  - It prices a build. The selection arrives as slugs and the total is
 *    computed here from lib/site.ts, so a tampered or stale page cannot put a
 *    number in the owner's inbox that the site does not actually charge.
 *  - It reports nothing to Meta or Google. The form does not navigate to a
 *    confirmation page, there is no Lead event and no inquiryId, because the
 *    owner does not want an ad platform converting on this. Do not add one.
 *  - It does not send the couple the welcome auto-reply. They have already
 *    read the pricing; what they get is the owner's own reply.
 *
 * The name is required and is carried into the subject line, the email body
 * and the stored lead, which was his one explicit requirement for this form.
 */

export const maxDuration = 30;

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Only the shape matters here; priceBuild drops anything it does not know. */
function readSelection(input: unknown): Selection {
  const raw = (input ?? {}) as Partial<Selection>;
  const items: Record<string, number> = {};
  if (raw.items && typeof raw.items === "object") {
    for (const [name, quantity] of Object.entries(raw.items as Record<string, unknown>)) {
      const n = Math.floor(Number(quantity));
      if (Number.isFinite(n) && n > 0) items[String(name).slice(0, 120)] = n;
    }
  }
  return {
    base: typeof raw.base === "string" ? raw.base : "",
    items,
    quoted: Array.isArray(raw.quoted) ? raw.quoted.filter((q): q is string => typeof q === "string").slice(0, 10) : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // The same honeypot every form on this site carries. A bot that fills it
    // gets a 200 and nothing is sent.
    if (typeof body.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const firstName = text(body.firstName, 60);
    const lastName = text(body.lastName, 60);
    const email = text(body.email, 100);
    const phone = text(body.phone, 40);
    const location = text(body.location, 120);
    const referral = text(body.referral, 80);
    const weddingDate = text(body.weddingDate, 40);
    const message = text(body.message, 4000);

    if (!firstName) return NextResponse.json({ error: "Please enter your first name." }, { status: 400 });
    if (!lastName) return NextResponse.json({ error: "Please enter your last name." }, { status: 400 });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!PHONE_PATTERN.test(phone) || (phone.match(/\d/g) ?? []).length < 7) {
      return NextResponse.json({ error: "Please enter a mobile number I can reach you on." }, { status: 400 });
    }
    if (!location) return NextResponse.json({ error: "Please tell me where the wedding is." }, { status: 400 });

    const names = `${firstName} ${lastName}`.trim();
    const build = priceBuild(readSelection(body.selection));
    const summary = buildSummary(build);
    const source = leadSource(body);

    const rows: [string, string][] = [
      ["Name", names],
      ["Email", email],
      ["Mobile", phone],
      ["Wedding date", weddingDate ? (/^\d{4}-\d{2}-\d{2}$/.test(weddingDate) ? `${weddingDate} (${weekdayOf(weddingDate)})` : weddingDate) : "Not given"],
      ["Where", location],
      ["How they found you", referral || "Not given"],
      ["Form", "Custom collection builder"],
      ["Built total", `${buildTotal(build)} before tax${build.quoted.length ? ", plus the quoted lines" : ""}`],
      ...([
        ["Campaign", [body.utm_source, body.utm_medium, body.utm_campaign].filter(Boolean).join(" / ")],
        ["Landing page", body.page || ""],
        ["Referrer", body.referrer || ""],
      ].filter((r): r is [string, string] => Boolean(r[1]))),
    ];

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2420;">
        <h2 style="font-size:1.3rem;font-weight:normal;border-bottom:1px solid #D9CEBC;padding-bottom:0.75rem;margin-bottom:1.5rem;">
          Custom collection from ${escapeHtml(names)}
        </h2>
        ${leadSourceBox(source)}
        <table style="width:100%;border-collapse:collapse;">
          ${rows.map(([label, value]) => `<tr><td style="padding:0.5rem 0;color:#A67268;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;width:150px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:0.5rem 0;">${escapeHtml(value)}</td></tr>`).join("")}
        </table>
        <div style="margin-top:1.5rem;padding:1.25rem;background:#F7F3EC;border-left:2px solid #C9A89A;">
          <p style="margin:0 0 0.75rem;color:#A67268;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">What they built</p>
          <ul style="margin:0;padding-left:1.1rem;line-height:1.75;">
            ${summary.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
          </ul>
        </div>
        ${message ? `<div style="margin-top:1.25rem;padding:1.25rem;background:#F7F3EC;border-left:2px solid #C9A89A;"><p style="margin:0 0 0.5rem;color:#A67268;font-size:0.75rem;text-transform:uppercase;">Anything else</p><p style="margin:0;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p></div>` : ""}
        <p style="margin-top:2rem;font-size:0.75rem;color:#6B7280;border-top:1px solid #EDE7DA;padding-top:1rem;">
          Built on armanarai.ca/build-your-collection. The total above was priced on the server from the published list, not from the browser. They were told you would reply yourself; no automatic email was sent to them.
        </p>
      </div>`;

    /* Write it down before trying to deliver it, exactly as /api/contact does:
       a failed email is a lead he can still call, a lead nobody recorded is
       gone. recordLead swallows its own errors. */
    after(() =>
      recordLead({
        receivedAt: new Date().toISOString(),
        name: names,
        email: email.toLowerCase(),
        phone,
        source: source.label,
        formType: "custom-collection",
        weddingDate: weddingDate || undefined,
        venue: location,
        message: [summary.join("\n"), message].filter(Boolean).join("\n\n"),
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

    if (!process.env.RESEND_API_KEY) {
      console.warn("Custom collection: RESEND_API_KEY is not set, nothing was emailed.");
      return NextResponse.json({ error: "Your collection could not be sent. Please email me directly at i@armanarai.com." }, { status: 503 });
    }

    const { Resend } = await import("resend");
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Arman Arai <i@armanarai.ca>",
      to: ["i@armanarai.com"],
      replyTo: email,
      subject: `${leadSourceTag(source)}Custom collection — ${names} — ${buildTotal(build)}`,
      html,
    });
    if (error) {
      console.error("Custom collection: send failed", error);
      return NextResponse.json({ error: "Your collection could not be sent. Please email me directly at i@armanarai.com." }, { status: 503 });
    }

    return NextResponse.json({ success: true, total: buildTotal(build) });
  } catch (err) {
    console.error("Custom collection API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
