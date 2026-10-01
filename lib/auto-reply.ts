import Anthropic from "@anthropic-ai/sdk";
import { oidcFederationProvider } from "@anthropic-ai/sdk/lib/credentials/oidc-federation";
import { getVercelOidcToken } from "@vercel/oidc";
import { SITE, tierBySlug } from "./site";
import { inquiryBrief } from "./auto-reply-brief";
import { weddingCalendarUrl } from "./wedding-booking";
import {
  BUDGET_OPTIONS, COVERAGE_OPTIONS, STEP_UP_REASON, longDate, pricingTiers, recommendCollection, weekdayOf,
  type PricingMarket,
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
};

// Owner's choice, 2026-09-30.
const MODEL = "claude-sonnet-5-5";
const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Couple-supplied text goes into the prompt as data. Angle brackets are
 *  removed so a field cannot close the <inquiry> tag it sits in. */
const asData = (value: string) => value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
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
  const stepUp = recommendCollection(inquiry.coverage, inquiry.budget).stepUp;
  const stepUpLine = stepUp
    ? `The collection one step up, worth mentioning once as something to consider: ${tierBySlug(stepUp)!.name}, because: ${STEP_UP_REASON[stepUp]}`
    : "Do not suggest a bigger collection for this couple.";
  return `Write the email for this inquiry. The collection that fits best is ${fitName}, chosen from ${basis}.
${stepUpLine}

<inquiry>
Names: ${asData(inquiry.names)}
Wedding date: ${when}
Venue or area: ${asData(inquiry.location)}
Coverage asked for: ${coverage}
Photography budget: ${budget}
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
export function checkedBody(text: string): string | null {
  const body = text.replace(/\r/g, "").replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1 to $2").replace(/\s*[\u2013\u2014]\s*/g, ", ").trim();
  if (body.length < 200 || body.length > 1500) return null;
  if (/https?:\/\/|www\.|\*\*|^#|^subject:/im.test(body)) return null;
  // No date claims of any kind: the site checks nothing.
  if (/\bavailab|\b(?:date|day)\b[^.]{0,40}\b(?:open|free|booked|held|reserved)\b/i.test(body)) return null;
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
    subject: { type: "string", description: "The subject line: 3 to 9 words, warm and specific to them." },
    body: { type: "string", description: "The personal note, plain text, paragraphs separated by a blank line, ending with Arman." },
  },
  required: ["skip", "subject", "body"],
  additionalProperties: false,
};

type Written = { subject: string; body: string };

/** A subject line the agent wrote, cleaned, or null if it breaks a rule. */
export function checkedSubject(text: string): string | null {
  const subject = text.replace(/[\r\n]+/g, " ").replace(/\s*[\u2013\u2014]\s*/g, ", ").trim();
  if (subject.length < 8 || subject.length > 80) return null;
  if (/https?:\/\/|www\.|\$|!|^re:/i.test(subject)) return null;
  if (/\bavailab/i.test(subject)) return null;
  return subject;
}

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
  let reply: { skip?: unknown; subject?: unknown; body?: unknown };
  try { reply = JSON.parse(text); } catch { return null; }
  if (reply.skip === true) return "skip";
  const body = typeof reply.body === "string" ? checkedBody(reply.body) : null;
  if (!body) return null;
  const subject = typeof reply.subject === "string" ? checkedSubject(reply.subject) : null;
  return { subject: subject ?? fallbackSubject(inquiry), body };
}

export function fallbackSubject(inquiry: PricingInquiry) {
  const name = greetingName(inquiry.names);
  return name ? `${name}, your ${inquiry.cityName} wedding` : `Your ${inquiry.cityName} wedding`;
}

/** The backup note when the agent is unavailable. Short on purpose: the
 *  pricing is in the table under it and on the screen they just saw. */
export function fallbackBody(inquiry: PricingInquiry, fitName: string) {
  const name = greetingName(inquiry.names);
  const when = whenPhrase(inquiry);
  const details = [inquiry.location && `at ${inquiry.location}`, when && `on ${when}`].filter(Boolean).join(" ");
  return [
    `Hi ${name || "there"},`,
    `Thank you for telling me about your wedding${details ? ` ${details}` : ""}. I would love to hear more about it.`,
    `From what you shared, ${fitName} feels like the right fit. The easiest way to talk it through is a free 30-minute video call, and if you would rather just message, WhatsApp works too.`,
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
  const rows: [string, string][] = [["Date", when], ["Where", inquiry.location], ["Coverage", coverage], ["Budget", budget]];
  return `<div style="margin:6px 0 24px;padding:16px 18px;background:#F7F3EC;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#2C2420;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">What you told me</p>
    ${rows.map(([label, value]) => `<p style="margin:0;"><span style="color:#6B6258;">${label}:</span> ${escapeHtml(value)}</p>`).join("")}
  </div>`;
}

function render(inquiry: PricingInquiry, body: string, fitSlug: string, stepUpSlug?: string) {
  const calendar = weddingCalendarUrl("?utm_source=auto-reply-email&utm_medium=email", new URL(SITE.url).hostname, false, { page: inquiry.page, prefill: { name: inquiry.names, email: inquiry.email } });
  const whatsapp = `https://wa.me/${SITE.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi Arman, it's ${inquiry.names}. We asked about wedding photography in ${inquiry.cityName}.`)}`;
  const tiers = pricingTiers();
  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2420;font-size:17px;line-height:1.65;">
  ${body.split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}
  <div style="margin:28px 0 22px;">
    ${bigButton(calendar, "Book your free video call", "#B8956A", "#1A1612")}
    <p style="margin:-4px 0 18px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B6258;">30 minutes, no obligation. Pick any time that suits you.</p>
    ${bigButton(whatsapp, "Message me on WhatsApp", "#25D366", "#FFFFFF")}
  </div>
  ${detailsBlock(inquiry)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:8px 0 6px;border-top:1px solid #D9CEBC;">
    ${tiers.map((tier) => `<tr><td style="padding:12px 0;border-bottom:1px solid #EDE7DA;font-size:18px;">${escapeHtml(tier.name)} <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B6258;">${tier.hours} hours</span>${tier.slug === fitSlug ? ` <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">Best fit</span>` : tier.slug === stepUpSlug ? ` <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6B6258;">Worth a look</span>` : ""}</td><td style="padding:12px 0 12px 16px;border-bottom:1px solid #EDE7DA;text-align:right;white-space:nowrap;font-size:18px;">${money(tier.price)}</td></tr>`).join("")}
  </table>
  <p style="margin:0 0 26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B6258;">Canadian dollars, before tax.</p>
  <p style="margin:0;padding-top:16px;border-top:1px solid #EDE7DA;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B6258;">Arman Arai · Wedding photography · <a href="${SITE.url}" style="color:#6B6258;">${SITE.domain}</a> · ${escapeHtml(SITE.phone)}</p>
</div>`;
  const text = [
    body,
    `Book your free video call: ${calendar}`,
    `Message me on WhatsApp: ${whatsapp}`,
    `What you told me: ${[whenPhrase(inquiry) || "Date to be decided", inquiry.location, COVERAGE_OPTIONS.find((option) => option.value === inquiry.coverage)?.label ?? "Not sure yet", BUDGET_OPTIONS.find((option) => option.value === inquiry.budget)?.label ?? "Not sure yet"].join(" · ")}`,
    tiers.map((tier) => `${tier.name}, ${tier.hours} hours${tier.slug === fitSlug ? " (best fit)" : tier.slug === stepUpSlug ? " (worth a look)" : ""}: ${money(tier.price)}`).join("\n"),
    "Canadian dollars, before tax.",
    `Arman Arai · Wedding photography · ${SITE.domain} · ${SITE.phone}`,
  ].join("\n\n");
  return { html, text };
}

export async function sendInquiryAutoReply(inquiry: PricingInquiry): Promise<void> {
  const started = Date.now();
  const fit = recommendCollection(inquiry.coverage, inquiry.budget);
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
