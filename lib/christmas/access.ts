import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { APP_URL } from "@/lib/portal/business";
import type { Reservation } from "./inventory";
type Purpose = "confirmation" | "questionnaire";
export function accessToken(r: Pick<Reservation, "id">, purpose: Purpose) {
  const secret = process.env.PORTAL_SECRET;
  if (!secret) throw Error("Private booking links are not configured.");
  return createHmac("sha256", secret).update(`christmas-2026:${purpose}:${r.id}`).digest("hex");
}
export function authorized(r: Reservation, purpose: Purpose, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const equal = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  if (purpose === "confirmation" && equal(r.tokenHash, createHash("sha256").update(token).digest("hex"))) return true;
  return equal(accessToken(r, purpose), token);
}
export function bookingLink(slotId: string, r: Reservation, purpose: Purpose) {
  return `${APP_URL}/christmas/${purpose}?slot=${encodeURIComponent(slotId)}&token=${accessToken(r, purpose)}`;
}
