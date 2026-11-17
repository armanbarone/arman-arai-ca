# Wedding inquiry tracking

All successful forms posting to `/api/contact` return an opaque `inquiryId`.
The server reports `Lead` through Conversions API after successful email/webhook
delivery, and the thank-you page reports `Lead` with the same `ca-lead-<id>`.
For Montréal, the existing campaign uses custom conversion `1041783472239629`
(`Lead` plus URL contains `thank-you`). The successful handler therefore issues
a ten-minute encrypted HttpOnly receipt, scoped to the Montréal confirmation.
Serving that dynamic confirmation page sends the server event with its actual
thank-you URL. This does not load Meta's browser script and does not depend on
JavaScript session storage or a third-party browser request. No receipt means no event;
reloads reuse the original ID and time. Prefetch requests do not send events.
Meta deduplicates the two channels by event name and event ID. Invalid forms,
honeypots, failed delivery and direct thank-you visits do not produce leads.

Production setup:
- Pixel / dataset: Canadian Weddings, `1110472461323039`.
- Set `META_WEDDING_CONVERSIONS_ACCESS_TOKEN` as a production-only Vercel Secret for
  `canadian-weddings`. Never expose it through `NEXT_PUBLIC_*`, logs or Git.
- Redeploy after configuring the secret. Without it, browser tracking continues;
  preview and local development never send server conversions.
- Keep the existing Montréal ad set and its broad thank-you conversion. A
  standard `Lead` goal is also compatible with these deduplicated server events.
- Wedding code uses its own credential. Do not set or change the separate
  `META_CONVERSIONS_ACCESS_TOKEN` used by Christmas, and do not activate or
  replay Christmas jobs as part of wedding tracking setup.

The server hashes normalized email and phone details with SHA-256. Browser/ad
cookies, IP and user agent support attribution when available. No click ID is
invented, and no wedding date, names, venue or message is sent. One bounded retry
uses the original event ID and event time. Acceptance logs contain only the
opaque event ID, public source URL and delivery status, never user matching
details, credentials or Meta's response text.

For an owner-only production check, temporarily set `META_WEDDING_TEST_EMAIL_HASH`
to SHA-256 of the owner's normalized test email and `META_WEDDING_TEST_EVENT_CODE`
to the code shown in Meta Test Events. Only that recipient's server event is
sent to Test Events; other inquiries retain normal production measurement.
Remove both test settings after verification. Do not send an owner test through
the production browser pixel or replay a client's historical inquiry.

Reference: Meta's official Node Business SDK `serverside/server-event.js` and
`serverside/user-data.js`, and Conversions API deduplication documentation.
Graph version v26.0 matches the official SDK at implementation time.
