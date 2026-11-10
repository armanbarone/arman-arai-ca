import type { Slot } from "./inventory";
export const SAMPLE_CHRISTMAS_BOOKING: Slot = {
  id: "2026-11-21_1000", date: "2026-11-21", time: "10:00", santa: true, published: true,
  reservation: {
    id: "SAMPLE-NOT-A-BOOKING", tokenHash: "", packageId: "santa", name: "Sample Family", email: "sample@example.invalid", phone: "+1 604 555 0100",
    createdAt: 1794024000000, expiresAt: 1794025800000, subtotalCents: 31700, totalCents: 33754, paidCents: 5000, status: "paid", albums: 1,
    paymentPlan: { kind: "deposit-50-v1", depositSubtotalCents: 4762, depositGstCents: 238, depositCents: 5000, depositPaidCents: 5000, balanceDueAt: new Date("2026-11-21T10:00:00-08:00").getTime() },
    packageSnapshot: { name: "Christmas with Santa", minutes: 30, images: 20, sets: 3, santa: true },
    bookingDetails: { studioAddress: "583 E Kings Rd, North Vancouver, BC", postalCode: "V7N 1J2", arrivalNotes: "Plenty of street parking.", cancellationPolicy: "Full refund at least 48 hours before your appointment. One free reschedule, subject to availability." },
  },
};
