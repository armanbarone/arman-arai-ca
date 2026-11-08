import type { InquiryFields } from "./contact-form";
import { pricingThankYouPath } from "./analytics";

export type SentInquiry = {
  id?: string;
  page?: string;
  market: string;
  sentAt: number;
  names: string;
  email: string;
  phone: string;
  date?: string;
  location: string;
  referral: string;
  message: string;
  emailed: boolean;
};

const SENT_KEY = "aa_ca_pricing_inquiry_v1";
const SENT_LIFETIME = 2 * 60 * 60 * 1000;
let latest: SentInquiry | null = null;
const markets = ["vancouver", "toronto", "montreal", "calgary", "victoria"];

/** Keep the relevant city's existing landing-page confirmation. General
 * inquiries use Vancouver when neither the location nor the page names a city. */
export function inquiryMarket(location: string, page: string) {
  for (const value of [location, page]) {
    const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const market = markets.find((city) => new RegExp(`\\b${city}\\b`).test(normalized));
    if (market) return market;
    if (/\b(banff|canmore|lake louise|kananaskis)\b/.test(normalized)) return "calgary";
  }
  return "vancouver";
}

/** Call only after /api/contact confirms delivery. Client navigation preserves
 * the in-memory receipt even if the browser blocks session storage. */
export function completeInquiry(fields: InquiryFields, emailed: boolean, market?: string) {
  const page = window.location.pathname;
  latest = {
    id: crypto.randomUUID(), page,
    market: market && markets.includes(market) ? market : inquiryMarket(fields.location || "", page),
    sentAt: Date.now(),
    names: [fields.firstName, fields.lastName].filter(Boolean).join(" "),
    email: fields.email || "", phone: fields.phone || "", date: fields.weddingDate || undefined,
    location: fields.location || "", referral: fields.referral || "", message: fields.message || "", emailed,
  };
  try { sessionStorage.setItem(SENT_KEY, JSON.stringify(latest)); } catch { /* The receipt survives client navigation in memory. */ }
  return pricingThankYouPath(latest.market);
}

export function readSentInquiry(market: string): SentInquiry | null {
  let sent: SentInquiry | null = latest;
  if (!sent) {
    try { sent = JSON.parse(sessionStorage.getItem(SENT_KEY) || "null"); } catch { /* No stored receipt. */ }
  }
  if (!sent || sent.market !== market || typeof sent.names !== "string" || typeof sent.sentAt !== "number" ||
    sent.sentAt > Date.now() || Date.now() - sent.sentAt > SENT_LIFETIME) return null;
  return sent;
}
