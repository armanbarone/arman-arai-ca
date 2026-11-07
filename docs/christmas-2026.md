# Christmas sessions launch · November 2026

Public route: /christmas. Private confirmation links remain bearer-protected.

Owner-confirmed launch: approximately 45 minutes, Santa, three sets, ten edited digital photos. A mailed letter, complimentary keepsake, cookies and warm milk remain included. Album buyers receive twenty edited digital photos and may choose zero to three ten-page albums, twenty photos in each. Incremental prices are $67, $55 and $45. Albums are hand-delivered across Greater Vancouver through Surrey, arranged after selections, with no guaranteed pre-Christmas delivery.

Collection configuration, explicitly requested by the merchant: base GST 5% only; each optional album line GST 5% plus BC PST 7%. Totals including taxes: zero albums $315; one $390.04; two $451.64; three $502.04. The complimentary-print tax classification is the merchant's instruction, not an independently established tax exemption. The original BC PST 126 guidance was reviewed and the printed-keepsake issue explained to the merchant, who instructed retaining it as a gift with base GST-only collection. No tax registrations are created or expired.

Stripe's existing live base price is retained. A dedicated Christmas album product has three separate exclusive-tax prices. Hosted Checkout applies per-line manual GST and PST rates; no automatic-tax double collection. A paid invoice is created. Product and rates are provisioned idempotently through the existing production merchant connection, with a guard that verifies the known live base price/product. No customer's payment is made during deployment.

Studio: 583 E Kings Rd, North Vancouver, BC V7N 1J2. Plenty of street parking. Full refunds until 48 hours before the appointment; one free reschedule subject to remaining season availability. Contact the studio for changes; no self-service refund claim is made.

Calendar: November 9–December 20, 2026. Monday–Friday 9am–5pm, Saturday 10am–4pm, Sunday noon–3pm Pacific. December 10–12 blocked. One-hour allocations leave fifteen minutes after a 45-minute visit. All valid appointment times are offered (owner update). Manual blocks remain possible in admin. Earlier November and blocked dates display Closed. Actual purchased appointments display Sold out. Paid appointments are Sold, holds Reserved, unreleased times Not released.

Calendar migrations retain every paid/held reservation, previous manual blocks and legacy appointment times, and prevent overlap with new hourly slots. ETag compare-and-swap writes protect concurrent claims. Expired local deadlines do not release possibly payable Stripe sessions until Stripe confirms expiry. Signed webhook reconciliation and bearer-protected confirmation checks are idempotent. Public availability is no-store and refreshes every thirty seconds.

Activity notifications use only actual paid reservations from the past 24 hours. First name/city require separate opt-in; otherwise anonymous wording is used. No fabricated customer messages, seeded sales, appointment timestamps or private contact data appear in the feed.

Validation: node --experimental-strip-types --test scripts/christmas-inventory.test.mjs; node --test scripts/christmas-payments.test.cjs; TypeScript; production build; browser calendar/cart/form QA.


## Post-booking workflow update

Hosted Stripe Checkout now sets payment_intent_data.receipt_email explicitly, retains invoice creation, and returns to the private /christmas/confirmation page. invoice.paid synchronizes a delayed invoice link. The existing merchant webhook subscription is extended to include that event without removing its other events.

Verified paid events send the welcome/instructions email first (with an ICS calendar attachment), immediately followed by a separate family questionnaire email, then a studio notification. Each message has its own persisted sent timestamp and idempotency key, so a failed questionnaire delivery does not cause the welcome message to be resent on a later retry. Existing fully notified legacy reservations are not automatically emailed again.

The family form at /christmas/questionnaire uses purpose-specific HMAC tokens scoped to the reservation ID, with private no-store responses, noindex and no-referrer metadata. It accepts only paid reservations, checks same-origin writes, validates bounded fields and guardian consent, and preserves first submission time on updates. Questionnaire access does not grant confirmation access. The confirmation page independently links to the questionnaire and supports reopening/updating it.

The admin Christmas page has a month/date calendar, appointment details, album counts, email progress and private questionnaire answers. Public demo routes /christmas/confirmation/preview and /christmas/questionnaire/preview use synthetic data and explicitly take no payment and save no answers.

Returning from Stripe cancellation expires only the authenticated unpaid Checkout Session and releases only its matching hold; it cannot release a paid appointment. No card is charged during checkout-opening verification.

Research: Stripe fulfillment https://docs.stripe.com/checkout/fulfillment.md?ui=full-page ; Stripe receipts https://docs.stripe.com/receipts ; Pixieset questions https://blog.pixieset.com/blog/questions-photography-questionnaire/ ; Pixieset delivery https://help.pixieset.com/hc/en-us/articles/4415980653325-Creating-and-Sending-a-Questionnaire ; UW Santa preparation https://depts.washington.edu/uwautism/wp-content/uploads/2019/06/santa-tips.pdf .
