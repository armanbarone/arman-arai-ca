# Christmas sessions · Vancouver 2026

## Pages

- `/christmas`: customer landing page, cart, calendar, contact details and embedded Stripe Checkout.
- `/christmas/preview`: sample appointments and a clearly labelled preview flow. No contact details are sent, no inventory is held, and no payment is taken.
- `/christmas/confirmation`: private bearer-token booking lookup. Only verified Stripe payments display confirmation. Excluded from advertising tracking and search indexing.
- `/admin/christmas`: existing admin sign-in, studio settings, appointment releases and purchases.

## Launch

1. Review the proposed packages and delivery promises in `lib/christmas/catalog.ts` and `components/christmas/ChristmasExperience.tsx`. Prices are CAD $249 / $349 / $499 plus applicable tax. This version sells digital photographs; prints are not included.
2. Replace the three AI concept photographs under `public/christmas/` with photographs of the completed studio when available. Update the visible concept captions and alt text together. No claim that the generated families are previous clients is made.
3. Connect the existing Canadian live Stripe account through `/admin/payment-settings`. The Christmas integration uses the existing `STRIPE_SECRET_KEY`, webhook and private Vercel Blob store. No secret keys belong in the repository or browser.
4. Enable and configure Stripe Tax in the merchant account. Checkout uses automatic tax, exclusive of the advertised collection price, and collects a billing address.
5. In `/admin/christmas`, enter the actual studio street address, postal code, arrival/access notes, cancellation policy and the matching live **publishable** key (`pk_live_…`). This field must never receive a secret key.
6. Release the appointments that will actually be offered. Mark Santa only after the performer is confirmed. Each allocation is 40 minutes, including turnover. Calendar dates are restricted to November 27–December 23, 2026, Vancouver time. Keep the studio and Santa calendars clear of conflicting commitments before releasing slots.
7. Open bookings in the admin settings. Before advertising, verify the complete payment, tax, email and booking confirmation flow in the actual Vercel environment. Live card processing cannot be verified without the merchant connection. Do not open sales with an untested payment configuration.

The public page shows a closed-bookings message by default. The preview provides the full visual booking flow while live configuration is incomplete. No fake sold-out dates, countdowns, purchase notifications or manufactured remaining counts are used. A remaining-appointments notice appears only when 1–3 real available appointments for the selected collection remain in the published inventory. A smaller first release is supported by actually releasing fewer appointments.

## Inventory and payment behavior

- Private storage under `christmas/2026/` uses the existing conditional-write Blob adapter. Reservation claims are compare-and-swap operations; simultaneous purchases cannot claim the same appointment.
- The published calendar returns no customer contact information or booking tokens.
- A hold is created when the customer proceeds to Stripe, never merely when clicking a date. Holds expire with their fixed 35-minute Stripe Checkout expiry, plus a two-minute reconciliation grace period.
- An uncertain network error does not release a possibly payable checkout. Expired holds with a known Stripe session are reconciled before reuse. Holds without a session ID are released only after their fixed Stripe deadline has passed.
- The existing webhook dispatches Christmas sessions separately from wedding invoices. Fulfilment verifies the exact reservation/session metadata, live mode, CAD currency and server-priced subtotal, and is idempotent.
- Confirmation emails to the purchaser and studio use Resend idempotency keys. Payment is recorded before email delivery; a mail retry cannot create a second booking.
- Studio details and the agreed policy are captured with the reservation, so later settings edits do not rewrite a purchased booking's terms.
- A confirmation URL is a private access link. Do not share it. It is excluded from advertising tracking and sent with a no-referrer policy.
- No appointment is automatically reopened after a refund. Handle a refund in Stripe, contact the family, and reconcile the cancellation before releasing replacement inventory. Purchased appointments are deliberately locked in this first version.

## Verification

`node --experimental-strip-types --test scripts/christmas-inventory.test.mjs`

The tests cover 20 concurrent attempts for one slot, Santa eligibility, unreleased and purchased slots, uncertain expired holds, overlapping allocations and invalid dates. Run the repository TypeScript check and production build as well. An actual browser check and end-to-end Stripe payment remain necessary before live sales.
