# Christmas checkout and reminders

Preview only until owner approval. Do not enable or send real reminders while reviewing.

- Opening the details dialog creates an anonymous, private cart with a fixed server-issued ten-minute expiration. The timer is a checkout window, not an inventory reservation. The appointment is checked again before creating Stripe Checkout; Stripe then holds it for 35 minutes.
- The client explicitly submits their name/email before mailing/phone details. No email keystrokes are captured. Reminder consent is separate, optional and unchecked. Store consent text, timestamp, checkout source and cart ID as evidence.
- Only consenting clients receive at most two reminders, due one hour and 24 hours after contact submission, with at least 20 hours between messages. Cron checks every 15 minutes, so delivery may follow the due time by that interval.
- Stop on paid bookings (any cart with the same normalized email), newer carts, unsubscribe, the appointment time, or December 20 at 3 pm Pacific. Active, unsettled or ambiguous Stripe sessions suppress reminders. Query Stripe before sending even if a payment webhook was missed.
- Email-specific suppression applies to all earlier consents/carts. A later explicit opt-in may opt in again. An unsubscribe link opens a confirmation screen; a POST changes the preference so link scanners cannot unsubscribe users.
- Lock each send with an optimistic write and use a stable Resend idempotency key. A failed provider request retries within 23 hours; do not retry an ambiguous send past the provider’s idempotency window. Individual failures return 503 to the secured scheduler endpoint.
- Reminders lead to current availability, not an expired Stripe URL. Recipient/contact tokens never go to analytics. Reminder/cancel links use a separate HMAC purpose and cannot access paid bookings.
- Private abandoned-cart records are removed after 30 days. Suppression hashes remain to honour opt-outs. Successful booking records remain in the existing calendar. The preview saves nothing and sends nothing.

## Before an approved launch

1. Verify `CRON_SECRET` exists as a strong secret in Vercel Production (never commit/paste it). Cron sends this as an Authorization bearer token. Requests without it fail closed.
2. Set `CHRISTMAS_CART_REMINDERS_ENABLED=true` in Production only after review approval. Existing `PORTAL_SECRET` signs cart links and `RESEND_API_KEY` sends reminders.
3. Confirm the Vercel plan supports a 15-minute schedule; `vercel.json` configures it. Preview deployments never run the mail job.
4. Real Stripe sandbox payment and the controlled studio inbox were verified on November 7; see `christmas-payment-verification.md`. The local test mode requires an explicit opt-in, loopback URL, test Stripe key and unique private-storage prefix. It cannot run in Production or on a public preview. Automated regression tests replace external service boundaries and perform no charges.
5. Review `/christmas/operations/preview` for the exact two message layouts and `/christmas/preview` for the client timer/contact flow.

Canada Post AddressComplete was explicitly cancelled by the owner. Keep ordinary manual address fields; no provider scripts, lookup requests or keys are present.

Sources: [CRTC abandoned-cart consent guidance](https://crtc.gc.ca/eng/com500/faq500.htm), [Vercel cron security](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Stripe Checkout expiration](https://docs.stripe.com/api/checkout/sessions/create?query=expires_at).
