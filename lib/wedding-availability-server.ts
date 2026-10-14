import "server-only";
import {
  checkWeddingDate,
  type WeddingAvailability,
} from "./wedding-availability";

/* Kept apart from wedding-availability.ts because that module is imported by
   the date-check forms in the browser, and anything reaching the booking store
   from there pulls "server-only" into the client bundle and fails the build. */

/* Dates Arman is committed to that this site's booking store does not know
 * about: the .com elopements, and anything held by hand. Everything the studio
 * itself has booked is read from the bookings, because a list maintained by
 * hand goes stale the moment a wedding is signed and nobody edits the file.
 *
 * It had gone stale exactly that way: it held one date while a signed wedding
 * sat on 2027-05-28, so the site was telling couples that day was free. */
const MANUAL_COMMITMENTS = new Set([
  "2027-08-28", // Trinity & Noah, Banff elopement, booked on the .com side
]);

/** A booking only holds its date once it is past draft. */
const HOLDS_THE_DATE = [
  "contract_sent",
  "partially_signed",
  "signed",
  "booked",
  "in_planning",
  "completed",
];

/**
 * Every date Arman is already committed to: the studio's own bookings plus the
 * commitments it cannot see. Read at request time so a wedding signed this
 * morning blocks its date this afternoon.
 */
export async function bookedWeddingDates(): Promise<Set<string>> {
  const dates = new Set(MANUAL_COMMITMENTS);
  try {
    const { listBookings } = await import("./portal/store");
    for (const b of await listBookings()) {
      if (b.archivedAt || b.status === "cancelled") continue;
      if (!HOLDS_THE_DATE.includes(b.status)) continue;
      if (b.event?.date) dates.add(b.event.date);
      // A held backup date is a date he cannot sell either.
      if (b.event?.backupDate) dates.add(b.event.backupDate);
    }
  } catch {
    // If the store cannot be read, fall back to the commitments we are sure of
    // rather than telling a couple a date is free when it may not be.
  }
  return dates;
}

/** Validation plus the real answer. Use this, not checkWeddingDate alone. */
export async function checkWeddingDateLive(value: unknown, now = new Date()) {
  const base = checkWeddingDate(value, now);
  if ("error" in base) return base;
  const booked = await bookedWeddingDates();
  return {
    date: base.date,
    availability: booked.has(base.date)
      ? ("unavailable" as WeddingAvailability)
      : ("available" as WeddingAvailability),
  };
}
