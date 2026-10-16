# Christmas with Santa · North Vancouver 2026

One **$300 CAD** package: a 20-minute family session with Santa, photographs across **three styled sets**, 10 edited full-resolution digital photographs, a private gallery and personal print rights. A **Santa letter mailed to the kids with a special printed photograph from the session**, **cookies and warm milk** are included. One household, up to five people. Arman is Santa.

A prominent, responsive Grinch banner sits directly below the package section. Its Add The Grinch button selects the optional visit and scrolls to booking. Parents may add **The Grinch for $50**, within the same appointment and included image allowance. The base remains one package; The Grinch is a separate optional cart item, off by default.

## Dates and availability

**November 1–December 20, 2026**, every day **11am–8pm Pacific**. Eighteen half-hour allocations per day, with the final start at 7:30pm, produce 900 potential appointments over 50 days. Each contains a 20-minute shoot and ten-minute changeover.

The private Blob calendar uses ETag compare-and-swap writes. A versioned migration adds the early-November slots, preserves actual release decisions and every existing reservation, and hides out-of-season inventory. Existing purchases after the new final date are retained for owner review, never deleted or automatically cancelled. Public availability contains no customer details. Holds retain the existing fixed 35-minute Stripe expiry and reconciliation grace period.

## Mailed letter and print

The booking form collects names for Santa's letter and the parent's BC mailing street address, unit, city and postal code. BC postage is included. Parents with another destination must contact Arman before booking. These private details are stored with the reservation, passed to payment shipping details, displayed in the authenticated admin booking table, and included in the private confirmation and transactional booking emails. No letter or print is mailed by the software itself; the studio fulfils them after the session. Postal arrival dates vary; pre-Christmas arrival is not promised. Digital galleries retain the existing five-day turnaround, or 48 hours for sessions December 18–20.

## Tax and Stripe

The merchant explicitly requested **GST-only collection** for this integration. The cart, server-priced totals, Checkout line items and paid invoice configuration now collect **5% GST**, with no PST charge or PST registration activation gate.

- Base: $300 + $15 GST = **$315 CAD**.
- With The Grinch: $350 + $17.50 GST = **$367.50 CAD**.

This is a collection configuration, not a finding that the printed-photo package is PST-exempt. BC Bulletin PST 126, page 3, says that a photography charge including required tangible photographs is subject to PST on the whole charge. That tax-treatment question remains unresolved and should be reviewed by the merchant before launch. No tax registration, previously issued invoice or existing tax-rate object is changed by this update. Official source: https://www2.gov.bc.ca/assets/gov/taxes/sales-taxes/publications/pst-126-photographers-videographers-photofinishers.pdf .

Live Arasaka Inc. catalog:

- Main product `prod_VRv3xk15KZIIXJ`, price `price_1UR1DrJ13FhTkCj17wPfWMTM`, CAD `30000` cents; description updated for the new inclusions and dates.
- Grinch product `prod_VRwSIetrz9JUWh`, price `price_1UR2ZNJ13FhTkCj1RhR5D8wU`, CAD `5000` cents, exclusive of tax.

The server verifies both prices and computes the selected subtotal/total. The client must accept the exact current subtotal, total and policy before any hold is created. Both line items use only the reusable manual 5% GST rate, created or reused on activation. Automatic Stripe Tax is not enabled. A paid invoice is generated per successful purchase and includes the GST registration number, appointment and inclusions. No customer invoice or charge was issued during setup.

The reservation stores its exact expected total and package snapshot. Reconciliation verifies CAD, live mode, reservation/session metadata, subtotal and total. Legacy GST-only reservations retain their original expected amount rather than being rewritten with current taxes or features. Fulfilment is driven by the signed webhook, with idempotent customer/studio emails; a mail failure never creates another booking.

## Launch and routes

`/christmas` is the customer page; `/christmas/preview` is a clearly labelled demo with no contact submission, inventory hold or payment. `/christmas/confirmation` uses a private bearer token. `/admin/christmas` uses existing admin authentication.

Bookings remain closed until the actual studio street address/postal code, arrival details, cancellation policy, matching live Stripe publishable key, live webhook connection are configured. `/admin/payment-settings` uses the existing merchant integration. Verify the paid checkout, tax, invoice and email flow before advertising. Replace labelled AI concept photographs with completed-studio photographs when available.

## Animation and mobile

There is **one reindeer pulling one sleigh**, represented by one flight element. After each crossing completes, a new random delay is scheduled. Side, height, duration and swooping path vary. It cannot schedule overlapping flights. Hidden-tab cancellation clears active animation and timers. Galloping legs, bobbing cargo, tugging reins and fine stardust remain. Decorative effects have no buttons or toggles; enabled page buttons play the recorded local bell MP3 described in `christmas-audio.md`.

Phone rules reduce particles, filters and glow while retaining every effect type. Controls use a minimum 44px height and the booking dialog fits the dynamic viewport. Reduced-motion preferences use gentler timing. The separately hosted owner-private preview is a bundled React client app using matching shared sources and assets.

## Validation

`node --experimental-strip-types --test scripts/christmas-inventory.test.mjs`

Nine tests cover concurrent claims, held/paid/unreleased inventory, seasonal date validation and overlaps, cents formatting, base/add-on GST-only totals, all 50 daily schedules, and safe inventory migration. Run TypeScript and the production build. Render checks cover one flight/deer, new inclusions, cart option and date labels. Browser animation, physical-phone audio/performance and a paid transaction remain separate verification steps.
