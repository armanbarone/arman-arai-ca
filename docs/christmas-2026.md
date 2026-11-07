# Christmas sessions launch · November 2026

Public route: /christmas. Private confirmation links remain bearer-protected.

Owner-confirmed launch: approximately 45 minutes, Santa, three sets, ten edited digital photos. A mailed letter, complimentary keepsake, cookies and warm milk remain included. Album buyers receive twenty edited digital photos and may choose zero to three ten-page albums, twenty photos in each. Incremental prices are $67, $55 and $45. Albums are hand-delivered across Greater Vancouver through Surrey, arranged after selections, with no guaranteed pre-Christmas delivery.

Collection configuration, explicitly requested by the merchant: base GST 5% only; each optional album line GST 5% plus BC PST 7%. Totals including taxes: zero albums $315; one $390.04; two $451.64; three $502.04. The complimentary-print tax classification is the merchant's instruction, not an independently established tax exemption. The original BC PST 126 guidance was reviewed and the printed-keepsake issue explained to the merchant, who instructed retaining it as a gift with base GST-only collection. No tax registrations are created or expired.

Stripe's existing live base price is retained. A dedicated Christmas album product has three separate exclusive-tax prices. Hosted Checkout applies per-line manual GST and PST rates; no automatic-tax double collection. A paid invoice is created. Product and rates are provisioned idempotently through the existing production merchant connection, with a guard that verifies the known live base price/product. No customer's payment is made during deployment.

Studio: 583 E Kings Rd, North Vancouver, BC V7N 1J2. Plenty of street parking. Full refunds until 48 hours before the appointment; one free reschedule subject to remaining season availability. Contact the studio for changes; no self-service refund claim is made.

Calendar: November 9–December 20, 2026. Monday–Friday 9am–5pm, Saturday 10am–4pm, Sunday noon–3pm Pacific. December 10–12 blocked. One-hour allocations leave fifteen minutes after a 45-minute visit. Three times per weekday/Saturday and two per Sunday initially released; admin may release more real times. Earlier November and blocked dates display Unavailable, never fabricated Sold. Paid appointments are Sold, holds Reserved, unreleased times Not released.

Calendar migrations retain every paid/held reservation, previous manual blocks and legacy appointment times, and prevent overlap with new hourly slots. ETag compare-and-swap writes protect concurrent claims. Expired local deadlines do not release possibly payable Stripe sessions until Stripe confirms expiry. Signed webhook reconciliation and bearer-protected confirmation checks are idempotent. Public availability is no-store and refreshes every thirty seconds.

Activity notifications use only actual paid reservations from the past 24 hours. First name/city require separate opt-in; otherwise anonymous wording is used. No fabricated customer messages, seeded sales, appointment timestamps or private contact data appear in the feed.

Validation: node --experimental-strip-types --test scripts/christmas-inventory.test.mjs; node --test scripts/christmas-payments.test.cjs; TypeScript; production build; browser calendar/cart/form QA.
