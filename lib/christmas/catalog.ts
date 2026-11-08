// Prices and taxes are integer Canadian cents, including per-line rounding.
export const PACKAGES = [{
  id: "santa", name: "Christmas with Santa", tag: "YOUR FAMILY. A LITTLE SANTA MAGIC.", price: 25000, minutes: 30, images: 10, sets: 3, santa: true,
  description: "A private Christmas visit, a story to share, and photographs of your favourite people.",
  features: ["A 30-minute session with Santa", "10 edited, full-resolution digital photographs", "Photographs across all three Christmas sets", "Santa letter mailed to the kids", "A complimentary printed keepsake as a thank-you gift", "Cookies and warm milk for a cozy Christmas visit", "Private online gallery + personal print rights"],
}] as const;
export const ALBUM_ADDON = { name: "Christmas keepsake album", pages: 10, images: 20, prices: [6700, 5500, 4500], description: "A 10-page printed album with 20 photographs, hand-delivered across Greater Vancouver, as far as Surrey." } as const;
export const GST_PERCENT = 5, PST_PERCENT = 7;
export function validAlbumCount(n: unknown): n is number { return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 3; }
export function albumSubtotal(count: number) {
  if (!validAlbumCount(count)) throw Error("Choose zero to three albums.");
  return ALBUM_ADDON.prices.slice(0, count).reduce((sum, cents) => sum + cents, 0);
}
export const gstCents = (subtotal: number) => Math.round(subtotal * GST_PERCENT / 100);
export const pstCents = (subtotal: number) => Math.round(subtotal * PST_PERCENT / 100);
export const sessionSubtotal = (albums: number) => PACKAGES[0].price + albumSubtotal(albums);
export function sessionQuote(albums: number) {
  const albumCents = albumSubtotal(albums), subtotal = sessionSubtotal(albums);
  const gst = gstCents(PACKAGES[0].price) + ALBUM_ADDON.prices.slice(0, albums).reduce((sum, n) => sum + gstCents(n), 0);
  const pst = ALBUM_ADDON.prices.slice(0, albums).reduce((sum, n) => sum + pstCents(n), 0);
  return { albumCents, subtotal, gst, pst, total: subtotal + gst + pst };
}
export type PackageId = typeof PACKAGES[number]["id"];
export const packageById = (id: string) => PACKAGES.find(p => p.id === id);
export const money = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
export const dateLabel = (date: string, options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) => new Intl.DateTimeFormat("en-CA", { ...options, timeZone: "America/Vancouver" }).format(new Date(`${date}T12:00:00-08:00`));
export const timeLabel = (time: string) => { const [h, m] = time.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`; };
export type SlotStatus = "available" | "sold" | "reserved" | "unavailable" | "unreleased";
export interface PublicSlot { id: string; date: string; time: string; santa: boolean; available: boolean; status: SlotStatus }
export interface RecentBooking { id: string; text: string }
export interface Availability {
  mode: "live" | "test" | "preview" | "closed"; slots: PublicSlot[]; location: string;
  cancellationPolicy: string; publishableKey: string; message?: string; recentBookings?: RecentBooking[];
}
export const CALENDAR_START = "2026-11-01", SEASON_START = "2026-11-09", SEASON_END = "2026-12-20";
export const BLOCKED_DATES = new Set(["2026-12-10", "2026-12-11", "2026-12-12"]);
export const BOOKING_POLICY = "Cancel at least 48 hours before your appointment for a full refund. Cancellations within 48 hours are non-refundable. One reschedule is free, subject to an available appointment on or before December 20, 2026. Contact i@armanarai.com to cancel or reschedule.";
// Thirty-minute appointments start on the hour and half-hour.
export function dayHours(date: string): [number, number] {
  const weekday = new Date(date + "T12:00:00Z").getUTCDay();
  return weekday === 0 ? [12, 15] : weekday === 6 ? [10, 16] : [9, 17];
}
export function isSeasonDate(date: string) { return date >= SEASON_START && date <= SEASON_END && !BLOCKED_DATES.has(date); }
export function scheduledTime(date: string, time: string) {
  if (!/^2026-(11|12)-\d{2}$/.test(date) || !/^\d{2}:(00|30)$/.test(time)) return false;
  const d = new Date(date + "T12:00:00Z");
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== date) return false;
  const [start, end] = dayHours(date), hour = Number(time.slice(0, 2));
  return hour >= start && hour < end;
}
export function seasonalSlots(): PublicSlot[] {
  const result: PublicSlot[] = [];
  for (let day = new Date(CALENDAR_START + "T12:00:00Z"); day.toISOString().slice(0, 10) <= SEASON_END; day.setUTCDate(day.getUTCDate() + 1)) {
    const date = day.toISOString().slice(0, 10), [start, end] = dayHours(date);
    for (let minute = start * 60; minute < end * 60; minute += 30) {
      const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const status: SlotStatus = !isSeasonDate(date) ? "unavailable" : "available";
      result.push({ id: `${date}_${time.replace(":", "")}`, date, time, santa: true, available: status === "available", status });
    }
  }
  return result;
}
export const PREVIEW_AVAILABILITY: Availability = {
  mode: "preview", location: "583 E Kings Rd, North Vancouver, BC V7N 1J2", publishableKey: "", cancellationPolicy: BOOKING_POLICY,
  slots: seasonalSlots(), recentBookings: [],
};
