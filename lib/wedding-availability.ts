// Confirmed wedding commitments supplied by Arman. Update this central list
// whenever a new wedding is secured; Calendly manages consultation times only.
const BOOKED_WEDDING_DATES = new Set(["2027-08-28"]);

export type WeddingAvailability = "available" | "unavailable";

export function weddingToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

export function checkWeddingDate(value: unknown, now = new Date()):
  { date: string; availability: WeddingAvailability } | { error: string } {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: "Choose a valid wedding date." };
  }
  const parsed = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return { error: "Choose a valid wedding date." };
  }
  if (value < weddingToday(now)) return { error: "Choose today or a future wedding date." };
  return { date: value, availability: BOOKED_WEDDING_DATES.has(value) ? "unavailable" : "available" };
}
