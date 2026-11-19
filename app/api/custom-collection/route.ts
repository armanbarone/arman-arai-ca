import { after, NextRequest, NextResponse } from "next/server";
import { EMAIL_PATTERN } from "@/lib/contact-form";
import {
  againstCollections,
  buildReference,
  buildSummary,
  buildTotal,
  money,
  priceBuild,
  type Selection,
} from "@/lib/custom-collection";
import { leadSource, leadSourceBox, leadSourceTag } from "@/lib/lead-source";
import { recordLead } from "@/lib/portal/leads";

/* The custom collection builder's inquiry.
 *
 * Deliberately NOT /api/contact:
 *
 *  - It prices the build here, from the posted selection, so a tampered or
 *    stale page cannot put a number in the owner's inbox that the site does
 *    not charge.
 *  - It reports nothing to Meta or Google, and the form does not navigate to
 *    a confirmation page. Do not add either.
 *  - It asks for a name and an email and nothing else. The couple has usually
 *    already sent a full inquiry; asking the same seven questions again is
 *    what the owner cut on 2026-11-19.
 *
 * Every build gets a REFERENCE (CC-XXXXX). It is in the subject line, in the
 * body, on the stored lead and on the couple's screen, so an inquiry already
 * in the inbox can be matched to the collection it belongs to.
 */

export const maxDuration = 30;

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Only the shape matters here; priceBuild drops anything it does not know. */
function readSelection(input: unknown): Partial<Selection> {
  const raw = (input ?? {}) as Partial<Selection>;
  const items: Record<string, number> = {};
  if (raw.items && typeof raw.items === "object") {
    for (const [name, quantity] of Object.entries(raw.items as Record<string, unknown>)) {
      const n = Math.floor(Number(quantity));
      if (Number.isFinite(n) && n > 0) items[String(name).slice(0, 120)] = n;
    }
  }
  return {
    hours: Number(raw.hours),
    items,
    quoted: Array.isArray(raw.quoted) ? raw.quoted.filter((q): q is string => typeof q === "string").slice(0, 10) : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (typeof body.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const name = text(body.name, 120);
    const email = text(body.email, 100);
    if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

    const build = priceBuild(readSelection(body.selection));
    const reference = buildReference();
    const summary = buildSummary(build);
    const source = leadSource(body);
    const total = buildTotal(build);

    /* One line saying whether a set collection would be cheaper, so the owner
       does not have to do the comparison himself on every build. */
    const cheaper = againstCollections(build)
      .filter((tier) => tier.difference > 0)
      .sort((a, b) => b.difference - a.difference)[0];

    const rows: [string, string][] = [
      ["Reference", reference],
      ["Name", name],
      ["Email", email],
      ["Hours", String(build.hours)],
      ["Total", `${total} before tax${build.quoted.length ? ", plus the quoted lines" : ""}`],
      ...([
        ["Campaign", [body.utm_source, body.utm_medium, body.utm_campaign].filter(Boolean).join(" / ")],
        ["Landing page", body.page || ""],
        ["Referrer", body.referrer || ""],
      ].filter((r): r is [string, string] => Boolean(r[1]))),
    ];

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2420;">
        <p style="margin:0 0 .35rem;font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:#A67268;">Custom collection</p>
        <h2 style="font-size:1.6rem;font-weight:normal;letter-spacing:.06em;margin:0 0 .4rem;">${escapeHtml(reference)}</h2>
        <p style="margin:0 0 1.25rem;padding-bottom:.9rem;border-bottom:1px solid #D9CEBC;color:#6B7280;font-size:.85rem;">
          ${escapeHtml(name)} &middot; <a href="mailto:${escapeHtml(email)}" style="color:#A67268;">${escapeHtml(email)}</a> &middot; ${escapeHtml(total)} before tax
        </p>
        ${leadSourceBox(source)}
        <table style="width:100%;border-collapse:collapse;">
          ${rows.map(([label, value]) => `<tr><td style="padding:0.45rem 0;color:#A67268;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;width:130px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:0.45rem 0;">${escapeHtml(value)}</td></tr>`).join("")}
        </table>
        <div style="margin-top:1.4rem;padding:1.25rem;background:#F7F3EC;border-left:2px solid #C9A89A;">
          <p style="margin:0 0 .7rem;color:#A67268;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;">The build</p>
          <ul style="margin:0;padding-left:1.1rem;line-height:1.75;">
            ${summary.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
          </ul>
        </div>
        ${cheaper ? `<p style="margin:1rem 0 0;font-size:.85rem;color:#6B7280;">${escapeHtml(cheaper.name)} is ${escapeHtml(money(cheaper.price))} for ${cheaper.hours} hours, ${escapeHtml(money(cheaper.difference))} less than this build.</p>` : ""}
        <p style="margin-top:1.75rem;font-size:0.72rem;color:#6B7280;border-top:1px solid #EDE7DA;padding-top:1rem;">
          Built on armanarai.ca/build-your-collection and priced on the server. ${escapeHtml(reference)} is on their screen too, so an inquiry already in your inbox can be matched to this collection. No automatic email was sent to them.
        </p>
      </div>`;

    after(() =>
      recordLead({
        receivedAt: new Date().toISOString(),
        name,
        email: email.toLowerCase(),
        phone: "",
        source: source.label,
        formType: "custom-collection",
        venue: "",
        message: [`Reference ${reference}`, ...summary].join("\n"),
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
      return NextResponse.json({ error: "That could not be sent. Please email me at i@armanarai.com." }, { status: 503 });
    }

    const { Resend } = await import("resend");
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Arman Arai <i@armanarai.ca>",
      to: ["i@armanarai.com"],
      replyTo: email,
      subject: `${leadSourceTag(source)}${reference} — custom collection — ${name} — ${total}`,
      html,
    });
    if (error) {
      console.error("Custom collection: send failed", error);
      return NextResponse.json({ error: "That could not be sent. Please email me at i@armanarai.com." }, { status: 503 });
    }

    return NextResponse.json({ success: true, reference, total });
  } catch (err) {
    console.error("Custom collection API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
