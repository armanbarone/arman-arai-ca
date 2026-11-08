# Christmas booking verification · November 7, 2026

Production remains unchanged. This verification uses the existing configured Stripe sandbox, a test card, loopback-only app URLs and a unique `dev/christmas-e2e/` private-storage prefix. Actual transactional emails were sent only to the owner's i@armanarai.com inbox, labelled TEST / NO REAL APPOINTMENT. The owner did not authorize a production deployment.

## Verified with the real services

- Completed the actual browser flow: selected a 9:30 am half-hour appointment, added all three albums, submitted contact/mailing details, opened Stripe-hosted Checkout, paid with Stripe's test card and returned to the private confirmation page.
- Stripe reported the test Checkout Session complete/paid and PaymentIntent succeeded. The base line was $250 + $12.50 GST. Album increments were $67 + $8.04 tax, $55 + $6.60 tax and $45 + $5.40 tax. Total $449.54 CAD ($417 subtotal, $20.85 GST and $11.69 PST). Base GST-only and album GST+PST were verified against actual Stripe line items.
- Stripe CLI forwarded real `checkout.session.completed` and `invoice.paid` events into the app's signature-verifying webhook. Both returned HTTP 200. Replaying the same real completed event twice returned 200 without duplicate emails. An invalid signature returned 400.
- The private reservation became paid with the correct 30 minutes, 20 digital photos, three albums and paid amount. Public availability changed the 9:30 appointment to sold, while 10:00 remained available.
- The browser returned to `/christmas/confirmation`, removed access tokens from the visible URL, showed the paid amount/reference, separate preparation points, private questionnaire and paid-invoice link.
- The welcome email with ICS attachment and the owner's booking alert both arrived in Gmail INBOX. The separate questionnaire email arrived three seconds later. The recipient was i@armanarai.com for all three test messages. Persisted per-message flags and Gmail confirmed delivery. No extra copies appeared after webhook replays.
- Submitted synthetic family questionnaire answers through the real private form. The form showed success and the answers were stored privately. The authenticated admin page returned 200 and showed the paid booking, albums, email statuses and submitted answers. An unauthenticated admin request redirected to sign-in; an invalid booking token returned 404.
- Stripe generated a receipt URL and a paid invoice for the correct total, with the intended receipt email. Test payments do not trigger automatic Stripe receipt emails, so actual receipt email delivery remains a live-mode check. See [Stripe receipts](https://docs.stripe.com/receipts).
- The test payment did not supply a Meta purchase payload and could not write a real Google event.

## Still not verified / not activated

- Google Calendar: the website's separate Google OAuth connector and owner authorization are not configured. The connected Codex calendar plugin is not a runtime website authorization. No automatic Google event is created today. After the owner approves the preview and the website connection is authorized, use the admin sync action to backfill/retry.
- Production Stripe settlement, automatic Stripe receipt inbox delivery, production webhook delivery and the live Meta campaign event were not exercised. No real card was charged and no production booking was made.
- Abandoned-cart reminder delivery remains opt-in and production-gated; this paid-booking check did not send recovery messages. The scheduler still needs the approved production enable flag and secure cron secret.

## Design correction

Removed the character stories, clickable character choices and story heading. The illustrations now decorate a compact sales strip with package facts, price and a direct booking CTA.
