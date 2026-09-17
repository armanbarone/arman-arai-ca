import type { Booking, Installment, Lang, PriceLine, TaxLine } from "./types";
import { BUSINESS } from "./business";

const LOCALE: Record<Lang, string> = { en: "en-CA", fr: "fr-CA" };

export function formatCad(cents: number, lang: Lang = "en"): string {
  return new Intl.NumberFormat(LOCALE[lang], { style: "currency", currency: "CAD" }).format(cents / 100);
}

export function formatDate(isoDate: string, lang: Lang = "en"): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat(LOCALE[lang], { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatRate(bps: number, lang: Lang = "en"): string {
  const pct = (bps / 100).toLocaleString(LOCALE[lang], { maximumFractionDigits: 3 });
  return lang === "fr" ? `${pct} %` : `${pct}%`;
}

/** Parse "4,200.50" / "4200" / "4 200,50" typed by an admin into cents. */
export function parseCadToCents(input: string): number {
  const cleaned = input.replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  // A comma followed by exactly two digits at the end is a French decimal.
  const normal = /,\d{2}$/.test(cleaned) && !cleaned.includes(".")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const value = Number(normal);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/** Integer division rounded half up, for non-negative numerators. */
export function roundDiv(numerator: number, denominator: number): number {
  const sign = numerator < 0 ? -1 : 1;
  const n = Math.abs(numerator);
  return sign * Math.floor((2 * n + denominator) / (2 * denominator));
}

export function todayInBusinessTz(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS.timezone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date());
}

/** Count back whole calendar months, clamping to month-end when the day does not exist. */
export function monthsBefore(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  let year = y;
  let month = m - months; // 1-based
  while (month < 1) { month += 12; year -= 1; }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function computeTotals(lines: PriceLine[], taxes: TaxLine[]) {
  const subtotalCents = lines.reduce((sum, l) => sum + l.cents, 0);
  const taxCents: Record<string, number> = {};
  for (const t of taxes) taxCents[t.code] = roundDiv(Math.max(0, subtotalCents) * t.rateBps, 10000);
  const taxTotalCents = Object.values(taxCents).reduce((a, b) => a + b, 0);
  return { subtotalCents, taxCents, taxTotalCents, totalCents: subtotalCents + taxTotalCents };
}

const PARTS = [
  { label: "Non-refundable deposit", kind: "deposit" as const, months: 0, rule: "At booking. Locks your date and vendors." },
  { label: "Second instalment", kind: "instalment" as const, months: 6, rule: "6 calendar months before the elopement" },
  { label: "Third instalment", kind: "instalment" as const, months: 3, rule: "3 calendar months before the elopement" },
  { label: "Final instalment", kind: "instalment" as const, months: 1, rule: "1 calendar month before the elopement" },
];

/**
 * Four payments of 25% of the total including tax (agreement section 9).
 * Each part carries its own share of the subtotal and of every tax line; the
 * final part takes whatever rounding left over, so the four always sum to the
 * booking figures to the cent. A due date that has already passed on the
 * booking date is due at booking.
 */
export function buildSchedule(booking: Pick<Booking, "ref" | "event" | "totals" | "taxes">, bookingDate: string, existing?: Installment[]): Installment[] {
  const { subtotalCents, taxCents } = booking.totals;
  let subLeft = subtotalCents;
  const taxLeft: Record<string, number> = { ...taxCents };

  return PARTS.map((part, i) => {
    const last = i === PARTS.length - 1;
    const sub = last ? subLeft : roundDiv(subtotalCents, 4);
    subLeft -= sub;
    const taxes: Record<string, number> = {};
    for (const code of Object.keys(taxCents)) {
      taxes[code] = last ? taxLeft[code] : roundDiv(taxCents[code], 4);
      taxLeft[code] -= taxes[code];
    }
    const total = sub + Object.values(taxes).reduce((a, b) => a + b, 0);
    let due = part.months === 0 || !booking.event.date ? bookingDate : monthsBefore(booking.event.date, part.months);
    if (due < bookingDate) due = bookingDate;
    const prior = existing?.[i];
    const id = `i${i + 1}`;
    return {
      id,
      label: part.label,
      kind: part.kind,
      dueDate: due,
      dueRule: part.rule,
      subtotalCents: sub,
      taxCents: taxes,
      totalCents: total,
      paidCents: prior?.paidCents ?? 0,
      status: prior?.status ?? "scheduled",
      paidAt: prior?.paidAt,
      reference: `${booking.ref}-${String(i + 1).padStart(2, "0")}`,
      clientReportedSentAt: prior?.clientReportedSentAt,
    };
  });
}
