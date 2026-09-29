/* Short Story: the Vancouver collection sold only on the Google Ads pages.
 *
 * It is not on /pricing. Both Vancouver ads pages (/wedding-photography/
 * vancouver-1500 and /wedding-photography/vancouver-pricing) read it from here,
 * and so does the pricing-request email, so the offer and the days it runs on
 * are written once.
 *
 * shortStoryOnDate() is the `availability` sentence below turned into code.
 * Change one and you must change the other.
 */
import type { Tier } from "../site";

export type IntroWeddingOffer = {
  slug: string;
  name: string;
  price: number;
  hours: number;
  strap: string;
  items: string[];
  availability: string;
  /** The FAQ answer to "What is included, and what costs extra?" */
  includedAnswer: string;
  /** The "Always included." paragraph under the collection cards. */
  alwaysIncluded: string;
  /** The travel line under the collection cards. */
  travelNote: string;
  /** The short form of the travel rule, for the price line and the sticky bar. */
  travelShort: string;
};

export const SHORT_STORY: IntroWeddingOffer = {
  slug: "short-story",
  name: "Short Story",
  price: 1500,
  hours: 6,
  strap: "Six hours. From the ceremony into the celebration.",
  items: [
    "6 continuous hours photographed by Arman",
    "60-minute engagement photoshoot",
    "One planning call, timeline guidance and a family-photo plan",
    "400+ edited high-resolution photographs with print permission",
    "30-image preview within 48 hours",
    "Full private online gallery within 2 weeks",
    "Local travel within Vancouver and the Lower Mainland",
    "10 social media reels",
    "Printed mini photos for guests at the end of the night",
    "1 roll of film included",
  ],
  availability: "Short Story is available Sunday through Thursday. Friday and Saturday dates can be booked within 60 days when the date remains open. It is not available on peak Saturdays from May through October. It is best suited to one-location weddings. For eight hours, choose Signature; for 10 to 12 hours with a dedicated filmmaker, choose Photo + Film.",
  includedAnswer: "Short Story includes six continuous hours photographed by me, a 60-minute engagement photoshoot, planning, 400+ edited photographs, a 30-image preview within 48 hours, a private online gallery with print permission, 10 social media reels, printed mini photos handed to your guests at the end of the night and a roll of real film. Signature adds two more hours, a colour-graded feature film and a second roll. Photo + Film adds 10 to 12 hours of coverage, a dedicated filmmaker and a printed album. Extra coverage and longer travel are quoted separately. Prices are in Canadian dollars before tax. Local Vancouver and Lower Mainland travel is included.",
  alwaysIncluded: "A 60-minute engagement photoshoot. Photography by Arman. Timeline and family-photo planning. A full edited gallery with print permission. Social reels, film prints handed to your guests on the night, and real film in every collection on this page.",
  travelNote: "Local travel within Vancouver and the Lower Mainland is included with Short Story. Longer travel is quoted separately and agreed before you book.",
  travelShort: "local travel included",
};

/** The two published collections shown beside Short Story, as the Vancouver
 *  ads pages sell them. */
export const VANCOUVER_TIER_SLUGS = ["signature", "photo-film"];
export const VANCOUVER_TIER_OVERRIDES: Record<string, Partial<Tier> & { hoursLabel?: string }> = {
  "photo-film": {
    hoursLabel: "10 to 12 hours of photography and film",
    images: "800+ edited images",
  },
};
export const VANCOUVER_COVERAGE_SUMMARY = "6, 8 or 10 to 12 hours";

const DAY = 86_400_000;

/** Sunday to Thursday, always. Friday and Saturday only within 60 days of
 *  today, and never a Saturday from May to October. Dates are YYYY-MM-DD in
 *  Vancouver time, as weddingToday() returns them. */
export function shortStoryOnDate(date: string, today: string): boolean {
  const day = new Date(`${date}T12:00:00Z`);
  const weekday = day.getUTCDay();
  if (weekday <= 4) return true;
  const month = day.getUTCMonth() + 1;
  if (weekday === 6 && month >= 5 && month <= 10) return false;
  return (day.getTime() - Date.parse(`${today}T12:00:00Z`)) / DAY <= 60;
}

/* The two qualifying questions on the pricing-request form. Each answer that
   points at a collection names it, so the thank-you screen can say which one
   fits and why. */
export const COVERAGE_OPTIONS: { value: string; label: string; slug?: string }[] = [
  { value: "6", label: "6 hours", slug: "short-story" },
  { value: "8", label: "8 hours", slug: "signature" },
  { value: "10-12", label: "10 to 12 hours", slug: "photo-film" },
  { value: "unsure", label: "Not sure yet" },
];
export const BUDGET_OPTIONS: { value: string; label: string; slug?: string }[] = [
  { value: "under-1500", label: "Under C$1,500", slug: "short-story" },
  { value: "1500-2500", label: "C$1,500 to 2,500", slug: "short-story" },
  { value: "2500-4000", label: "C$2,500 to 4,000", slug: "signature" },
  { value: "4000-6000", label: "C$4,000 to 6,000", slug: "photo-film" },
  { value: "6000-plus", label: "C$6,000 or more", slug: "photo-film" },
  { value: "unsure", label: "Not sure yet" },
];

export type Recommendation = {
  slug: string;
  /** What the choice was made from: the hours they asked for, their budget,
   *  or neither (Signature, the most-booked collection). */
  basis: "coverage" | "budget" | "default";
  /** True when Short Story would have been the answer but is not offered on
   *  their date, so the next collection up was chosen instead. */
  shortStoryUnavailable: boolean;
};

/** shortStory is null when the couple has no exact date yet. */
export function recommendCollection(coverage: string, budget: string, shortStory: boolean | null): Recommendation {
  const byCoverage = COVERAGE_OPTIONS.find((option) => option.value === coverage)?.slug;
  const byBudget = BUDGET_OPTIONS.find((option) => option.value === budget)?.slug;
  const basis = byCoverage ? "coverage" : byBudget ? "budget" : "default";
  const slug = byCoverage ?? byBudget ?? "signature";
  if (slug === SHORT_STORY.slug && shortStory === false) return { slug: "signature", basis, shortStoryUnavailable: true };
  return { slug, basis, shortStoryUnavailable: false };
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
