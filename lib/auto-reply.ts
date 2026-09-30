import Anthropic from "@anthropic-ai/sdk";
import { oidcFederationProvider } from "@anthropic-ai/sdk/lib/credentials/oidc-federation";
import { getVercelOidcToken } from "@vercel/oidc";
import { SITE, tierBySlug } from "./site";
import { inquiryBrief } from "./auto-reply-brief";
import { weddingCalendarUrl } from "./wedding-booking";
import {
  BUDGET_OPTIONS, COVERAGE_OPTIONS, longDate, pricingTiers, recommendCollection, tierItems, weekdayOf,
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
function claude() {
  const config = federation();
  if (!config) return null;
  const baseURL = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  client ??= new Anthropic({
    apiKey: null,
    authToken: null,
    baseURL,
    credentials: oidcFederationProvider({ ...config, identityTokenProvider: () => getVercelOidcToken(), baseURL, fetch }),
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
  return `Write the email for this inquiry. The collection that fits best is ${fitName}, chosen from ${basis}.

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
  if (body.length < 300 || body.length > 2200) return null;
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
async function writeWithClaude(inquiry: PricingInquiry, fitName: string, basis: string): Promise<string | "skip" | null> {
  const api = claude();
  if (!api) return null;
  const response = await api.messages.create({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: inquiryBrief(inquiry.market, inquiry.cityName),
    messages: [{ role: "user", content: inquiryPrompt(inquiry, fitName, basis) }],
  });
  if (response.stop_reason !== "end_turn") return null;
  const text = response.content.filter((block): block is Anthropic.TextBlock => block.type === "text").map((block) => block.text).join("").trim();
  if (text === "SKIP") return "skip";
  return checkedBody(text);
}

export function fallbackBody(inquiry: PricingInquiry, fitName: string) {
  const fit = tierBySlug(recommendCollection(inquiry.coverage, inquiry.budget).slug)!;
  const name = greetingName(inquiry.names);
  const when = whenPhrase(inquiry);
  const details = [when && `for ${when}`, inquiry.location && `at ${inquiry.location}`].filter(Boolean).join(" ");
  return [
    `Hi ${name || "there"},`,
    `Thank you for sending your wedding details${details ? ` ${details}` : ""}. From what you told me, ${fitName} looks like the right fit: ${fit.coverage.toLowerCase()}, ${fit.images.toLowerCase()} and ${fit.film ? fit.film.charAt(0).toLowerCase() + fit.film.slice(1) : fit.engagement.toLowerCase()}, at ${money(fit.price)} before tax. ${inquiry.market.travelNote}`,
    "Your full pricing is below. The easiest next step is a free 30-minute video call, where we can talk through your day and the photographs you love. If a call doesn't suit you, reply to this email or message me on WhatsApp.",
    "Arman",
  ].join("\n\n");
}

function render(inquiry: PricingInquiry, body: string, fitSlug: string) {
  const calendar = weddingCalendarUrl("?utm_source=auto-reply-email&utm_medium=email", new URL(SITE.url).hostname, false, { page: inquiry.page, prefill: { name: inquiry.names, email: inquiry.email } });
  const whatsapp = `https://wa.me/${SITE.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi Arman, it's ${inquiry.names}. We asked about wedding photography in ${inquiry.cityName}.`)}`;
  const tiers = pricingTiers();
  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2420;font-size:16px;line-height:1.65;">
  ${body.split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}
  <table style="width:100%;border-collapse:collapse;margin:26px 0 8px;border-top:1px solid #D9CEBC;">
    ${tiers.map((tier) => `<tr><td style="padding:14px 0;border-bottom:1px solid #EDE7DA;vertical-align:top;"><strong style="font-weight:normal;font-size:19px;">${escapeHtml(tier.name)}</strong>${tier.slug === fitSlug ? ` <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#A67268;">Best fit</span>` : ""}<br><span style="font-family:Arial,sans-serif;font-size:13px;color:#6B6258;">${escapeHtml(tierItems(tier).slice(0, 4).join(" · "))}</span></td><td style="padding:14px 0 14px 16px;border-bottom:1px solid #EDE7DA;text-align:right;vertical-align:top;white-space:nowrap;font-size:19px;">${money(tier.price)}</td></tr>`).join("")}
  </table>
  <p style="margin:0 0 26px;font-family:Arial,sans-serif;font-size:12px;color:#6B6258;">Canadian dollars before tax. ${escapeHtml(inquiry.market.travelNote)}</p>
  <p style="margin:0 0 12px;"><a href="${escapeHtml(calendar)}" style="display:inline-block;background:#1A1612;color:#F3EEDF;text-decoration:none;padding:13px 20px;font-family:Arial,sans-serif;font-size:14px;">Choose a time for a free video call</a></p>
  <p style="margin:0 0 30px;font-family:Arial,sans-serif;font-size:14px;"><a href="${escapeHtml(whatsapp)}" style="color:#1A1612;">Message me on WhatsApp</a> &nbsp;·&nbsp; or just reply to this email</p>
  <p style="margin:0;padding-top:16px;border-top:1px solid #EDE7DA;font-family:Arial,sans-serif;font-size:12px;color:#6B6258;">Arman Arai · Wedding photography · <a href="${SITE.url}" style="color:#6B6258;">${SITE.domain}</a> · ${escapeHtml(SITE.phone)}</p>
</div>`;
  const text = [
    body,
    tiers.map((tier) => `${tier.name}${tier.slug === fitSlug ? " (best fit)" : ""}: ${money(tier.price)}`).join("\n"),
    `Canadian dollars before tax. ${inquiry.market.travelNote}`,
    `Choose a time for a free video call: ${calendar}`,
    `Message me on WhatsApp: ${whatsapp}`,
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
  let source = "claude";
  try {
    const written = await writeWithClaude(inquiry, fitName, basis);
    if (written === "skip") { console.info("Auto-reply: skipped, not a wedding inquiry"); return; }
    body = written;
  } catch (error) {
    console.warn("Auto-reply: Claude call failed", error instanceof Anthropic.APIError ? error.status : error);
  }
  if (!body) { body = fallbackBody(inquiry, fitName); source = "template"; }
  const { html, text } = render(inquiry, body, fit.slug);
  const subject = `Your wedding photography pricing, ${greetingName(inquiry.names) || inquiry.cityName}`.replace(/[\r\n]+/g, " ").slice(0, 120);
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
