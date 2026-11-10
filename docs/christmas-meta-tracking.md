# Christmas Meta tracking audit and repair

## Architecture and observed failure

This repository uses Next.js 15.5.29, React 19, TypeScript and the App Router. `app/layout.tsx` mounts `components/PublicTracking.tsx`, whose pathname effect calls the shared `lib/analytics.ts`. There is one shared Meta installation, pixel **1110472461323039** (Canadian Weddings). Google uses its separate Google tag. There is no separate Christmas pixel, GTM-installed duplicate, or consent-manager library in the source.

On November 10, 2026, Chrome DevTools on the Christmas page showed:

```
https://connect.facebook.net/en_US/fbevents.js
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```

The site's standard `fbq` stub can be detected by Pixel Helper before Meta's library runs. Its conventional `loaded = true` flag does not prove the library downloaded or an event was transmitted. This observed failure is browser-level blocking, not a CSP rejection or a wrong pixel ID. The unblocked in-app browser loaded both fbevents.js and this pixel's signals/config script, and its observed resource inventory included `https://www.facebook.com/tr/?id=1110472461323039&ev=PageView&dl=.../christmas`. That proves a PageView request was made in that browser; it does not prove Events Manager ingestion.

The code audit also found no InitiateCheckout implementation. Failed script loading was cached permanently for the lifetime of the page, and a PageView was marked reported before the runtime was ready. Purchase already existed as both standard `Purchase` and the legacy `ChristmasSessionPurchase` custom campaign event, gated by the authenticated Stripe-verified status response.

## Corrected runtime flow

1. A production public page starts the existing asynchronous tag loader. PageView waits for the actual Meta `callMethod` runtime before dispatch. Per-page in-flight and dispatched guards prevent Strict Mode/rerender duplicates. Client-side public navigation is measured, and private navigation suspends advertising. Failed/blocked loading is not marked successful and can recover on a later event after a cooldown. An existing working SDK is reused.
2. Calendar browsing, date selection and time selection emit no InitiateCheckout. The form prevents overlapping submissions. After Stripe creates a valid hosted CAD Checkout Session at the expected amount/mode, the server returns a hashed event ID and the actual amount due now. The browser reports standard `InitiateCheckout` immediately before navigation, with a bounded wait so blocked advertising cannot prevent payment. A server-side counterpart runs after the API response when configured, using the same event name and ID.
3. A signed Stripe webhook, or authenticated status reconciliation, validates the session amount, currency, mode and reservation. Only paid bookings can produce a Purchase. The private confirmation URL is stripped of access parameters before browser tracking can start. A direct, unpaid or sample confirmation visit is not a purchase.
4. New deposit bookings report **CAD 50**, the deposit actually paid, rather than the full $262.50 order value. Album selection changes the remaining balance, not the deposit. Legacy paid bookings retain their recorded actual payment value. A later balance payment does not emit another booking Purchase or change its original event ID/value.
5. Browser Purchase retains independent persisted receipts for standard Purchase and the existing custom event. The webhook's server Purchase uses exactly the same opaque `event_id` as the browser's `eventID`, allowing Meta to deduplicate the two channels.

## Server delivery and privacy

`lib/christmas/meta.ts` queues new checkout/purchase events in private storage with stable IDs, leases concurrent workers, and saves successful acceptance only when Meta returns `events_received: 1`. The existing 15-minute scheduled job retries failed/unconfigured deliveries. Events expire after 47 hours to avoid long-delayed replay; sent records do not retain browser matching data, and records older than 30 days are purged. Historical bookings without the new attribution context, the owner's historical $10 check, test payments and preview environments are not backfilled.

Only existing validated browser/ad identifiers, original browser IP/user-agent, event name, value, currency and campaign details are used. Matching context is removed from a reservation after both events are durably queued, or after 48 hours. No customer names, emails, phone numbers, appointment date/time, mailing addresses, questionnaire answers or private confirmation tokens are included. Explicit DNT/GPC opt-outs suppress browser tracking and server attribution. Marketing-email consent is separate and unchanged.

Server advertising failures never undo a booking, suppress its welcome/questionnaire/studio alerts, or stop Google Calendar synchronization. Server calls use the existing pixel ID and server-only `META_CONVERSIONS_ACCESS_TOKEN`; no secret belongs in a NEXT_PUBLIC variable or client bundle.

## Configuration blocker observed

Production environment metadata showed no `META_CONVERSIONS_ACCESS_TOKEN`. The owner authorized generating one and securely saving it. Meta's current account disabled the generator with this message:

> You must be an admin or developer for this business portfolio to create an access token.

No token was generated, and no account permissions were changed. Server delivery is implemented but cannot become active until an authorized business-portfolio administrator/developer supplies that token to the production project and it is redeployed. Browser blocking also remains a browser setting; the site does not bypass it or proxy Meta's script.

## Verification and repeatable checks

- All 100 automated checks passed: 86 Christmas/payment/inquiry/server checks and 14 shared wedding-tracking checks. These cover asynchronous SDK loading, blocked scripts, explicit browser opt-outs, page-view replay, valid checkout handoff/value, duplicate clicks/events, abandoned checkout, paid-only reconciliation, refreshed confirmations, legacy payments, server leases/retries, matching IDs, privacy and the existing booking/email/calendar flows.
- `npm run build` validates the production compilation and route types.
- No real payment was created or charged for this audit. Stripe's paid/unpaid/error paths are boundary-tested with explicit in-memory doubles, and no synthetic Purchase is sent to the live advertising dataset.

### Meta Events Manager

1. Open **Canadian Weddings**, pixel **1110472461323039**, then **Test events**.
2. Expand **Confirm your website's events are set up correctly** and open `https://www.armanarai.ca/christmas` from there. Use a browser that allows Meta's requests for this test. Confirm PageView; calendar/date/time selection should not add InitiateCheckout.
3. Proceed through details to a successfully created Stripe checkout. Expect one InitiateCheckout with value **50**, currency **CAD**. Cancel/abandon without paying: no Purchase should appear.
4. For payment verification use a properly isolated Stripe sandbox/local test setup; do not enter a test card in live Checkout. The production test-payment gate does not allow sandbox charges or test purchases into the live advertising dataset.
5. After a genuine successful live payment, expect one standard Purchase for the amount actually paid. Refreshing the confirmation must not add another Purchase. The existing ChristmasSessionPurchase custom event is a separate compatibility event, not a second standard Purchase.
6. Once a business administrator enables server reporting, use the server test code shown under **Confirm your server's events are set up correctly** for isolated API testing. Normal production deliveries deliberately do not attach a test-event code. Verify the matching browser/server event IDs and Meta's deduplication diagnostics.

Network requests, automated test results and dashboard receipt are distinct evidence. Do not state that Meta accepted an event unless its API acknowledgment or Events Manager has actually confirmed it.
