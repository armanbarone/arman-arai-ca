# Christmas with Santa · North Vancouver 2026

One package: **$300 CAD with Santa**, plus **5% GST ($15)**, for **$315 total**. Arman is the Santa performer. Includes 20 minutes, 10 edited full-resolution digital photographs, two styled settings, a private download gallery and personal print rights. One household, up to five people. No prints or RAW files.

## Customer and admin routes

- `/christmas`: landing page, calendar, cart, contact form and embedded Stripe Checkout.
- `/christmas/preview`: clearly labelled sample booking flow. No real holds, payment or submitted contact information.
- `/christmas/confirmation`: private token-based payment verification and calendar download; excluded from advertising and search indexing.
- `/admin/christmas`: authenticated studio details, actual availability and booking management.

## Stripe catalog and invoices

Created and verified in the connected **Arasaka Inc. live account**:

- Product `prod_VRv3xk15KZIIXJ`: Christmas Family & Santa Session — North Vancouver.
- Default one-time CAD price `price_1UR1DrJ13FhTkCj17wPfWMTM`: integer amount `30000`, exclusive of tax.

The server validates this real price before checkout. Saving settings with bookings enabled verifies the catalog and creates or reuses an exclusive manual **5% GST** tax rate, with an idempotency key. Each checkout uses that rate and the reusable price. It does not depend on Stripe Tax automatic calculations: the connected account's Stripe Tax settings currently have no head office and no active registrations. No tax registration was created or modified.

One-time Checkout Sessions set `invoice_creation.enabled = true`. Each successfully paid purchase generates a paid Stripe invoice with the appointment, GST registration number `767392145RT0001`, and merchant name. No fictitious customer invoice or charge is issued during setup. The booking confirmation links to the hosted paid invoice when it is available. The existing webhook verifies the reservation, Stripe session, live mode, CAD currency, $300 subtotal and $315 total before marking a booking paid.

Tax basis for this digital-only in-person BC session: CRA's GST/HST rate guidance (5% GST in BC) and BC's PST-126 photography bulletin (photography services and access to/downloads of digital photographs are not subject to PST). Reassess tax treatment before adding prints, physical products or services performed outside BC.

## Calendar and inventory

The season runs **every day November 27–December 23, 2026, 11 am–8 pm Pacific**. A 20-minute session plus ten minutes of changeover makes 18 starts per day, from 11:00 through 19:30, and 486 potential appointments. All newly generated appointments include Santa. Unrelease real breaks or times you cannot offer in the admin page. Hidden/unreleased appointments are never labelled as purchases. Any remaining count is based on actual released inventory and real payment holds.

A single private Blob calendar ledger uses ETag compare-and-swap writes, so a refresh reads one inventory document rather than hundreds. First initialization preserves legacy reservations and release decisions. Legacy paid bookings are retained; overlapping generated appointments are not offered. Claims reserve one appointment atomically. Holds last the fixed 35-minute Stripe Checkout expiry plus a two-minute reconciliation grace period. An uncertain network failure never releases a possibly payable session early. Public availability contains no family information or booking tokens. Confirmation emails use idempotent delivery keys. Later studio/policy changes do not change the saved terms of an existing reservation.

## Launch configuration

1. Replace the three labelled AI concept photographs with completed-studio photographs when available, updating captions and alt text together.
2. Confirm the existing live Stripe connection and webhook at `/admin/payment-settings`. Reuse the existing secret-key environment configuration; never place secret keys in the browser or repository.
3. At `/admin/christmas`, supply the **North Vancouver street address and postal code**, arrival/access notes, cancellation/rescheduling policy and matching live publishable key. The business billing address is not assumed to be the studio address.
4. Review the daily schedule and unrelease actual unavailable appointments. Confirm the practical camera/performer setup with Arman as Santa.
5. Save with bookings enabled to verify the Stripe catalog and prepare GST. Complete browser, invoice, tax, payment and confirmation-email verification in the deployment before advertising. The code defaults to closed until all required production settings are present.

## Atmosphere and portable preview

Berkshire Swash and Nunito Sans typography, evergreen/cranberry/gold colours, keepsake photographs and a letter from Santa. CSS falling snow is present in the rendered markup; shooting stars and two tiny reindeer teams pull Santa's sleigh, sack and gift parcels across the viewport. Moving flames, warm glow, embers and fairy lights provide fireplace motion. Decorative layers ignore pointer events.

Effects run whenever the page is visible, with no sound or animation controls. Reindeer have staggered body gallops and articulated legs, curved rising/falling flight paths, elastic reins, bobbing sleigh/cargo and a fine 0.5–1.1px stardust trail. Snow is coarser. Fairy lights, stars and firelight use a brighter gold/cranberry/evergreen palette.

On phones the CSS keeps one team, two shooting stars, 24 snowflakes, six embers, eight ambient twinkles and 16 dust particles. It removes expensive per-particle glow and most full-screen filters. Controls have a minimum 44px height, the calendar/cart stack vertically, and the booking dialog uses dynamic viewport height. System reduced-motion preferences use gentler timing while retaining visible effects. Animations pause automatically in hidden tabs, and no animation clock or per-frame React rendering is used. The atmosphere is memoized so calendar interactions do not recreate its particle tree.

Recorded sleigh bells play on enabled buttons and button-style links, using a decoded local 15KB MP3 and native-audio fallback, and start only inside a user interaction. No setting or mute/pause buttons appear. See `christmas-audio.md` for the source, license and the unavailable exact YouTube reference. The owner-private preview is a standalone bundled React application with self-hosted assets.

## Validation

`node --experimental-strip-types --test scripts/christmas-inventory.test.mjs`

Seven tests cover concurrent reservation attempts, Santa eligibility, held/paid/unreleased inventory, uncertain expired holds, overlap and seasonal boundaries, cents-to-dollars/GST totals, and all 27 daily schedules. TypeScript and the production Next.js build must pass. The portable React preview has its own reproducible `npm ci && npm run build`. Browser playback and an actual paid checkout are separate checks and must not be inferred from successful compilation or static markup.
