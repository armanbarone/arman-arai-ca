import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { weddingMetaEnabled, type WeddingLeadEvent } from "./meta-conversions";

export const MONTREAL_CONFIRMATION_PATH = "/wedding-photography/montreal-pricing/thank-you";
export const MONTREAL_LEAD_COOKIE = "__Secure-aa_montreal_lead";
export const MONTREAL_RECEIPT_LIFETIME = 10 * 60;
const context = "aa:montreal:wedding-lead-receipt:v1";

function key() {
  const token = process.env.META_WEDDING_CONVERSIONS_ACCESS_TOKEN;
  return token ? createHash("sha256").update(`${context}:${token}`).digest() : null;
}

/** Only the successful inquiry handler issues this short-lived, authenticated,
 * encrypted receipt. It contains hashes and real ad identifiers, never the
 * couple's names, raw contact details, date, venue or message. */
export function createMontrealLeadReceipt(event: WeddingLeadEvent, headers: Headers) {
  if (!weddingMetaEnabled() || headers.get("sec-gpc") === "1" || headers.get("dnt") === "1") return null;
  const secret = key();
  if (!secret) return null;
  const { client_ip_address: _ip, client_user_agent: _agent, ...user_data } = event.user_data;
  const plaintext = JSON.stringify({ event_id: event.event_id, event_time: event.event_time, user_data, test_event_code: event.test_event_code });
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secret, iv);
  cipher.setAAD(Buffer.from(context));
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const value = Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
  return value.length <= 3800 ? value : null;
}

/** Called only while serving the real Montréal confirmation page. Without a
 * valid submission receipt, a direct visit, crawler or prefetch creates no Lead.
 * Reloads retain the same event ID and timestamp for Meta deduplication. */
export function montrealConfirmationEvent(value: string | undefined, headers: Headers, now = Date.now()): WeddingLeadEvent | null {
  if (!value || value.length > 3800 || !weddingMetaEnabled() || headers.get("sec-gpc") === "1" || headers.get("dnt") === "1") return null;
  if (headers.get("next-router-prefetch") === "1" || headers.get("purpose") === "prefetch" || headers.get("sec-purpose")?.includes("prefetch")) return null;
  const secret = key();
  if (!secret) return null;
  try {
    const bytes = Buffer.from(value, "base64url");
    if (bytes.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", secret, bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from(context));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const receipt = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8"));
    const age = Math.floor(now / 1000) - receipt.event_time;
    if (!/^ca-lead-[a-f0-9-]{36}$/i.test(receipt.event_id) || !Number.isSafeInteger(receipt.event_time) || age < 0 || age > MONTREAL_RECEIPT_LIFETIME || !Array.isArray(receipt.user_data?.em)) return null;
    const user_data = { ...receipt.user_data };
    const ip = (headers.get("x-vercel-forwarded-for") || headers.get("x-forwarded-for") || "").split(",")[0].trim();
    if (isIP(ip)) user_data.client_ip_address = ip;
    const agent = headers.get("user-agent");
    if (agent) user_data.client_user_agent = agent.slice(0, 1024);
    return {
      event_name: "Lead", event_id: receipt.event_id, event_time: receipt.event_time,
      action_source: "website", event_source_url: `https://www.armanarai.ca${MONTREAL_CONFIRMATION_PATH}`,
      user_data, custom_data: { content_name: "Wedding photography inquiry", content_category: "wedding_photography" },
      ...(receipt.test_event_code ? { test_event_code: String(receipt.test_event_code) } : {}),
    };
  } catch { return null; }
}
