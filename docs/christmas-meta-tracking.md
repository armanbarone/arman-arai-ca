# Christmas purchase tracking

The production confirmation route is `/christmas/confirmation`. It uses the existing site pixel `1110472461323039` and reports a standard Meta **Purchase** only after the private status endpoint verifies a real, paid Christmas booking. A page visit alone is not a purchase.

- `fbq("track", "Purchase", ...)` reports the verified amount actually paid in CAD, including selected albums and applicable tax. The base total is $262.50; one, two and three albums produce totals of $337.54, $399.14 and $449.54.
- `content_name` is `Christmas with Santa 2026`; `content_category` is `christmas_sessions`. No customer names, email addresses, questionnaire answers or private access tokens are sent.
- The existing `ChristmasSessionPurchase` custom event remains for compatibility with the Christmas campaign. It is a separate event name, not a second standard Purchase.
- Standard Purchase and the existing custom event each have independent persisted receipts and share the booking-specific opaque event ID. Concurrent calls and refreshes do not repeat either event. Existing custom-event receipts are preserved when standard Purchase is introduced.
- Private access parameters are removed before the Meta script starts. Preview pages, sandbox payments, unpaid bookings and unverified visits do not supply a purchase event.
- Wedding inquiry tracking continues to report `Lead`. Its confirmation pages and conversion logic are unchanged.

For a Meta Sales campaign, the standard website conversion event is **Purchase**. The existing custom event can still identify this Christmas campaign separately. Do not add an unconditional Purchase snippet to the page layout or hard-code $250 for orders that contain tax or albums.

Verification: the tracking tests cover payment verification, values for all album quantities, privacy, blocked tags, concurrent calls, reloads, existing custom-event receipts and preview isolation. Wedding inquiry and payment-reconciliation tests also pass. These are controlled checks; actual receipt of a new production purchase in Meta Events Manager still requires a genuine paid booking.
