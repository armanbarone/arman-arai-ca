/* Where a lead came from, for the owner's lead email (owner, 2026-10-02: "a
 * segment just for me ... to see if the lead came from google ads or
 * facebook ads").
 *
 * Google Ads tags every ad click with a click id (gclid, or wbraid/gbraid on
 * iOS), so its presence is proof of an ad click. Meta is less helpful: it adds
 * fbclid to every link clicked inside Facebook or Instagram, ads and ordinary
 * posts alike. A Meta ad is only certain when the ad's own URL carries paid
 * UTM tags, so without them the label says "Facebook or Instagram" and that
 * it may not have been an ad. */

export type LeadSource = { channel: "google-ads" | "meta-ads" | "meta" | "google" | "referral" | "campaign" | "direct"; label: string; detail: string[] };

const META_SOURCES = /^(facebook|fb|instagram|ig|meta)$/i;
const PAID_MEDIUMS = /^(cpc|ppc|paid|paid[_-]?social|paidsocial|ads?|social[_-]?paid)$/i;

export function leadSource(body: Record<string, unknown>): LeadSource {
  const get = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim().slice(0, 200) : "");
  const source = get("utm_source"), medium = get("utm_medium"), campaign = get("utm_campaign"), content = get("utm_content"), term = get("utm_term");
  const gclid = get("gclid"), fbclid = get("fbclid"), referrer = get("referrer");
  let host = "";
  try { host = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : ""; } catch { host = ""; }
  const detail = [
    campaign && `Campaign: ${campaign}`,
    term && `Keyword: ${term}`,
    content && `Ad: ${content}`,
    source && `utm: ${[source, medium].filter(Boolean).join(" / ")}`,
    host && `Came from: ${host}`,
  ].filter((line): line is string => Boolean(line));

  if (gclid || (/^google$/i.test(source) && PAID_MEDIUMS.test(medium))) {
    return { channel: "google-ads", label: "Google Ads", detail: [...(gclid ? ["Google click id present: this was an ad click"] : []), ...detail] };
  }
  if (META_SOURCES.test(source) && PAID_MEDIUMS.test(medium)) {
    return { channel: "meta-ads", label: "Facebook / Instagram ads", detail };
  }
  if (fbclid || /(^|\.)(facebook|instagram|fb)\.com$|^l\.facebook\.com$|^lm\.facebook\.com$/.test(host) || META_SOURCES.test(source)) {
    return { channel: "meta", label: "Facebook or Instagram", detail: ["Meta tags every click from its apps, ads or not. Add paid UTM tags to your Meta ads to tell them apart.", ...detail] };
  }
  if (source) return { channel: "campaign", label: `Campaign: ${source}`, detail };
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return { channel: "google", label: "Google search (not an ad)", detail };
  if (host && !/armanarai\.(ca|com)$/.test(host)) return { channel: "referral", label: `Referred by ${host}`, detail };
  return { channel: "direct", label: "Direct or unknown", detail: [...detail, "No ad click id and no referrer: typed in, bookmarked, or a blocked tracker."] };
}

const COLOURS: Record<LeadSource["channel"], { bg: string; fg: string }> = {
  "google-ads": { bg: "#E8F0FE", fg: "#1A56C4" },
  "meta-ads": { bg: "#EDE7FB", fg: "#5B3CC4" },
  meta: { bg: "#EDE7FB", fg: "#5B3CC4" },
  google: { bg: "#E9F5EC", fg: "#2D7A43" },
  referral: { bg: "#F3EFE6", fg: "#7A5A2E" },
  campaign: { bg: "#F3EFE6", fg: "#7A5A2E" },
  direct: { bg: "#F1F1F1", fg: "#555555" },
};

const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The box at the top of the owner's lead email. */
export function leadSourceBox(lead: LeadSource) {
  const { bg, fg } = COLOURS[lead.channel];
  return `<div style="margin:0 0 1.5rem;padding:14px 16px;background:${bg};border-radius:8px;font-family:Arial,Helvetica,sans-serif;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${fg};">Lead source</p>
    <p style="margin:0;font-size:18px;font-weight:bold;color:${fg};">${escape(lead.label)}</p>
    ${lead.detail.map((line) => `<p style="margin:4px 0 0;font-size:13px;color:#333;">${escape(line)}</p>`).join("")}
  </div>`;
}

/** "[Google Ads] " for the subject line, so the inbox shows it at a glance. */
export const leadSourceTag = (lead: LeadSource) =>
  lead.channel === "google-ads" ? "[Google Ads] " : lead.channel === "meta-ads" ? "[Meta Ads] " : lead.channel === "meta" ? "[Facebook/Instagram] " : "";
