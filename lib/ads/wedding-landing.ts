/* The Google Ads landing page, and the per-city variants of it.
 *
 * WHY THIS EXISTS, SEPARATELY FROM THE HUBS
 * ------------------------------------------
 * /montreal-wedding-photographer is the page that earns a click from organic
 * search: it is long, it links outward, and it is indexed. This one is the page
 * that is *paid* for. Someone typing "wedding photographer Montreal" into
 * Google has already decided to hire a photographer and is choosing who to
 * contact, so the page answers exactly three questions, in this order:
 *
 *   1. Is he free on our date?      → the form is the first thing after the h1
 *   2. Is the work any good?        → nine hundred frames of real weddings
 *   3. What does it cost?           → the three whole numbers, on the page
 *
 * Everything else on the site (nav, journal, twelve ways to wander off) is
 * deliberately absent. These pages are noindex/follow so they never compete
 * with the hubs for the same query; the ad is the only door.
 *
 * NOTHING HERE IS INVENTED. Every city fact below is read out of lib/site.ts,
 * which is the source of truth for prices, regions, venues and seasons. If a
 * figure needs to change, change it there.
 */

import { MARKETS, REGIONS, type Market, type Region } from "@/lib/site";

export type LandingVariant = {
  /** undefined on the national page. */
  slug?: string;
  /** What the ad headline and the h1 both say, matching the search term. */
  h1: string;
  /** Above the h1, in small caps. */
  eyebrow: string;
  /**
   * One short line under the h1, and deliberately the SAME line in every
   * variant. The hero's job is to get the form above the fold on a 390x844
   * phone; a city lede that runs to four lines in Vancouver and two in Toronto
   * moves the fold around per campaign. The city's own lede is used further
   * down, in the section about me, where there is room for it.
   */
  intro: string;
  /** The market's own opening, from MARKETS in lib/site.ts. */
  lede: string;
  /** The placeholder in the "where" field of the date check. */
  wherePlaceholder: string;
  /** Named rooms, straight from REGIONS. Empty on the national page. */
  venues: string[];
  /** When the season runs here. Empty on the national page. */
  season: string;
  /** Sales tax, stated per province. Empty on the national page. */
  tax: string;
  /** Extra questions this city actually gets asked. */
  faqs: { q: string; a: string }[];
  /** For the <title>, the description and the Calendly utm_content. */
  metaTitle: string;
  metaDescription: string;
  /** The path this variant lives at. */
  path: string;
};

const BASE_PATH = "/wedding-photography";

/** The questions every variant answers, in the order they get asked on a call.
 *  Facts come from TIERS and TRAVEL in lib/site.ts; none of this is new policy. */
export const COMMON_FAQS: { q: string; a: string }[] = [
  {
    q: "How do we find out if you have our date?",
    a: "Send the date with the form at the top of this page and you will have an answer the same day, or pick a time on the calendar below and I will check it live while we talk. Either way it costs nothing and commits you to nothing.",
  },
  {
    q: "What does it actually cost?",
    a: "Essential is C$2,000 for six hours, Signature is C$3,000 for eight with an engagement session, Complete is C$4,200 for ten with a second photographer for four of them, and Photo + Film is C$5,900 for eight hours with a dedicated filmmaker. Those are the whole prices of the collections, before tax, and they are the same figure in every Canadian city. Travel, where the date requires it, is quoted separately and agreed before you book.",
  },
  {
    q: "We are awkward in front of a camera.",
    a: "Almost everyone is, and it is the single most common thing couples tell me on the first call. You get real direction for the twenty minutes of portraits, down to where to put your hands, and for the rest of the day you are left alone to be at your own wedding while I photograph what happens.",
  },
  {
    q: "When do the photographs come back?",
    a: "A preview within 24 to 48 hours depending on the collection, the full gallery in two to three weeks, and vertical social reels in the first week so you have something to post long before the album arrives. Film prints are handed to your guests on the night.",
  },
  {
    q: "What holds the date?",
    a: "A signed contract and a 30% retainer. The balance is due 30 days before the wedding. Booking a call holds nothing and obliges nothing, so book it early rather than once you have decided.",
  },
];

const regionBySlug = (slug: string): Region | undefined =>
  REGIONS.find((r) => r.slug === slug);

/** The national page. No city in the headline, because no city was searched. */
export const NATIONAL: LandingVariant = {
  h1: "Wedding Photography Across Canada",
  eyebrow: "2027 and 2028 dates · Coast to coast",
  intro: "The day as it happened, photographed by me, with real direction for the portraits.",
  lede:
    "A collection costs the same figure in every Canadian city. What changes between them is the travel, and travel is quoted per trip rather than padded into the price.",
  wherePlaceholder: "Your city, or the venue if you have one",
  venues: [],
  season: "",
  tax: "",
  faqs: [
    {
      q: "Do you photograph weddings outside the big three cities?",
      a: "Yes. The collection costs the same figure everywhere in Canada, so a wedding in Charlevoix, Prince Edward County or the Sea-to-Sky is priced like a wedding downtown. Travel is booked on the leanest practical route and is reduced or waived when I am already scheduled in your region.",
    },
  ],
  metaTitle: "Wedding Photographer in Canada | Check Your Date — Arman Arai",
  metaDescription:
    "Canadian wedding photography, documentary and editorial. Collections from C$2,000, the same price in every city. See full real wedding galleries and book a free 30-minute call.",
  path: BASE_PATH,
};

function variantFor(market: Market): LandingVariant {
  const region = regionBySlug(market.regionSlug);
  const areas = market.areas.slice(1, 4).join(", ");
  return {
    slug: market.slug,
    h1: `Wedding Photographer in ${market.city}`,
    eyebrow: `${market.region} · 2027 and 2028 dates`,
    intro: "The day as it happened, photographed by me, with real direction for the portraits.",
    lede: market.lede,
    wherePlaceholder: `${market.city}, ${areas}…`,
    venues: region?.venues ?? [],
    season: region?.season ?? "",
    tax: region?.tax ?? "",
    faqs: market.faqs,
    metaTitle: `Wedding Photographer in ${market.city} | Check Your Date — Arman Arai`,
    metaDescription: `${market.city} wedding photography, documentary and editorial. Collections from C$2,000, the same price in every Canadian city. See full real wedding galleries and book a free 30-minute call.`,
    path: `${BASE_PATH}/${market.slug}`,
  };
}

export const CITY_VARIANTS: LandingVariant[] = MARKETS.map(variantFor);

export const variantBySlug = (slug: string) =>
  CITY_VARIANTS.find((v) => v.slug === slug);

export const LANDING_CITY_SLUGS = MARKETS.map((m) => m.slug);

/* ── The weddings shown on this page ────────────────────────────────────────
 *
 * Five of the nine albums in lib/galleries.ts, not all nine. The other four
 * (anastasia-daniil, sofia-lucas, margaux-antoine, eleanor-james) are real work
 * and stay exactly where they are on /galleries; they are left off *this* page
 * because their cover frames are an architectural abstract, a door, a dessert
 * table and a golf-club sign. On a page whose whole job is "is the work any
 * good", a cover that does not read as a wedding in half a second costs a click.
 *
 * Ordered per city so a couple sees their own region first. Nothing is hidden
 * from anyone: every variant still shows all five.
 */
export const LANDING_GALLERY_SLUGS = [
  "luca-lauren",
  "elisha-michael",
  "nicole-js",
  "eathon-jessica",
  "parsa-marjan",
];

/** The albums closest to this market, first. Everything else keeps its order. */
const NEAR: Record<string, string[]> = {
  montreal: ["luca-lauren", "nicole-js", "parsa-marjan"],
  toronto: ["elisha-michael", "eathon-jessica"],
};

export function galleryOrderFor(slug?: string): string[] {
  const first = (slug && NEAR[slug]) || [];
  return [...first, ...LANDING_GALLERY_SLUGS.filter((s) => !first.includes(s))];
}
