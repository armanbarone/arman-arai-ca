import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { META_PIXEL_ID } from "@/lib/analytics";
import { readJson, writeJson, listJson, remove, ConflictError } from "@/lib/portal/store";
import { inventoryStore, allSlots, updateSlot } from "./store";

export type ChristmasMetaAttribution = { allowed: boolean; fbp?: string; fbc?: string; ip?: string; agent?: string };
type EventName = "InitiateCheckout" | "Purchase";
type MetaJob = { id: string; name: EventName; at: number; cents: number; albums: number; user?: Record<string, string>; sentAt?: number; leaseUntil?: number; attemptedAt?: number; attempts: number; error?: string; expired?: boolean };
const prefix = "christmas/2026/meta/";
const path = (id: string) => `${prefix}${id}.json`;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const christmasMetaEventId = (id: string, name: EventName) => hash(name === "Purchase" ? `christmas-2026:meta:${id}` : `christmas-2026:checkout:${id}`);

export function christmasMetaAttribution(req: Request, optOut = false, fbclid?: string): ChristmasMetaAttribution {
  const allowed = !optOut && req.headers.get("sec-gpc") !== "1" && req.headers.get("dnt") !== "1";
  if (!allowed) return { allowed: false };
  const cookies = new Map((req.headers.get("cookie") || "").split(";").map(c => { const i = c.indexOf("="); return [c.slice(0, i).trim(), c.slice(i + 1).trim()]; }));
  const fbp = cookies.get("_fbp"), fbc = cookies.get("_fbc");
  const ip = (req.headers.get("x-vercel-forwarded-for") || req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return { allowed,
    fbp: fbp && /^fb\.\d+\.\d{13}\.\d+$/.test(fbp) ? fbp : undefined,
    fbc: fbc && /^fb\.\d+\.\d{13}\.[a-z0-9_.-]{1,2048}$/i.test(fbc) ? fbc : fbclid && /^[a-z0-9_.-]{1,2048}$/i.test(fbclid) ? `fb.1.${Date.now()}.${fbclid}` : undefined,
    ip: isIP(ip) ? ip : undefined, agent: req.headers.get("user-agent")?.slice(0, 1024) || undefined,
  };
}

export function christmasMetaEvent(job: MetaJob) {
  return { event_name: job.name, event_id: job.id, event_time: Math.floor(job.at / 1000), action_source: "website",
    event_source_url: `https://www.armanarai.ca/christmas${job.name === "Purchase" ? "/confirmation" : ""}`,
    user_data: job.user, custom_data: { value: job.cents / 100, currency: "CAD", content_name: "Christmas with Santa 2026", content_category: "christmas_sessions", num_albums: job.albums },
  };
}

async function changeJob(id: string, change: (j: MetaJob) => void) {
  for (let n = 0; n < 5; n++) {
    const row = await readJson<MetaJob>(path(id)); if (!row) return;
    change(row.data);
    try { await writeJson(path(id), row.data, { etag: row.etag }); return row.data; }
    catch (error) { if (!(error instanceof ConflictError)) throw error; }
  }
  throw Error("Meta delivery record is updating.");
}

export async function queueChristmasMeta(slotId: string, name: EventName) {
  if (process.env.VERCEL_ENV !== "production") return;
  const r = (await inventoryStore.read(slotId))?.data.reservation;
  // Never backfill historical clients or turn a test/unpaid visit into a sale.
  if (!r?.metaAttribution?.allowed || r.testMode || r.ownerPaymentCheck || !r.sessionId || (name === "Purchase" && r.status !== "paid")) return;
  const cents = name === "Purchase" ? r.paymentPlan?.depositPaidCents ?? r.paidCents : r.paymentPlan?.depositCents ?? r.totalCents;
  if (!Number.isSafeInteger(cents) || !cents || cents <= 0) return;
  const at = name === "Purchase" ? r.paidAt : r.createdAt;
  if (!at || Date.now() - at > 47 * 3600000) return;
  const a = r.metaAttribution, user: Record<string, string> = {};
  if (a.fbp) user.fbp = a.fbp; if (a.fbc) user.fbc = a.fbc;
  if (a.ip) user.client_ip_address = a.ip; if (a.agent) user.client_user_agent = a.agent;
  if (!user.fbp && !user.fbc && !(user.client_ip_address && user.client_user_agent)) return;
  const id = christmasMetaEventId(r.id, name);
  try { await writeJson(path(id), { id, name, at, cents, albums: r.albums ?? 0, user, attempts: 0 } satisfies MetaJob, { createOnly: true }); }
  catch (error) { if (!(error instanceof ConflictError)) throw error; }
  if (name === "Purchase") await updateSlot(slotId, s => { if (s.reservation?.id === r.id) s.reservation.metaPurchaseQueuedAt ??= Date.now(); });
  const purchaseQueued = name === "Purchase" || !!r.metaPurchaseQueuedAt;
  if (purchaseQueued && (name === "InitiateCheckout" || await readJson(path(christmasMetaEventId(r.id, "InitiateCheckout"))))) {
    await updateSlot(slotId, s => { if (s.reservation?.id === r.id) s.reservation.metaAttribution = { allowed: true }; });
  }
  return id;
}

/** No tokens, customer contact details, private links or response bodies are logged. */
export async function deliverChristmasMeta(id: string) {
  const token = process.env.META_CONVERSIONS_ACCESS_TOKEN;
  if (process.env.VERCEL_ENV !== "production") return "not_configured";
  if (!token) {
    await changeJob(id, j => { if (Date.now() - j.at > 47 * 3600000) { j.expired = true; delete j.user; } });
    return "not_configured";
  }
  let claimed: MetaJob | undefined;
  await changeJob(id, j => {
    claimed = undefined;
    if (j.sentAt || j.expired || (j.leaseUntil ?? 0) > Date.now()) return;
    if (Date.now() - j.at > 47 * 3600000) { j.expired = true; delete j.user; return; }
    j.leaseUntil = Date.now() + 30000; j.attemptedAt = Date.now(); j.attempts++; claimed = structuredClone(j);
  });
  if (!claimed) return "already_sent_or_busy";
  let sent = false, failure = "network_error";
  const body = JSON.stringify({ data: [christmasMetaEvent(claimed)], access_token: token });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`https://graph.facebook.com/v26.0/${META_PIXEL_ID}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(4000), cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.events_received === 1) { sent = true; break; }
      failure = `http_${response.status}_code_${Number(result?.error?.code) || 0}`;
      if (response.status !== 429 && response.status < 500) break;
    } catch { /* Retry the same event ID and original timestamp. */ }
  }
  await changeJob(id, j => { delete j.leaseUntil; if (sent) { j.sentAt = Date.now(); delete j.error; delete j.user; } else j.error = failure; });
  if (!sent) console.warn("Christmas Meta event delivery pending", { event: claimed.name, reason: failure });
  return sent ? "sent" : "pending";
}

export async function reportChristmasMeta(slotId: string, name: EventName) {
  try { const id = await queueChristmasMeta(slotId, name); if (id) return await deliverChristmasMeta(id); }
  catch { console.warn("Christmas Meta event queued for retry", { event: name }); }
}

export async function retryChristmasMeta() {
  if (process.env.VERCEL_ENV !== "production") return;
  // Recover a paid event even if storage failed immediately after payment.
  for (const s of await allSlots()) {
    const r = s.reservation;
    if (r?.status === "paid" && r.metaAttribution?.allowed && !r.metaPurchaseQueuedAt) await queueChristmasMeta(s.id, "Purchase");
    if (r?.metaAttribution && Date.now() - (r.paidAt ?? r.createdAt) > 48 * 3600000) await updateSlot(s.id, slot => { if (slot.reservation?.id === r.id) slot.reservation.metaAttribution = { allowed: r.metaAttribution!.allowed }; });
  }
  const jobs = (await listJson<MetaJob>(prefix)).map(row => row.data);
  for (const j of jobs.filter(j => Date.now() - j.at > 30 * 86400000)) await remove(path(j.id));
  const due = jobs.filter(j => !j.sentAt && !j.expired && (j.leaseUntil ?? 0) <= Date.now()).sort((a, b) => a.at - b.at).slice(0, 10);
  return Promise.allSettled(due.map(j => deliverChristmasMeta(j.id)));
}
