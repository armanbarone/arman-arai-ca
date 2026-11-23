# The two offers, as they stand

Concept cards have to show couples what the site shows them, so the prices here have to be right.
They have drifted before — the elopement repo carries a whole module written because four different
Europe ladders were live at once and "a couple could see three different numbers in one session."

**Verified 2026-11-23 against the repositories.** Before any test that turns on a specific figure,
re-read the source file named beside it rather than trusting this page or memory.

---

## Arman Arai — elopement curation (armanarai.com)

Repo `arman-arai-dark-20260506`. All-inclusive curation: Arman plans it, leads a symbolic ceremony,
and photographs it, with vendors and activities inside the rate.

### Canada — source: `lib/canada-hub-offer.ts`

One pair of GST-included CAD prices across both provinces:

| | price | coverage |
|---|---|---|
| Coast & Summit (lower) | **C$3,999** | 5-6 hours, choose your signature adventure |
| upper tier | **C$5,999** | |

Cities on this ladder: **Banff** (AB), **Vancouver**, **Whistler**, **Tofino** (BC).
Off-ladder hubs: **Jasper** C$4,500 / C$6,500, **Revelstoke** C$4,500 / C$6,200
(`app/service-place/*/HubClient.tsx`).

Carried by every Canadian package: planning, location curation and permit guidance; hair and makeup
for one person, no trial; a simple bouquet and boutonniere; a personal symbolic ceremony led by Arman;
a simple picnic setup and small cake; 200-250 edited photographs; 10 short social reels. A 2-3 minute
cinematic film is an add-on.

**The legal point, which couples ask about constantly and which belongs on any Canada concept card:**
Arman leads a *symbolic* ceremony and builds the vows into it. A legal signing is completed separately
— a registered BC marriage commissioner or licensed officiant with two witnesses in BC, an authorized
or eligible temporary commissioner in Alberta — and is booked separately from the package. The site is
explicit that it must never promise to solemnize. A persona who misunderstands this is a realistic
persona, and that confusion is itself worth testing.

### Mexico and Costa Rica — source: `lib/country-elopements.ts`

| | Essential | Signature | Honeymoon |
|---|---|---|---|
| **Mexico** (Playa del Carmen / Riviera Maya, fly into CUN) | $8,700 | $10,900 | $14,500 |
| **Costa Rica** (Guanacaste / Playa Flamingo, fly into LIR) | $8,400 | $10,900 | $13,900 |

Essential runs 8 scheduled coverage hours on one day, two private adventures, first look, symbolic
ceremony, personal flowers, hair/makeup for one, a private three-course beach dinner with wine and a
45-minute musician set, 300+ edited images, a 2-3 minute film with vows, 20 previews within 72 hours,
two vow books, 10 fine-art prints and a 60-second vertical edit. Signature and Honeymoon include one
yacht **or** helicopter charter and keep their own activity lists — they are not "Essential plus
everything".

Mexico's signature adventures are a cenote underwater shoot and a 90-minute beach horseback portrait
ride; Costa Rica's are private surf coaching at Playa Grande and a 90-minute coastal horseback outing.

### Europe — source: `lib/europe-pricing.ts` (the single source of truth; never hard-code)

Three tiers — Essential (one day), Signature (two days), Honeymoon (three days) — priced by zone, USD:

| zone | | Essential | Signature | Honeymoon |
|---|---|---|---|---|
| **A** | Southern Europe and the islands — Madeira, the Azores, Crete, Paros, Milos, Puglia, Mallorca, Costa Brava | $7,900 | $11,900 | $15,400 |
| **B** | The classic coast — Amalfi and Capri, Santorini, Lake Como, Tuscany, Rome, Venice, Paris | $8,900 | $13,900 | $17,900 |
| **C** | Alpine and Arctic — the Dolomites, Swiss Alps, Iceland, Lofoten, the Faroes, Scottish Highlands | $10,900 | $15,900 | $21,900 |

Every European ceremony is symbolic. **Flights and hotels are never included** — a persona who assumes
otherwise and feels misled is a realistic persona. Zone C carries mountain drivers, guides, cable cars
and, on longer tiers, a helicopter landing, plus a weather plan behind every day.

Margins run 41-47% after the vendor stack. Price tests that push below the Essential figures are
testing something the business cannot actually sell; say so rather than reporting a happy panel.

### The Elopement Designer — source: `components/elopementCatalog.ts`

A configurator: pick a destination with an all-inclusive "from" price (the zone list price where
there is one, otherwise **$14,000**), then add options like speccing a car. Good subject for tests
about whether build-your-own reads as flexible or as expensive.

---

## StillVows / Arman Arai — wedding photography (armanarai.ca)

Repo `arman-arai-ca`. Source: `lib/site.ts`. Documentary and editorial. **One national price** —
Signature is C$3,000 in Montréal, Toronto, Vancouver and Halifax alike, and travel inside Canada is
included rather than surcharged. That is a deliberate positioning choice and a good thing to test,
because couples routinely assume a travel fee is coming.

| | price | hours | crew | images | film | album |
|---|---|---|---|---|---|---|
| **Signature** (most booked) | **C$3,000** | 8 continuous | one lead | 600+ | 1-minute feature | add-on, C$1,200 |
| **Legacy** | **C$4,200** | 10 continuous | lead + second for 4 hrs | 800+ | 3-minute feature | Signature album included |
| **Photo + Film** | **C$5,900** | 12 | lead + dedicated filmmaker | | 3-5 min highlight, licensed music, vows | included |

Every collection: a 60-minute engagement session, real film (2 rolls on Signature, 4 above) processed
and scanned, vertical social reels in the first week, film prints handed to guests on the night, a
90-minute planning call and family-photo plan, next-day preview (40 images; 50 within 24 hours on
Legacy), full gallery in 3 weeks. Photo + Film's highlight film lands in 10 weeks.

Add-ons: Signature album C$1,200 · Heirloom 12x12 album C$1,800 · dedicated filmmaker for 8 hours
C$2,900 · full ceremony and speeches film C$650 · rehearsal dinner, welcome event, tea ceremony or
mehndi up to 3 hours C$1,000.

An Essential tier at C$2,000 / six hours was **removed**. Every "from" figure now reads C$3,000.
Resurrecting it in a concept card means testing a tier that was deliberately retired — fine as an
explicit experiment, not fine by accident.

Destination: anywhere in the world **outside the United States**, quoted against country, venue, date
and route as one number. There is no published destination figure and no fixed multiplier, and the
repo is emphatic that none should be invented. A concept card must not print one.

---

## Voice, for writing concept cards that read like the real thing

Both sites write in specific, unhedged sentences that name what a thing is and what it costs, and say
plainly what is *not* included. "Flights and hotels are never included." "I will not bundle one in at
a number that guarantees somebody does bad work." Concept cards written in generic wedding-vendor
copy will not test the real offer, because the real offer does not sound like that.

---

## Keeping this page true

When a price changes in a repo, change it here in the same session. A stale figure here means every
test downstream is measuring a product that does not exist — a quiet failure, because the panel will
answer perfectly sensibly about the wrong thing.
