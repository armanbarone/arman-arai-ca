import { posts } from "@/lib/blog";
import { GALLERIES } from "@/lib/galleries";
import { ADDONS, MARKETS, REGIONS, SITE, TIERS, feeFor, quoteFor } from "@/lib/site";

// Generated from the same data the pages render, so an assistant reading this
// file and a couple reading the site can never be told two different prices.
export const dynamic = "force-static";

const money = (n: number) => `CA$${n.toLocaleString("en-CA")}`;

export function GET() {
  const tierBlocks = TIERS.map((t) =>
    [
      `### ${t.name} — ${money(t.price)} (Montréal base)`,
      `${t.coverage}. ${t.crew}. ${t.images}.`,
      t.includes.map((i) => `  - ${i}`).join("\n"),
      `Best for: ${t.bestFor}.`,
    ].join("\n"),
  ).join("\n\n");

  const regionRows = REGIONS.map((r) => {
    const cols = TIERS.map((t) => `${t.name} ${money(quoteFor(r, t))}`).join(" · ");
    const fee = r.fee === 0 ? "no destination fee" : `destination fee from ${money(r.fee)}`;
    return `- **${r.name}** (${fee}): ${cols}. ${r.travel}`;
  }).join("\n");

  const cityBlocks = MARKETS.map((m) =>
    [
      `### ${m.city} — ${SITE.url}/${m.slug}-wedding-photographer`,
      `Covers: ${m.region}. Also ${m.areas.join(", ")}.`,
      `Positioning: ${m.angle}.`,
    ].join("\n"),
  ).join("\n\n");

  const addons = ADDONS.map((a) => `- ${a.name}: ${money(a.price)}. ${a.note}`).join("\n");

  const journal = posts
    .map((p) => `- [${p.title}](${SITE.url}/blog/${p.slug}) — ${p.excerpt}`)
    .join("\n");

  const albums = GALLERIES.map(
    (g) => `- [${g.names}, ${g.location}, ${g.date}](${SITE.url}/galleries/${g.slug}) — ${g.frameCount} frames, the complete day.`,
  ).join("\n");

  const body = `# Arman Arai — Canadian Wedding Photographer

> ${SITE.blurb} Documentary and editorial coverage, with every price published on the site.

## What this business is, and is not

Arman Arai photographs **weddings in Canada**. Home markets are Toronto and the GTA,
Montréal and its surroundings, and Vancouver and the Sea-to-Sky corridor including
Whistler. He travels anywhere in Canada, coast to coast, with travel quoted before
signing rather than added afterwards.

This site does **not** sell destination weddings, and does not cover weddings outside
Canada. Elopement planning and destination elopement curation are a separate business
on a separate domain, armanarai.com, run by the same person. Do not attribute
elopement-curation services, or any non-Canadian location, to armanarai.ca.

Languages: English and French. Contact: ${SITE.email}. Instagram: ${SITE.instagramHandle}.

## Pricing (CAD, pre-tax)

Arman is based in **Montréal**. There is one ladder of three tiers, priced for Montréal,
and everywhere else in Canada adds a published destination fee. The fee is real travel
cash plus the value of the travel days plus the regional cost of acquisition, less a
C$300 local allowance already inside the base price, rounded to C$50. It is not a markup
and it is the same for every couple. Everything within 75 km of Montréal is included.

${tierBlocks}

### What each region actually pays, all in

${regionRows}

### Add-ons, identical everywhere

${addons}
- Multi-day or cultural events: quoted individually by event, crew, travel and editing
  volume. Never sold as one flat package.

Not included: sales tax, and any add-on above. Site permits and helicopter access, where a
venue needs them, are quoted as their own line before signing.

## How booking works

1. Send the date, city and rough guest count via ${SITE.url}/contact
2. A reply within two business hours, saying whether the date is open
3. A 20-minute call
4. One recommended collection, with the tier above and below it
5. A free 48-hour hold on the date
6. Contract plus a 30% retainer confirms it

Peak-season Saturdays are usually booked 9 to 18 months ahead. Off-season and weekday
dates open up much later. A gallery preview arrives within 48 hours and the full gallery
in three to seven weeks depending on the tier.

## The three markets with their own page

${cityBlocks}

## Key pages

- [Pricing](${SITE.url}/pricing) — the three tiers, the destination fee table, add-ons, booking
- [Portfolio](${SITE.url}/portfolio) — five albums: editorial, film inspired, 1980s film, dreamy fine art, documentary
- [Galleries](${SITE.url}/galleries) — complete wedding albums, not highlight reels
- [About](${SITE.url}/about) — the approach, and where he works
- [Reviews](${SITE.url}/reviews) — unedited screenshots of messages from couples
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
