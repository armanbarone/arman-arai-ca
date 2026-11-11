# Christmas family reservations

New sales reserve one of 50 family sessions with the existing CAD $50 tax-inclusive deposit. Sessions take place December 1–14, 2026; Arman contacts the family personally after payment to agree on their appointment. The public calendar is replaced by a remaining-session counter, optional albums and the deposit checkout button. The full base price stays $250 plus GST, with the balance due on arrival. If no suitable appointment can be agreed, the deposit is refundable under the new reservation policy.

## Inventory and payment

The existing private calendar document now also holds flexible reservations with an opaque `2026-reservation_<20 hex>` identifier and empty date/time until assignment. Dated legacy bookings and their payment terms remain unchanged. Genuine paid legacy bookings count toward the cap; the historical owner verification payment and test records do not.

Capacity is claimed with the same document's conditional ETag write, before creating Stripe Checkout. Pending payment holds protect the final unit from simultaneous buyers but do not reduce the displayed paid remaining count. An expired clock alone never releases a still-payable Stripe Session; reconciliation or an authenticated cancellation must establish expiry. The public endpoint returns only aggregate capacity and permitted recent activity, with no appointment list or customer details. The page refreshes the count every 15 seconds and when it regains focus.

Only validated, signed Stripe payment reconciliation marks a reservation paid and decreases the public remaining count. Confirmation-page refreshes, webhook retries, later appointment assignment and balance payment do not sell another unit or generate a new booking Purchase ID. The existing standard Purchase reports the actual $50 deposit; the prior browser/server tracking preferences and deduplication remain in force. Production server Meta delivery still depends on the previously documented access-token setup.

## After payment

- Stripe creates the deposit invoice/receipt and sends the payment receipt through the existing configuration.
- The welcome/guide email confirms a family reservation awaiting personal scheduling. It has no invented appointment or calendar attachment.
- The separate private questionnaire asks for family details and preferred days/times.
- The studio alert says CONTACT TO SCHEDULE and links to `/admin/christmas`.
- The authenticated confirmation page says the date will be arranged and hides Add to calendar until assignment.
- Google Calendar and the dated balance invoice wait until a date is agreed.

## Studio scheduling

In `/admin/christmas`, **Reservations to schedule** lists paid flexible reservations, contact details, payment totals, questionnaire/availability answers and delivery status. After personally agreeing on an appointment, the administrator records its date/time and explicitly confirms agreement.

The server checks administrator access, the December 1–14 window, future time, the studio's weekday/weekend hours, December 10–12 closures, manually sold-out windows and overlapping legacy/flexible bookings. Saving the agreed appointment preserves its original reservation ID, blocks the real time, sets the balance deadline, creates the balance invoice, sends an appointment email with an ICS attachment and syncs the existing main Google Calendar connection. Each effect can be retried without collecting another deposit or sending the initial welcome again. Revised agreed appointments use a new schedule-email version and update the unpaid invoice deadline while retaining the same Google event ID.

## Verification

Automated checks cover simultaneous purchase attempts for the last unit, existing-booking counts, held versus paid capacity, no automatic expiry release, scheduling boundaries/conflicts, private undated records, unchanged deposit/album tax totals, paid-only confirmation and Purchase, welcome/questionnaire/studio emails, absent early calendar attachments, deferred balance invoices, appointment-email deduplication and rescheduling. Existing wedding tracking and the legacy Christmas payment flows remain regression-tested.

The local design preview was checked on desktop and at 390px width. Its contact/details steps completed in preview mode without saving data or charging a card; its confirmation showed scheduling pending with no calendar button. Real inbox delivery, a real Google event and live paid conversion acceptance cannot be established by these offline/preview checks. No real charge is required for publishing this change.
