import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { META_PIXEL_ID } from "./analytics";

type InquiryConversion = {
  id: string;
  email: string;
  phone: string;
  page: unknown;
  fbclid?: unknown;
  headers: Headers;
  cookies: { get(name: string): { value: string } | undefined };
};

const origin = "https://www.armanarai.ca";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function sourceUrl(page: unknown) {
  if (typeof page !== "string" || !/^\/[a-z0-9/-]*$/i.test(page) ||
    /^\/(?:admin|api|portal|guide|christmas)(?:\/|$)/.test(page)) return `${origin}/contact`;
  const url = new URL(page, origin);
  return url.origin === origin ? url.href : `${origin}/contact`;
}

/** Use only known identifiers; never invent a browser ID or an ad click. */
export function weddingLeadEvent(input: InquiryConversion, now = Date.now()) {
  const email = input.email.trim().toLowerCase();
  let phone = input.phone.replace(/\D/g, "");
  if (phone.length === 10) phone = `1${phone}`; // Canadian / NANP local format.
  const userData: Record<string, string | string[]> = { em: [hash(email)] };
  if (/^[1-9]\d{10,14}$/.test(phone)) userData.ph = [hash(phone)];
  const fbp = input.cookies.get("_fbp")?.value;
  if (fbp && /^fb\.\d+\.\d{13}\.\d+$/.test(fbp)) userData.fbp = fbp;
  const fbc = input.cookies.get("_fbc")?.value;
  if (fbc && /^fb\.\d+\.\d{13}\.[a-z0-9_.-]{1,2048}$/i.test(fbc)) userData.fbc = fbc;
  else if (typeof input.fbclid === "string" && /^[a-z0-9_.-]{1,2048}$/i.test(input.fbclid)) {
    userData.fbc = `fb.1.${now}.${input.fbclid}`;
  }
  const ip = (input.headers.get("x-vercel-forwarded-for") || input.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (isIP(ip)) userData.client_ip_address = ip;
  const agent = input.headers.get("user-agent");
  if (agent) userData.client_user_agent = agent.slice(0, 1024);
  // An optional owner-controlled test recipient goes to Test Events only.
  // Ordinary inquiries are never diverted when verifying a production setup.
  const testCode = hash(email) === process.env.META_WEDDING_TEST_EMAIL_HASH &&
    /^TEST[a-z0-9]+$/i.test(process.env.META_WEDDING_TEST_EVENT_CODE || "")
    ? process.env.META_WEDDING_TEST_EVENT_CODE : undefined;
  return {
    event_name: "Lead", event_id: `ca-lead-${input.id}`, event_time: Math.floor(now / 1000),
    action_source: "website", event_source_url: sourceUrl(input.page), user_data: userData,
    custom_data: { content_name: "Wedding photography inquiry", content_category: "wedding_photography" },
    ...(testCode ? { test_event_code: testCode } : {}),
  };
}

export type WeddingLeadEvent = ReturnType<typeof weddingLeadEvent>;

export const weddingMetaEnabled = () => process.env.VERCEL_ENV === "production" && Boolean(process.env.META_WEDDING_CONVERSIONS_ACCESS_TOKEN);

/** Runs after successful delivery, independently of the thank-you page and
 * the auto-reply. Retries keep the same event ID for Meta deduplication.
 * Credentials, contact details and Meta's response text must never be logged. */
export async function reportWeddingLead(input: InquiryConversion) {
  return reportWeddingLeadEvent(weddingLeadEvent(input), input.headers);
}

export async function reportWeddingLeadEvent(event: WeddingLeadEvent, headers: Headers) {
  if (headers.get("sec-gpc") === "1" || headers.get("dnt") === "1") return;
  // Wedding activation must not enable the separate Christmas delivery queue.
  const token = process.env.META_WEDDING_CONVERSIONS_ACCESS_TOKEN;
  if (process.env.VERCEL_ENV !== "production" || !token) return;
  const { test_event_code, ...eventData } = event;
  const payload = { data: [eventData], access_token: token, ...(test_event_code ? { test_event_code } : {}) };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`https://graph.facebook.com/v26.0/${META_PIXEL_ID}/events`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(4000), cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.events_received === 1) {
        console.info("Meta wedding Lead accepted", { eventId: event.event_id, source: event.event_source_url, test: Boolean(test_event_code) });
        return;
      }
      if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
      console.warn("Meta wedding Lead was not accepted", { status: response.status, code: Number(result?.error?.code) || undefined });
      return;
    } catch {
      if (attempt === 1) console.warn("Meta wedding Lead delivery failed after retry");
    }
  }
}
