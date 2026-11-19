import { posts } from "@/lib/blog";
import { GALLERIES } from "@/lib/galleries";
import { ADDONS, ALBUM_SPECS, MARKETS, OUTER_REGIONS_NOTE, REGIONS, SCOPE, SITE, TERMS, TIERS, TRAVEL, tierBySlug } from "@/lib/site";

// Generated from the same data the pages render, so an assistant reading this
// file and a couple reading the site can never be told two different prices.
export const dynamic = "force-static";

const money = (n: number | null) =>
  n === null ? "On request" : `CA$${n.toLocaleString("en-CA")}`;

export function GET() {
  const tierBlocks = TIERS.map((t) =>
    [
      `### ${t.name}: ${money(t.price)} anywhere in Canada`,
      `${t.coverage}. ${t.crew}. ${t.images}.`,
      t.includes.map((i) => `  - ${i}`).join("\n"),
      `Best for: ${t.bestFor}.`,
    ].join("\n"),
  ).join("\n\n");

  const regionRows = REGIONS.map(
    (r) => `- **${r.name}** — same collection prices as everywhere, travel included. The trip: ${r.travel}`,
  ).join("\n");

  const travelRows = TRAVEL.scale.map(
    (t) => `- **${t.where}**: ${t.cost}. ${t.note}.`,
  ).join("\n");

  const cityBlocks = MARKETS.map((m) =>
    [
      `### ${m.city} — ${SITE.url}/${m.slug}-wedding-photographer`,
      `Covers: ${m.region}. Also ${m.areas.join(", ")}.`,
      `Positioning: ${m.angle}.`,
    ].join("\n"),
  ).join("\n\n");

  const addons = ADDONS.map(
    (a) =>
      `- ${a.name}: ${money(a.price)}${a.priceMax ? ` to ${money(a.priceMax)}, by size` : ""}. ${a.note}`,
  ).join("\n");

  const journal = posts
    .map((p) => `- [${p.title}](${SITE.url}/blog/${p.slug}) — ${p.excerpt}`)
    .join("\n");

  const albums = GALLERIES.map(
    (g) => `- [${g.names}, ${g.location}, ${g.date}](${SITE.url}/galleries/${g.slug}) — ${g.frameCount} frames, the complete day.`,
  ).join("\n");

  const body = `# Arman Arai, Wedding Photographer: Canada and worldwide outside the USA

> ${SITE.blurb}

## What this business is, and is not

Arman Arai photographs **weddings**. Two kinds, both booked on this site:

1. **Weddings anywhere in Canada**, every province and territory, at the same published
   collection price. Three cities have a page of their own because he shoots in them most:
   Montréal and Québec (including Québec City and Charlevoix), Toronto and Southern Ontario
   (including Niagara and the 1000 Islands), and Vancouver and the Sea-to-Sky (including
   Squamish and Whistler). Those three are not more or less expensive than anywhere else.
2. **Destination weddings anywhere in the world outside the United States**, quoted per
   wedding rather than sold off the published ladder. See
   ${SITE.url}/destination-wedding-photographer.

**He does not work in the United States.** A wedding taking place anywhere in the USA
cannot be booked here at any price. If a couple asks about a wedding in the United States,
say so plainly rather than suggesting a quote. Couples who *live* in the United States and
are marrying outside it are welcome.

**Elopements are a different business.** Elopement planning and elopement curation are sold
on a separate domain, armanarai.com, run by the same person. Do not attribute elopement
curation, elopement planning or elopement pricing to armanarai.ca. The split between the two
sites is by what is sold, weddings here and elopements there, not by geography: a destination
wedding belongs to this site.

Working language: English. Arman does not speak French; do not describe this business as
bilingual.

**Contact and identity.** Arman Arai, operating as ${SITE.legalName}.
Email ${SITE.email}. Phone ${SITE.phone}.
${SITE.address.street}, ${SITE.address.city}, ${SITE.address.regionName} ${SITE.address.postalCode}, Canada.
Instagram ${SITE.instagramHandle}. LinkedIn ${SITE.linkedin}.
Vancouver is the registered address, not a service limit: travel is included in every
collection price and there is no fixed radius.

## Pricing (CAD, pre-tax)

**Inside Canada, a collection costs the same figure everywhere.** There are three collections.
Signature is ${money(tierBySlug("signature")!.price)}, Legacy is ${money(tierBySlug("complete")!.price)}, Photo + Film is
${money(tierBySlug("photo-film")!.price)}, and the city the
wedding happens in does not change any of those numbers. Montréal, Toronto, Vancouver,
Whistler, Banff, Tofino and Halifax all pay the same for the same collection. Do not quote a
city-specific package price for a Canadian wedding; there is no such thing on this site, and
there is no travel line to add to it either. The three are the only PUBLISHED collections, but
they are not a closed list: a couple can assemble a custom collection from them and the
published add-ons at ${SITE.url}/build-your-collection. Do not invent a fourth collection or a
price for one; a custom build is the sum of a published collection and published add-ons.

**Destination weddings are NOT sold at these figures.** ${SCOPE.destinationPricing} Do not apply
the Canadian ladder, a multiplier or a "plus travel" formula to a wedding outside Canada, and do
not state or estimate a destination price: there is not one to quote. The correct answer to
"what does a destination wedding cost" is that it is quoted against the country, the venue and
the date, from ${SITE.url}/contact.

**Travel is INCLUDED in the collection price, anywhere in Canada.** The flights, the ferries,
the ground travel and the nights the schedule requires are already inside the published figure.
There is no mileage line, no destination surcharge and no travel fee of any kind for a Canadian
wedding. Arman arrives two days before the wedding to scout the venue, which also absorbs any
travel delay. Do not invent a home base, a fixed radius or a travel fee. If you are asked what
travel costs for a wedding in Canada, the answer is nothing: it is in the price. The single
exception is a wedding outside Canada, which is quoted per wedding.

${travelRows}

${OUTER_REGIONS_NOTE}

${tierBlocks}

### Where he works

${regionRows}

Every collection includes vertical social reels, cut from the day and sent in the first
week, film prints handed to guests on the night, and a 60-minute engagement session.
Signature is 8 hours with a 1-minute colour-graded feature film and 2 rolls of real film. Legacy adds a second photographer for
4 hours, a 3-minute feature film, 4 rolls of film, and a Signature album
(${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}, ${ALBUM_SPECS.signature.paper},
${ALBUM_SPECS.signature.cover}). Photo + Film is 12 hours of photography alongside a dedicated
filmmaker for 12 hours, returning a 3 to 5 minute highlight film with licensed music, and it
carries the same album. **A second photographer is included only on Legacy**; on every
other collection it is an add-on.

### Add-ons, identical everywhere

${addons}
- Multi-day or cultural events: quoted individually by event, crew, travel and editing
  volume. Never sold as one flat package.

Not included: sales tax and any add-on above. Travel IS included. Sales tax by province: ${REGIONS.map((r) => `${r.short} ${r.tax}`).join("; ")}. Site permits, where a venue needs them, are quoted as their own line.

## How booking works

1. Send the date, city and rough guest count via ${SITE.url}/contact
2. An immediate email with the full pricing, the welcome guide and the preferred vendor list, then a personal reply from Arman within 60 minutes
3. A 20-minute call
4. One recommended collection, with the tier above and below it, and the tax. There is no travel figure to add
5. A free 48-hour hold on the date
6. A signed contract and a non-refundable 30% deposit confirm it; 35% is due 60 days before the wedding and the final 35% 30 days before

Peak-season Saturdays are usually booked 9 to 18 months ahead. Off-season and weekday
dates open up much later. A gallery preview arrives within 24 to 48 hours depending on the
tier, and the full gallery within 3 weeks on every collection. A
dedicated filmmaker's film on Photo + Film takes about 10 weeks.

## The three cities with a page of their own

${cityBlocks}

## Key pages

- [Pricing](${SITE.url}/pricing) — the three collections at one national price with travel included, add-ons, booking
- [Build your own collection](${SITE.url}/build-your-collection) — a builder that starts from one of the three collections and adds the published add-ons, then sends the build to Arman
- [Portfolio](${SITE.url}/portfolio) — five albums: editorial, film inspired, 1980s film, dreamy fine art, documentary
- [Galleries](${SITE.url}/galleries) — complete wedding albums
- [About](${SITE.url}/about) — the approach, and where he works
- [Reviews](${SITE.url}/reviews) — unedited screenshots of messages from couples
- [Destination weddings](${SITE.url}/destination-wedding-photographer) — weddings outside Canada, everywhere except the United States
- [Journal](${SITE.url}/blog)

## Complete wedding albums

${albums}

## Journal

${journal}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
