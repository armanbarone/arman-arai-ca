# Christmas booking calendar connection

The reviewed destination is the owner's main Google Calendar, **i@armanarai.com**. Production is unchanged until the owner approves this preview.

## One-time authorization before activation

The Codex Google Calendar connection does not authorize the website's server. The website uses Vercel Connect to obtain short-lived Google tokens; no Google access token or refresh token is stored in this repository or in client-side code.

1. Create a Google Calendar OAuth connection in the existing Vercel team using the [Google connector setup](https://vercel.com/connect/google). Google requires an OAuth client with the Calendar API enabled. Enter client credentials directly into Vercel's secure setup, never in chat or a source file. Use the exact OAuth redirect address shown by that setup in the Google OAuth configuration.
2. Limit Google access to `https://www.googleapis.com/auth/calendar.events.owned`. Use a durable Google OAuth configuration for the business; a temporary test authorization is not a production connection.
3. Attach the returned connector to the `canadian-weddings` project for production. Set `CHRISTMAS_GOOGLE_CONNECTOR_UID` to the exact returned connector UID or `scl_...` ID. Connector creation, project attachment, and the owner's Google consent are separate steps.
4. Once the owner approves launch, deploy the reviewed branch. Sign in to `/admin/christmas` and select **Connect Google Calendar**. Authorize the Google account that owns i@armanarai.com's calendar.
5. Select **Sync paid bookings / retry** to backfill existing paid bookings. New Stripe-confirmed purchases invoke the same sync automatically. Verify one approved paid booking appears on the correct calendar, including its 30-minute allocation (or its original duration for legacy bookings), before calling live delivery verified.

## Behaviour and limits

- Preview deployments never create Google events, regardless of credentials. Offline integration tests use explicit doubles. The operations preview uses a synthetic booking and sends no email.
- Owner email alerts go to i@armanarai.com independently of the customer's welcome/questionnaire delivery. Per-message timestamps and Resend idempotency keys prevent routine retry duplicates.
- Calendar sync is one-way, from paid website bookings to Google Calendar. It does not expose or import unrelated personal events into the public booking calendar.
- A new appointment blocks 30 minutes. Legacy 45-minute bookings keep their original full-hour allocation. Google events are private and busy, in America/Vancouver time.
- Events contain booking contact/package details and an admin link. They contain no questionnaire answers, children's ages, health/access notes, private confirmation tokens, or client invitation list. `sendUpdates=none` avoids additional Google invitations to clients.
- Each booking has a stable event ID. A 409 response verifies the booking identity before updating that event. A stored fingerprint skips unchanged events on retry.
- A Google failure does not undo payment, reopen the time slot, or suppress emails. The failure is shown in the admin calendar, and Stripe retries its webhook. The admin can also retry manually after reconnecting.
- Google API authorization and actual email inbox delivery remain unverified until their live checks are performed after approval.

References: [Google event creation](https://developers.google.com/workspace/calendar/api/guides/create-events), [Google Calendar scopes](https://developers.google.com/workspace/calendar/api/auth), [Vercel Connect guide](https://vercel.com/kb/guide/vercel-connect).
