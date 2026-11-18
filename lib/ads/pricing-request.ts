/* The pricing-request ads pages: /wedding-photography/<city>-pricing.
 *
 * Three collections, and only three: Signature, Legacy and Photo + Film,
 * read from TIERS in lib/site.ts so a price change there reaches these pages,
 * the thank-you screen and the auto-reply email at once. Source: the owner,
 * 2026-09-28 ("there are only 3 packages: 3k, 4.2k and 5.9k").
 *
 * The form collects a date for Arman's reply. Availability is not inferred
 * by the page or its automatic guide; only Arman confirms whether he is free.
 */
import { TIERS, type Tier } from "../site";

/* The form's anchor and the one button label. Here, not in the "use client"
   InquiryFunnel: a plain value exported from a client module reaches a server
   component as a client reference, and `#${FORM_ID}` then printed the
   reference's error text into the header and closing buttons' hrefs. */
export const FORM_ID = "get-pricing";
/** Owner's date-focused CTA. FORM_ID preserves existing inquiry links. */
export const CTA_LABEL = "Send me your date, I'll tell you within 2 minutes if I'm free";

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
 *  it. Since 2026-11-17 there is only one rule, in every market: travel is
 *  INCLUDED in the collection price, and Arman arrives two days before the
 *  wedding to scout the venue. Toronto and Montréal keep the shorter "no
 *  travel costs" wording they have carried since 2026-09-28, which says the
 *  same thing to a couple. These strings are read by the thank-you screen and
 *  the sticky price bar, and lib/auto-reply.ts promises the same thing in the
 *  email that lands thirty seconds later, so the two must never disagree. */
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
    slug: "canada",
    travelShort: "travel included",
    /* Owner, 2026-11-17: on the national page travel is INCLUDED in the
       collection, and he arrives two days before the wedding to scout. That
       matches TRAVEL in lib/site.ts, which carries the same rule for /pricing,
       /faq, llms.txt, the wedding guide, the hubs and the journal. Keep the
       claim to Canada: a wedding outside it is still quoted per wedding. */
    travelNote: "A collection costs the same anywhere in Canada, and travel is included in it. The flights, the ground travel and the nights are inside the collection price, and I arrive two days before the wedding to scout your venue.",
    coverageAnswer: "Yes. Weddings anywhere in Canada, at the same published collection prices, with travel included. I arrive two days before the wedding to scout your venue and build the timeline around it.",
  },
  {
    slug: "vancouver",
    travelShort: "travel included",
    travelNote: "Travel is included in the collection price, in Vancouver and anywhere else in Canada. I arrive two days before the wedding to scout your venue.",
    coverageAnswer: "Yes. Vancouver, Burnaby, Richmond, the North Shore, the Fraser Valley, Squamish and Whistler, with travel included wherever the venue is.",
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
    slug: "edmonton",
    travelShort: "no travel costs",
    travelNote: "No travel costs.",
    coverageAnswer: "Yes. Edmonton and the surrounding area, with no travel costs.",
  },
  {
    slug: "calgary",
    travelShort: "travel included",
    travelNote: "Travel is included in the collection price, whether the wedding is in the city or up the Bow Valley. I arrive two days before the day to scout your venue.",
    coverageAnswer: "Yes. Calgary, Banff, Lake Louise, Canmore, Kananaskis and the Bow Valley, with travel included wherever the venue is.",
  },
  {
    slug: "victoria",
    travelShort: "travel included",
    travelNote: "Victoria is a ferry and a short drive, and both are included in the collection price. I come over two days before the wedding to scout your venue.",
    coverageAnswer: "Yes. Victoria, Oak Bay, Saanich, Sidney, the West Shore and the rest of Vancouver Island, with the ferry and the driving included.",
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

/* The form's second step (owner, 2026-10-01: "the inquiry form itself need
   to be more personalized"). Every answer changes something the couple then
   sees: the step-up and its reason, the day plan and the reviews on their
   guide, and what the email talks about. A question nothing uses is worse
   than no question, so never add one here without wiring it through. */
export type Option = { value: string; label: string };
export const GUEST_OPTIONS: Option[] = [
  { value: "under-50", label: "Under 50" },
  { value: "50-120", label: "50 to 120" },
  { value: "120-200", label: "120 to 200" },
  { value: "200-plus", label: "Over 200" },
];
export const SETUP_OPTIONS: Option[] = [
  { value: "same", label: "Same place" },
  { value: "different", label: "Different places" },
  { value: "unsure", label: "Not sure yet" },
];
export const PRIORITY_OPTIONS: Option[] = [
  { value: "candid", label: "Candid moments" },
  { value: "family", label: "Family and friends" },
  { value: "portraits", label: "Portraits of the two of us" },
  { value: "party", label: "The party" },
  { value: "film", label: "Film of the day" },
];
export const MAX_PRIORITIES = 2;
export const NOTE_MAX = 300;

/** The second step's answers. Optional everywhere on the server, so an
 *  inquiry from a page loaded before the form changed still goes through. */
export type DayDetails = { guests?: string; setup?: string; priorities?: string[]; note?: string };

export const labelOf = (options: Option[], value?: string) => options.find((option) => option.value === value)?.label;
export const priorityLabels = (values?: string[]) => (values ?? []).map((value) => labelOf(PRIORITY_OPTIONS, value)).filter((label): label is string => Boolean(label));
/** "Candid moments and the party", lower-cased after the first. */
export const prioritiesPhrase = (values?: string[]) => priorityLabels(values).map((label, i) => (i === 0 ? label : label.charAt(0).toLowerCase() + label.slice(1))).join(" and ");

/** The second step's answers, cleaned: unknown values dropped, at most two
 *  priorities, the note trimmed. Used by the route on whatever was posted. */
export function cleanDayDetails(input: { guests?: unknown; setup?: unknown; priorities?: unknown; note?: unknown }): DayDetails {
  const guests = GUEST_OPTIONS.some((option) => option.value === input.guests) ? String(input.guests) : undefined;
  const setup = SETUP_OPTIONS.some((option) => option.value === input.setup) ? String(input.setup) : undefined;
  const priorities = Array.isArray(input.priorities)
    ? [...new Set(input.priorities.filter((value): value is string => PRIORITY_OPTIONS.some((option) => option.value === value)))].slice(0, MAX_PRIORITIES)
    : [];
  const note = typeof input.note === "string" ? input.note.replace(/\s+/g, " ").trim().slice(0, NOTE_MAX) : "";
  return { ...(guests ? { guests } : {}), ...(setup ? { setup } : {}), ...(priorities.length ? { priorities } : {}), ...(note ? { note } : {}) };
}

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
  /** Why, in their terms when their answers give one (guests, two places, film). */
  stepUpReason?: string;
};

/** Why the next collection up is worth a look, from what it adds in TIERS. */
export const STEP_UP_REASON: Record<string, string> = {
  complete: "Two more hours, a second photographer for four of them, and a printed album.",
  "photo-film": "Twelve hours, with a dedicated filmmaker there all day and a longer film.",
};

/* The collection that fits is still what they chose: the hours they asked
   for, else their budget, else Signature. The second step only changes the
   step-up and why: a couple who says film matters is pointed at Photo + Film,
   and a big guest list or two places makes the case for Legacy's second
   photographer in their own terms. */
export function recommendCollection(coverage: string, budget: string, day: DayDetails = {}): Recommendation {
  const byCoverage = COVERAGE_OPTIONS.find((option) => option.value === coverage)?.slug;
  const byBudget = BUDGET_OPTIONS.find((option) => option.value === budget)?.slug;
  const slug = byCoverage ?? byBudget ?? "signature";
  const basis = byCoverage ? "coverage" : byBudget ? "budget" : "default";
  if (budget === "under-3000") return { slug, basis };
  const wantsFilm = day.priorities?.includes("film") ?? false;
  const next = PRICING_TIER_SLUGS[PRICING_TIER_SLUGS.indexOf(slug as (typeof PRICING_TIER_SLUGS)[number]) + 1];
  const stepUp = wantsFilm && slug !== "photo-film" ? "photo-film" : next;
  if (!stepUp) return { slug, basis };
  const guests = labelOf(GUEST_OPTIONS, day.guests);
  const bigDay = day.guests === "120-200" || day.guests === "200-plus";
  const stepUpReason = stepUp === "photo-film" && wantsFilm
    ? "You said film matters. Photo + Film puts a dedicated filmmaker beside me for all twelve hours."
    : stepUp === "complete" && bigDay
      ? `With ${guests!.toLowerCase()} guests, a second photographer for four hours means nobody is missed.`
      : stepUp === "complete" && day.setup === "different"
        ? "With the ceremony and reception in different places, Legacy adds two more hours and a second photographer for four of them."
        : STEP_UP_REASON[stepUp];
  return { slug, basis, stepUp, stepUpReason };
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
