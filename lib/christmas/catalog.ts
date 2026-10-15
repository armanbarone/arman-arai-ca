export const PACKAGES = [
  { id: "family", name: "Christmas together", tag: "THE FAMILY SESSION", price: 24900, minutes: 15, images: 8, sets: 2, santa: false,
    description: "Just your people, a little Christmas magic, and photographs that feel like you.",
    features: ["15 minutes in the Christmas studio", "8 edited, full-resolution photographs", "Two styled settings", "Private online gallery + personal print rights"] },
  { id: "santa", name: "A little Santa magic", tag: "FAMILY + SANTA", price: 34900, minutes: 20, images: 10, sets: 2, santa: true,
    description: "A private visit with Santa, a story to share, and a family portrait to keep.",
    features: ["20 minutes, including your Santa visit", "10 edited, full-resolution photographs", "Family portraits + photographs with Santa", "Private online gallery + personal print rights"] },
  { id: "keepsake", name: "The whole Christmas story", tag: "THE KEEPSAKE SESSION", price: 49900, minutes: 35, images: 20, sets: 3, santa: true,
    description: "A little more time for shy smiles, siblings, Santa, and all the in-between moments.",
    features: ["35 minutes, including your Santa visit", "20 edited, full-resolution photographs", "Three styled settings", "Private online gallery + personal print rights"] },
] as const;
export type PackageId = typeof PACKAGES[number]["id"];
export const packageById = (id: string) => PACKAGES.find(p => p.id === id);
export const money = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents);
export const dateLabel = (date: string, options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  new Intl.DateTimeFormat("en-CA", { ...options, timeZone: "America/Vancouver" }).format(new Date(`${date}T12:00:00-08:00`));
export const timeLabel = (time: string) => { const [h, m] = time.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`; };
export interface PublicSlot { id: string; date: string; time: string; santa: boolean; available: boolean }
export interface Availability {
  mode: "live" | "preview" | "closed"; slots: PublicSlot[]; location: string;
  cancellationPolicy: string; publishableKey: string; message?: string;
}
export const PREVIEW_AVAILABILITY: Availability = {
  mode: "preview", location: "Vancouver, BC · Studio address confirmed before launch", publishableKey: "",
  cancellationPolicy: "Rescheduling and cancellation terms will be published before bookings open.",
  slots: ["2026-11-28", "2026-12-05", "2026-12-12"].flatMap((date, i) =>
    ["10:00", "10:40", "11:20", "13:00", "13:40", "14:20"].map(time => ({ id: `${date}_${time.replace(":", "")}`, date, time, santa: i !== 0, available: true }))),
};
