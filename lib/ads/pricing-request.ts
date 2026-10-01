/* The pricing-request ads pages: /wedding-photography/<city>-pricing.
 *
 * Three collections, and only three: Signature, Legacy and Photo + Film,
 * read from TIERS in lib/site.ts so a price change there reaches these pages,
 * the thank-you screen and the auto-reply email at once. Source: the owner,
 * 2026-09-28 ("there are only 3 packages: 3k, 4.2k and 5.9k").
 *
 * Nothing here checks a date. The owner, same day: "There is no checking the
 * date." The form asks for the date so the reply can talk about it; no page,
 * email or screen may say a date is open, free, available or booked.
 */
import { TIERS, type Tier } from "../site";

/* The form's anchor and the one button label. Here, not in the "use client"
   InquiryFunnel: a plain value exported from a client module reaches a server
   component as a client reference, and `#${FORM_ID}` then printed the
   reference's error text into the header and closing buttons' hrefs. */
export const FORM_ID = "get-pricing";
export const CTA_LABEL = "Get Pricing";

export const PRICING_TIER_SLUGS = ["signature", "complete", "photo-film"] as const;
export const pricingTiers = (): Tier[] => PRICING_TIER_SLUGS.map((slug) => TIERS.find((tier) => tier.slug === slug)!);

/** The lines a collection card shows, in the order the cards show them. */
export function tierItems(tier: Tier): string[] {
  return [
    tier.crew !== "One lead photographer" ? tier.crew : "",
    tier.images, tier.preview, tier.delivery, tier.film, tier.rolls, tier.engagement,
    tier.album.includes("included") ? tier.album.replace(" included:", ":") : "",
  ].filter(Boolean);
}

/** Per market: the travel rule, and a coverage answer that does not contradict
 *  it. Toronto and Montréal carry no travel costs for now (owner, 2026-09-28).
 *  Vancouver keeps the rule its ads page already published. Calgary & Banff
 *  and Victoria (added 2026-10-01) carry the rule the rest of the site already
 *  publishes for the Rockies and the island: travel is quoted against the
 *  venue before booking. If the owner says "no travel costs" for them, it is
 *  these lines, as for Toronto. */
export type PricingMarket = {
  slug: string;
  /** For the price line and the sticky bar: "no travel costs". */
  travelShort: string;
  /** The sentence under the collections, on the thank-you screen and in the email. */
  travelNote: string;
  coverageAnswer: string;
};

export const PRICING_MARKETS: PricingMarket[] = [
  {
    slug: "vancouver",
    travelShort: "local travel included",
    travelNote: "Local travel within Vancouver and the Lower Mainland is included. Longer travel is quoted separately and agreed before you book.",
    coverageAnswer: "Yes. Vancouver, Burnaby, Richmond, the North Shore, the Fraser Valley, Squamish and Whistler. Local travel within Vancouver and the Lower Mainland is included; anything further is quoted before you book.",
  },
  {
    slug: "toronto",
    travelShort: "no travel costs",
    travelNote: "No travel costs.",
    coverageAnswer: "Yes. Toronto, Mississauga, Oakville, Vaughan, Markham and the surrounding area, with no travel costs.",
  },
  {
    slug: "montreal",
    travelShort: "no travel costs",
    travelNote: "No travel costs.",
    coverageAnswer: "Yes. Montréal, Laval, the South Shore, the Laurentians and the Eastern Townships, with no travel costs.",
  },
  {
    slug: "calgary",
    travelShort: "travel quoted before you book",
    travelNote: "Travel is quoted against your venue, kept to the route your date actually requires, and agreed before you book.",
    coverageAnswer: "Yes. Calgary, Banff, Lake Louise, Canmore, Kananaskis and the Bow Valley. Travel is quoted against your venue and agreed before you book.",
  },
  {
    slug: "victoria",
    travelShort: "travel quoted before you book",
    travelNote: "Victoria is a ferry and a short drive. Travel is quoted against your venue and agreed before you book.",
    coverageAnswer: "Yes. Victoria, Oak Bay, Saanich, Sidney, the West Shore and the rest of Vancouver Island. Travel is quoted against your venue and agreed before you book.",
  },
];
export const pricingMarket = (slug: string) => PRICING_MARKETS.find((market) => market.slug === slug);

/* The two qualifying questions on the form. Each answer that points at a
   collection names it, so the thank-you screen and the email can say which
   one fits and why. */
export const COVERAGE_OPTIONS: { value: string; label: string; slug?: string }[] = [
  { value: "8", label: "8 hours", slug: "signature" },
  { value: "10", label: "10 hours", slug: "complete" },
  { value: "photo-film", label: "12 hours + film", slug: "photo-film" },
  { value: "unsure", label: "Not sure yet" },
];
export const BUDGET_OPTIONS: { value: string; label: string; slug?: string }[] = [
  { value: "under-3000", label: "Under C$3,000", slug: "signature" },
  { value: "3000-4000", label: "C$3,000 to 4,000", slug: "signature" },
  { value: "4000-5500", label: "C$4,000 to 5,500", slug: "complete" },
  { value: "5500-plus", label: "C$5,500 or more", slug: "photo-film" },
  { value: "unsure", label: "Not sure yet" },
];

export type Recommendation = {
  slug: string;
  /** What the choice was made from: the coverage they asked for, their
   *  budget, or neither (Signature, the most-booked collection). */
  basis: "coverage" | "budget" | "default";
  /** The collection one step up, offered once as worth a look (owner,
   *  2026-10-01: upsell the next package). Absent at the top of the ladder,
   *  and when the budget is under the first price, where a bigger number only
   *  loses the couple. */
  stepUp?: string;
};

/** Why the next collection up is worth a look, from what it adds in TIERS. */
export const STEP_UP_REASON: Record<string, string> = {
  complete: "Two more hours, a second photographer for four of them, and a printed album.",
  "photo-film": "Twelve hours, with a dedicated filmmaker there all day and a longer film.",
};

export function recommendCollection(coverage: string, budget: string): Recommendation {
  const byCoverage = COVERAGE_OPTIONS.find((option) => option.value === coverage)?.slug;
  const byBudget = BUDGET_OPTIONS.find((option) => option.value === budget)?.slug;
  const slug = byCoverage ?? byBudget ?? "signature";
  const basis = byCoverage ? "coverage" : byBudget ? "budget" : "default";
  const next = PRICING_TIER_SLUGS[PRICING_TIER_SLUGS.indexOf(slug as (typeof PRICING_TIER_SLUGS)[number]) + 1];
  const stepUp = next && budget !== "under-3000" ? next : undefined;
  return { slug, basis, ...(stepUp ? { stepUp } : {}) };
}

/** Seasons for a couple with no exact date, starting with the current one.
 *  Winter is named for the December it starts in. */
export function seasonOptions(today: string, count = 9): string[] {
  const [year, month] = today.split("-").map(Number);
  const names = ["Spring", "Summer", "Fall", "Winter"];
  let index = month >= 3 && month <= 5 ? 0 : month >= 6 && month <= 8 ? 1 : month >= 9 && month <= 11 ? 2 : 3;
  let y = month <= 2 ? year - 1 : year;
  const seasons: string[] = [];
  for (let n = 0; n < count; n++) {
    seasons.push(index === 3 ? `Winter ${y}/${String(y + 1).slice(2)}` : `${names[index]} ${y}`);
    index += 1;
    if (index === 4) { index = 0; y += 1; }
  }
  return [...seasons, "Later than that"];
}

export const SEASON_PATTERN = /^(?:(?:Spring|Summer|Fall) 20\d\d|Winter 20\d\d\/\d\d|Later than that)$/;

export const longDate = (date: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
export const weekdayOf = (date: string) => new Intl.DateTimeFormat("en-CA", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

/** The collections as the form's thank-you view lists them. */
export const funnelCollections = () => pricingTiers().map((tier) => ({
  slug: tier.slug, name: tier.name, hoursLabel: `${tier.hours} hours of coverage`, price: tier.price, items: tierItems(tier),
}));
