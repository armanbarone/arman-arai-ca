# Christmas reservation payments

New bookings use `deposit-50-v1`. The package remains CAD $250 plus GST ($262.50). Exactly $50 is charged at booking, credited as part-payment including $2.38 GST. The remaining $212.50 is due on arrival, before the booked start time in America/Vancouver. Optional albums increase the remaining balance; they do not change the deposit.

| Albums | Full order including tax | Deposit including GST | Remaining including tax |
| --- | ---: | ---: | ---: |
| 0 | $262.50 | $50.00 | $212.50 |
| 1 | $337.54 | $50.00 | $287.54 |
| 2 | $399.14 | $50.00 | $349.14 |
| 3 | $449.54 | $50.00 | $399.54 |

The deposit price is $47.62 before 5% GST. The balance session line is $202.38 before 5% GST. Album lines retain 5% GST and 7% PST. Together, the two invoices equal the original order total and taxes; no surcharge or discount is used.

## After a deposit

1. A verified, correctly valued Stripe Checkout payment confirms the booking and makes the slot sold. Existing `paid` inventory status means a confirmed booking, including deposit bookings; `paymentPlan` distinguishes its financial status.
2. Checkout requests a Stripe deposit receipt by email and creates a paid deposit invoice. A separate balance invoice is created for the same customer with the original session start as its deadline, `send_invoice`, and `auto_advance: false`. No saved card is charged automatically. Stable keys and saved invoice/item metadata make retries idempotent.
3. The client welcome guide, family questionnaire, studio alert, and existing Google Calendar sync follow independently. The welcome and confirmation show the full total, deposit, remaining amount and exact deadline. A balance-invoice failure preserves the confirmed booking and does not suppress notifications; Stripe retries it, and the private booking page retries missing balance setup.
4. Clients can pay the hosted balance invoice early, or settle at the studio before the session. An authenticated studio operator may use **Record balance received** only after checking the explicit acknowledgment that the balance was actually collected. This marks the Stripe balance invoice paid out of band; it does not charge a card. This Stripe action is irreversible.
5. A verified balance `invoice.paid` updates the cumulative paid amount, sends a separate receipt with its hosted invoice link, and updates the existing calendar event. It does not repeat the welcome/questionnaire or emit another booking purchase.

## Tracking and compatibility

The confirmation page reports Meta Purchase with CAD 50 for new deposit bookings, using the same stable booking event ID. Later balance payments do not change that reported deposit value. Legacy bookings without `paymentPlan`, including the historical owner $10 test, retain their original reconciliation amounts and have no new balance invoice. New checkout requests must explicitly acknowledge this payment-plan version and the exact $50 amount; old/tampered requests cannot create a booking at another price.

The cancellation policy remains the existing full refund at least 48 hours ahead and one free reschedule. Do not describe the deposit as non-refundable.

## Verification

Offline boundary tests cover all album quantities, exact totals, payment tampering, duplicate events, partial invoice failures, receipts, legacy payments, and the guarded in-person payment action. Production build and browser preview checks cover the landing page, calendar selection, optional album, consent flow and confirmation. Live Stripe invoice previews verified $50 deposit and balance totals of $212.50, $287.54, $349.14, and $399.54. These previews do not represent a completed customer payment or inbox-delivery test.
