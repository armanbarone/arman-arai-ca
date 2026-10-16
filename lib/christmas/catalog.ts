// All amounts are integer Canadian cents. Convert once, only for display.
export const PACKAGES = [
  { id: "santa", name: "Christmas with Santa", tag: "YOUR FAMILY. A LITTLE SANTA MAGIC.", price: 30000, minutes: 20, images: 10, sets: 2, santa: true,
    description: "A private Christmas visit, a story to share, and photographs of your favourite people.",
    features: ["20-minute Christmas session with Santa", "10 edited, full-resolution digital photographs", "Two styled Christmas settings", "Private online gallery + personal print rights"] },
] as const;
export const GST_PERCENT = 5;
export const gstCents = (subtotal: number) => Math.round(subtotal * GST_PERCENT / 100);
export const totalCents = (subtotal: number) => subtotal + gstCents(subtotal);
export type PackageId = typeof PACKAGES[number]["id"];
export const packageById = (id: string) => PACKAGES.find(p => p.id === id);
export const money = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
export const dateLabel = (date: string, options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  new Intl.DateTimeFormat("en-CA", { ...options, timeZone: "America/Vancouver" }).format(new Date(`${date}T12:00:00-08:00`));
export const timeLabel = (time: string) => { const [h, m] = time.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`; };
export interface PublicSlot { id: string; date: string; time: string; santa: boolean; available: boolean }
export interface Availability {
  mode: "live" | "preview" | "closed"; slots: PublicSlot[]; location: string;
  cancellationPolicy: string; publishableKey: string; message?: string;
}
export const SEASON_START = "2026-11-27", SEASON_END = "2026-12-23";
// Every day, 11am–8pm: a 20-minute shoot plus 10 minutes for changeover.
export function seasonalSlots(): PublicSlot[] {
  const result: PublicSlot[] = [];
  for (let day = new Date(SEASON_START + "T12:00:00Z"); day.toISOString().slice(0, 10) <= SEASON_END; day.setUTCDate(day.getUTCDate() + 1)) {
    const date = day.toISOString().slice(0, 10);
    for (let minutes = 11 * 60; minutes < 20 * 60; minutes += 30) {
      const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      result.push({ id: `${date}_${time.replace(":", "")}`, date, time, santa: true, available: true });
    }
  }
  return result;
}
export const PREVIEW_AVAILABILITY: Availability = {
  mode: "preview", location: "North Vancouver, BC", publishableKey: "",
  cancellationPolicy: "Rescheduling and cancellation terms will be published before bookings open.",
  slots: seasonalSlots(),
};
