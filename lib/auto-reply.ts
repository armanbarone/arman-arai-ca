import Anthropic from "@anthropic-ai/sdk";
import { oidcFederationProvider } from "@anthropic-ai/sdk/lib/credentials/oidc-federation";
import { getVercelOidcToken } from "@vercel/oidc";
import { SITE, tierBySlug } from "./site";
import { inquiryBrief } from "./auto-reply-brief";
import { weddingCalendarUrl } from "./wedding-booking";
import { WEDDING_CITIES } from "./ads/city-wedding-pages";
import {
  BUDGET_OPTIONS, COVERAGE_OPTIONS, GUEST_OPTIONS, NOTE_MAX, SETUP_OPTIONS, labelOf, longDate, priorityLabels, prioritiesPhrase,
  pricingTiers, recommendCollection, weekdayOf, type DayDetails, type PricingMarket,
} from "./ads/pricing-request";

/* The email a couple receives within a minute of sending the pricing-request
 * form on /wedding-photography/<city>-pricing.
 *
 * Claude writes the personal part from what the couple sent: their names,
 * date, venue, coverage and budget, and which collection fits. Everything a
 * model could get wrong is kept out of its hands and rendered from lib/site.ts
 * underneath: the price table, the calendar button, WhatsApp, the signature.
 * The model's text is checked before it is sent (prices, links, date claims,
 * length); anything that fails the check, a refusal, a timeout or a missing
 * key sends the template in fallbackBody() instead, so the couple always gets
 * an answer. Arman is BCC'd on every one, so he sees exactly what went out.
 *
 * What the agent knows about the business lives in lib/auto-reply-brief.ts.
 *
 * Authentication is Workload Identity Federation, never an API key (owner,
 * 2026-09-30: a stored key is a security risk). The function's own Vercel
 * OIDC token is exchanged for a short-lived Anthropic token by the SDK, which
 * caches and refreshes it. Needs ANTHROPIC_FEDERATION_RULE_ID,
 * ANTHROPIC_ORGANIZATION_ID and ANTHROPIC_SERVICE_ACCOUNT_ID in the Vercel
 * project (plus ANTHROPIC_WORKSPACE_ID if the rule covers more than one
 * workspace). Without them the route sends no auto-reply at all, rather than
 * a template to every couple.
 */

export type PricingInquiry = {
  names: string;
  email: string;
  weddingDate?: string;
  weddingSeason?: string;
  location: string;
  coverage: string;
  budget: string;
  cityName: string;
  market: PricingMarket;
  /** "wedding-photography/vancouver-pricing" */
  page: string;
  /** When the form was sent (ms). The email waits until 30 seconds after it. */
  receivedAt: number;
  /** Their wedding guide (lib/guide.ts). Without one, the email carries the price table. */
  guideUrl?: string;
  /** Their exact date against the booked list. Absent when they gave a season. */
  dateStatus?: "open" | "booked";
} & DayDetails;

/* The couple gets the email about half a minute after pressing the button,
   not the instant they press it (owner, 2026-10-01). The wait is the rest of
   the 30 seconds once the note is written, so it never adds to a slow call. */
const SEND_DELAY_MS = 30_000;

// Owner's choice, 2026-09-30.
const MODEL = "claude-sonnet-5-5";
const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Couple-supplied text goes into the prompt as data. Angle brackets are
 *  removed so a field cannot close the <inquiry> tag it sits in. */
const asData = (value: string, max = 120) => value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
const greetingName = (names: string) => (/\p{L}/u.test(names) && names.length <= 60 ? names : "");

function federation() {
  const federationRuleId = process.env.ANTHROPIC_FEDERATION_RULE_ID;
  const organizationId = process.env.ANTHROPIC_ORGANIZATION_ID;
  const serviceAccountId = process.env.ANTHROPIC_SERVICE_ACCOUNT_ID;
  if (!federationRuleId || !organizationId || !serviceAccountId) return null;
  return { federationRuleId, organizationId, serviceAccountId, workspaceId: process.env.ANTHROPIC_WORKSPACE_ID || undefined };
}

export function autoReplyEnabled() {
  return Boolean(federation() && process.env.RESEND_API_KEY);
}

/* One client per warm function instance, so the exchanged Anthropic token is
   cached across requests instead of re-exchanged for every inquiry. apiKey and
   authToken are pinned to null: a stray ANTHROPIC_API_KEY in the environment
   would otherwise win over federation. One attempt, 20 seconds: the SDK retries
   timeouts by default, which would push a slow reply past the minute the page
   promises, and the template covers a failure. */
let client: Anthropic | undefined;
/** The claims of the last identity token presented, never the token itself:
 *  Anthropic answers every failed exchange with the same opaque 401, so these
 *  are what show which part of the federation rule did not match. */
let lastClaims: Record<string, unknown> | undefined;
async function identityToken() {
  const token = await getVercelOidcToken();
  try {
    const c = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    lastClaims = { iss: c.iss, aud: c.aud, sub: c.sub, environment: c.environment, lifetimeSeconds: c.exp - c.iat, hasJti: "jti" in c };
  } catch { lastClaims = { undecodable: true }; }
  return token;
}
function claude() {
  const config = federation();
  if (!config) return null;
  const baseURL = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  client ??= new Anthropic({
    apiKey: null,
    authToken: null,
    baseURL,
    credentials: oidcFederationProvider({ ...config, identityTokenProvider: identityToken, baseURL, fetch }),
    timeout: 20_000,
    maxRetries: 0,
  });
  return client;
}

function whenPhrase(inquiry: PricingInquiry) {
  if (inquiry.weddingDate) return `${weekdayOf(inquiry.weddingDate)}, ${longDate(inquiry.weddingDate)}`;
  if (inquiry.weddingSeason && inquiry.weddingSeason !== "Later than that") return inquiry.weddingSeason;
  return "";
}

function inquiryPrompt(inquiry: PricingInquiry, fitName: string, basis: string) {
  const coverage = COVERAGE_OPTIONS.find((option) => option.value === inquiry.coverage)?.label ?? "Not sure yet";
  const budget = BUDGET_OPTIONS.find((option) => option.value === inquiry.budget)?.label ?? "Not sure yet";
  const when = inquiry.weddingDate ? whenPhrase(inquiry) : `No exact date yet. Roughly: ${inquiry.weddingSeason ?? "not given"}`;
  const rec = recommendCollection(inquiry.coverage, inquiry.budget, inquiry);
  const stepUpLine = rec.stepUp
    ? `The collection one step up, worth mentioning once as something to consider: ${tierBySlug(rec.stepUp)!.name}, because: ${rec.stepUpReason}`
    : "Do not suggest a bigger collection for this couple.";
  const matters = priorityLabels(inquiry.priorities);
  const guideLine = inquiry.guideUrl
    ? `A wedding guide page has been made for this couple and is linked right under your note: their collection, how their hours could run, and photographs from ${inquiry.cityName}. Point to it once, in one short sentence, before the invitation to the call. Do not describe it beyond that.`
    : "No wedding guide page was made for this couple. Do not mention one.";
  const dateLine = inquiry.dateStatus === "booked"
    ? "Their date: BOOKED. Arman is already booked on their date and is not available that day."
    : inquiry.dateStatus === "open"
      ? "Their date: OPEN. Arman is available on their date as of now."
      : `Their date: no exact date, only a season (${inquiry.weddingSeason ?? "not given"}). Arman has dates open in it as of now.`;
  return `Write the email for this inquiry. ${dateLine}
The collection that fits best is ${fitName}, chosen from ${basis}.
${stepUpLine}
${guideLine}

<inquiry>
Names: ${asData(inquiry.names)}
Wedding date: ${when}
Venue or area: ${asData(inquiry.location)}
Guests: ${labelOf(GUEST_OPTIONS, inquiry.guests) ?? "Not given"}
Ceremony and reception: ${labelOf(SETUP_OPTIONS, inquiry.setup) ?? "Not given"}
What matters most to them: ${matters.length ? matters.join(", ") : "Not given"}
Coverage asked for: ${coverage}
Photography budget: ${budget}
Their note: ${inquiry.note ? asData(inquiry.note, NOTE_MAX) : "None"}
</inquiry>`;
}

/** Numbers the email may print: the three prices and the budget brackets the
 *  couple chose from. Anything else is a price the model made up. */
function allowedAmounts() {
  const amounts = new Set(pricingTiers().map((tier) => tier.price));
  for (const option of BUDGET_OPTIONS) for (const n of option.label.match(/\d[\d,]*/g) ?? []) amounts.add(Number(n.replace(/,/g, "")));
  return amounts;
}

/** The model's text, cleaned, or null if it breaks a rule it was given. Dashes
 *  of both kinds are banned in the brief; any that slip through are replaced
 *  here rather than failing the whole email. */
export function checkedBody(text: string, dateStatus?: "open" | "booked"): string | null {
  const body = text.replace(/\r/g, "").replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1 to $2").replace(/\s*[\u2013\u2014]\s*/g, ", ").trim();
  if (body.length < 200 || body.length > 1800) return null;
  if (/https?:\/\/|www\.|\*\*|^#|^subject:/im.test(body)) return null;
  // The date, exactly as the request states it, and nothing is ever held:
  // only the contract and the deposit secure a date.
  if (/\b(?:hold|holding|held|reserve|reserved|reserving|pencil(?:led)?)\b[^.]{0,30}\b(?:date|day)\b|\b(?:date|day)\b[^.]{0,30}\b(?:held|reserved|on hold)\b/i.test(body)) return null;
  if (dateStatus === "booked" && (!/\bbooked\b/i.test(body) || /\bavailable on\b|\bstill (?:open|free|available)\b/i.test(body))) return null;
  if (dateStatus === "open" && (!/\bavailab/i.test(body) || /\balready booked\b|\bnot available\b|\bunavailable\b/i.test(body))) return null;
  const allowed = allowedAmounts();
  for (const amount of body.match(/(?:C\$|\$)\s?\d[\d,]*/g) ?? []) {
    if (!allowed.has(Number(amount.replace(/[^\d]/g, "")))) return null;
  }
  return body;
}

/** The agent's note, "skip" for an inquiry it judged not to be a wedding, or
 *  null when the template should go instead. */
/* The agent answers in this shape, so it can write the subject line too and
   flag spam without free text that has to be parsed. */
const REPLY_SCHEMA = {
  type: "object",
  properties: {
    skip: { type: "boolean", description: "True only when the inquiry is plainly not from a couple planning a wedding." },
    body: { type: "string", description: "The personal note, plain text, paragraphs separated by a blank line, ending with Arman." },
  },
  required: ["skip", "body"],
  additionalProperties: false,
};

type Written = { subject: string; body: string };

/** The agent's subject and note, "skip" for an inquiry it judged not to be a
 *  wedding, or null when the template should go instead. */
async function writeWithClaude(inquiry: PricingInquiry, fitName: string, basis: string): Promise<Written | "skip" | null> {
  const api = claude();
  if (!api) return null;
  const response = await api.messages.create({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: { type: "json_schema", schema: REPLY_SCHEMA } },
    system: inquiryBrief(inquiry.market, inquiry.cityName),
    messages: [{ role: "user", content: inquiryPrompt(inquiry, fitName, basis) }],
  });
  if (response.stop_reason !== "end_turn") return null;
  const text = response.content.filter((block): block is Anthropic.TextBlock => block.type === "text").map((block) => block.text).join("").trim();
  let reply: { skip?: unknown; body?: unknown };
  try { reply = JSON.parse(text); } catch { return null; }
  if (reply.skip === true) return "skip";
  const body = typeof reply.body === "string" ? checkedBody(reply.body, inquiry.dateStatus) : null;
  if (!body) return null;
  return { subject: fallbackSubject(inquiry), body };
}

/** Fixed, so it always says plainly what the email is (owner, 2026-10-01:
 *  "mention in the subject this is a reply to their inquiry"). */
export function fallbackSubject(inquiry: PricingInquiry) {
  const name = greetingName(inquiry.names);
  const when = inquiry.weddingDate ? longDate(inquiry.weddingDate) : inquiry.weddingSeason && inquiry.weddingSeason !== "Later than that" ? inquiry.weddingSeason : "";
  const about = [name, when].filter(Boolean).join(", ");
  return `Your wedding photography inquiry${about ? `: ${about}` : ""}`.replace(/[\r\n]+/g, " ").slice(0, 120);
}

/** The backup note when the agent is unavailable, in the same shape the
 *  owner gave (2026-10-02): who, what it is about, what is right for them. */
const FIT_LINE: Record<string, string> = {
  signature: "Eight hours covers a full wedding day, from getting ready to your first dance and the start of the dancing.",
  complete: "Ten hours, with a second photographer for four of them, so a long day full of people is covered properly.",
  "photo-film": "Twelve hours with a dedicated filmmaker beside me, so you get the whole day on film as well as in photographs.",
};

export function fallbackBody(inquiry: PricingInquiry, fitName: string) {
  const name = greetingName(inquiry.names);
  const when = whenPhrase(inquiry);
  // "on Saturday, …" for a date, "in Summer 2027" for a season.
  const about = [inquiry.location && `at ${inquiry.location}`, when && (inquiry.weddingDate ? `on ${when}` : `in ${when}`)].filter(Boolean).join(" ");
  const fit = recommendCollection(inquiry.coverage, inquiry.budget, inquiry);
  const tier = tierBySlug(fit.slug)!;
  const matters = prioritiesPhrase(inquiry.priorities);
  const plural = (inquiry.priorities?.length ?? 0) > 1 || /^(candid|family|portraits)$/.test(inquiry.priorities?.[0] ?? "");
  return [
    `Hi ${name || "there"},`,
    `Congratulations! This is Arman, the wedding photographer. I got your inquiry about your wedding${about ? ` ${about}` : ""}.`,
    inquiry.dateStatus === "booked"
      ? `I'll be straight with you: I'm already booked on ${when}. If there's any flexibility in your date, I'd love to talk it through.`
      : inquiry.dateStatus === "open"
        ? `Good news: I'm available on ${when} as of now. Dates go first come, first served, so if you love what you see, don't wait too long.`
        : inquiry.weddingSeason && inquiry.weddingSeason !== "Later than that"
          ? `As of now I have dates open in ${inquiry.weddingSeason}, and they go first come, first served.`
          : "As of now my calendar is open that far ahead, and dates go first come, first served.",
    `Here's what I think is right for you: ${fitName}, at ${money(tier.price)}. ${FIT_LINE[fit.slug] ?? ""}${matters ? ` And since ${matters.charAt(0).toLowerCase() + matters.slice(1)} ${plural ? "matter" : "matters"} most to you, that's exactly where my attention goes.` : ""}`.trim(),
    `${inquiry.guideUrl ? "Everything is on the page I made for you, just below. " : ""}The easiest next step is a free 30-minute video call. If you'd rather just message, WhatsApp works too.`,
    "Arman",
  ].join("\n\n");
}

/** An email button that renders as a big block in every client, Outlook
 *  included: a full-width table cell, not a styled link alone. */
function bigButton(href: string, label: string, background: string, color: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;"><tr><td align="center" bgcolor="${background}" style="background:${background};border-radius:8px;"><a href="${escapeHtml(href)}" style="display:block;padding:22px 20px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;line-height:1.2;color:${color};text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a></td></tr></table>`;
}

/** What the couple sent, played back briefly so the email reads as an answer
 *  to them. Contact details stay out; they already know their own. */
function detailsBlock(inquiry: PricingInquiry) {
  const when = whenPhrase(inquiry) || "Date to be decided";
  const coverage = COVERAGE_OPTIONS.find((option) => option.value === inquiry.coverage)?.label ?? "Not sure yet";
  const budget = BUDGET_OPTIONS.find((option) => option.value === inquiry.budget)?.label ?? "Not sure yet";
  const guests = labelOf(GUEST_OPTIONS, inquiry.guests);
  const setup = labelOf(SETUP_OPTIONS, inquiry.setup);
  const matters = priorityLabels(inquiry.priorities);
  const rows: [string, string][] = [
    ["Date", when], ["Where", inquiry.location],
    ...(guests ? [["Guests", guests] as [string, string]] : []),
    ...(setup ? [["Ceremony and reception", setup] as [string, string]] : []),
    ...(matters.length ? [["What matters most", matters.join(", ")] as [string, string]] : []),
    ["Coverage", coverage], ["Budget", budget],
    ...(inquiry.note ? [["Your note", inquiry.note] as [string, string]] : []),
  ];
  return `<div style="margin:6px 0 24px;padding:16px 18px;background:#F7F3EC;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#2C2420;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">What you told me</p>
    ${rows.map(([label, value]) => `<p style="margin:0;"><span style="color:#6B6258;">${label}:</span> ${escapeHtml(value)}</p>`).join("")}
  </div>`;
}

/** The link to their guide: a photograph from their city, a line, a button.
 *  The photograph is the guide's own first one, cropped wide (3:2) for email
 *  so the button still shows on a phone's first screen. The button is a mid
 *  tone (rust) so it reads on white and on a dark-mode background alike, and
 *  stays distinct from the gold call button. */
function guideBlock(inquiry: PricingInquiry, guideUrl: string, hours: number) {
  const photo = WEDDING_CITIES.find((city) => city.slug === inquiry.market.slug)?.heroes[0];
  const image = photo ? photo.src.replace("https://cdn.armanarai.ca/", "https://cdn.armanarai.ca/cdn-cgi/image/format=jpeg,quality=78,width=1120,height=747,fit=cover,gravity=auto/") : null;
  return `<div style="margin:28px 0 8px;">
    ${image ? `<a href="${escapeHtml(guideUrl)}" style="display:block;text-decoration:none;"><img src="${escapeHtml(image)}" width="560" alt="${escapeHtml(photo!.alt)}" style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:8px;"></a>` : ""}
    <p style="margin:16px 0 6px;font-size:24px;line-height:1.2;">Your wedding guide</p>
    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#6B6258;">Your collection options, prices and a sample ${hours}-hour plan, on one page made for you. Reply with questions and I’ll help you choose.</p>
    ${bigButton(guideUrl, "Open your wedding guide", "#A95C31", "#FFFFFF")}
  </div>`;
}

/** Exported for previewing the email; sendInquiryAutoReply is the only real caller. */
export function render(inquiry: PricingInquiry, body: string, fitSlug: string, stepUpSlug?: string) {
  const calendar = weddingCalendarUrl("?utm_source=auto-reply-email&utm_medium=email", new URL(SITE.url).hostname, false, { page: inquiry.page, prefill: { name: inquiry.names, email: inquiry.email } });
  const whatsapp = `https://wa.me/${SITE.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi Arman, it's ${inquiry.names}. We asked about wedding photography in ${inquiry.cityName}.`)}`;
  const tiers = pricingTiers();
  const guide = inquiry.guideUrl;
  const hours = tierBySlug(fitSlug)!.hours;
  const priceTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:8px 0 6px;border-top:1px solid #D9CEBC;">
    ${tiers.map((tier) => `<tr><td style="padding:12px 0;border-bottom:1px solid #EDE7DA;font-size:18px;">${escapeHtml(tier.name)} <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B6258;">${tier.hours} hours</span>${tier.slug === fitSlug ? ` <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">Best fit</span>` : tier.slug === stepUpSlug ? ` <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6B6258;">Worth a look</span>` : ""}</td><td style="padding:12px 0 12px 16px;border-bottom:1px solid #EDE7DA;text-align:right;white-space:nowrap;font-size:18px;">${money(tier.price)}</td></tr>`).join("")}
  </table>
  <p style="margin:0 0 26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B6258;">Canadian dollars, before tax.</p>`;
  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2420;font-size:17px;line-height:1.65;">
  ${body.split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}
  ${guide ? guideBlock(inquiry, guide, hours) : ""}
  <div style="margin:${guide ? "10px" : "28px"} 0 22px;">
    ${bigButton(calendar, "Book your free video call", "#B8956A", "#1A1612")}
    <p style="margin:-4px 0 18px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B6258;">30 minutes, no obligation. Pick any time that suits you.</p>
    ${bigButton(whatsapp, "Message me on WhatsApp", "#25D366", "#FFFFFF")}
  </div>
  ${detailsBlock(inquiry)}
  ${guide ? "" : priceTable}
  <p style="margin:0;padding-top:16px;border-top:1px solid #EDE7DA;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B6258;">Arman Arai · Wedding photography · <a href="${SITE.url}" style="color:#6B6258;">${SITE.domain}</a> · ${escapeHtml(SITE.phone)}</p>
</div>`;
  const text = [
    body,
    ...(guide ? [`Your wedding guide: ${guide}`] : []),
    `Book your free video call: ${calendar}`,
    `Message me on WhatsApp: ${whatsapp}`,
    `What you told me: ${[whenPhrase(inquiry) || "Date to be decided", inquiry.location, COVERAGE_OPTIONS.find((option) => option.value === inquiry.coverage)?.label ?? "Not sure yet", BUDGET_OPTIONS.find((option) => option.value === inquiry.budget)?.label ?? "Not sure yet"].join(" · ")}`,
    ...(guide ? [] : [tiers.map((tier) => `${tier.name}, ${tier.hours} hours${tier.slug === fitSlug ? " (best fit)" : tier.slug === stepUpSlug ? " (worth a look)" : ""}: ${money(tier.price)}`).join("\n"), "Canadian dollars, before tax."]),
    `Arman Arai · Wedding photography · ${SITE.domain} · ${SITE.phone}`,
  ].join("\n\n");
  return { html, text };
}

export async function sendInquiryAutoReply(inquiry: PricingInquiry): Promise<void> {
  const started = Date.now();
  const fit = recommendCollection(inquiry.coverage, inquiry.budget, inquiry);
  const fitName = tierBySlug(fit.slug)!.name;
  const basis = fit.basis === "coverage" ? "the coverage they asked for" : fit.basis === "budget" ? "their budget" : "neither, because they are unsure of both; Signature is the collection most couples book";
  let body: string | null = null;
  let subject = fallbackSubject(inquiry);
  let source = "claude";
  try {
    const written = await writeWithClaude(inquiry, fitName, basis);
    if (written === "skip") { console.info("Auto-reply: skipped, not a wedding inquiry"); return; }
    if (written) { body = written.body; subject = written.subject; }
  } catch (error) {
    // The status and the API's own message (it names the bad field on a 400);
    // the request carries no secrets and neither does the error.
    console.warn("Auto-reply: Claude call failed", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
    if (lastClaims) console.warn("Auto-reply: identity token claims presented", JSON.stringify(lastClaims));
  }
  if (!body) { body = fallbackBody(inquiry, fitName); source = "template"; }
  const { html, text } = render(inquiry, body, fit.slug, fit.stepUp);
  const wait = inquiry.receivedAt + SEND_DELAY_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  try {
    const { Resend } = await import("resend");
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Arman Arai <i@armanarai.ca>",
      to: [inquiry.email],
      bcc: [SITE.email],
      replyTo: SITE.email,
      subject,
      html,
      text,
    });
    if (error) throw new Error(error.message);
    console.info(`Auto-reply sent (${source}) in ${Date.now() - started} ms`);
  } catch (error) {
    console.error("Auto-reply: send failed", error);
  }
}
