/* Brand facts, the price ladder, and the regions, in one place.
 *
 * armanarai.ca is Canadian wedding photography only. No destination weddings,
 * no elopement curation: that is armanarai.com, a separate business on a
 * separate domain. Email and social handles are shared between the two.
 *
 * The commercial model is Montréal-based. One ladder of three collections, and
 * every region carries its own all-in price for each of them.
 *
 * THE PRICE IS ONE WHOLE NUMBER. Travel lives inside it. `region.fee` below is
 * an internal input to `quoteFor()` and must never be shown to a couple, named
 * in prose, or described as a fee, supplement, mileage or destination charge.
 * The owner was explicit about this: "There is no additional fee to the price."
 * Only sales tax and chosen add-ons can ever raise an invoice.
 *
 * Source: Arman_Arai_Canadian_Wedding_Model_Montreal_Base_2026.xlsx
 * (Package Catalog, Add-ons, Region Cost Inputs, Regional Positioning).
 */

export const SITE = {
  name: "Arman Arai",
  domain: "armanarai.ca",
  url: "https://www.armanarai.ca",
  email: "i@armanarai.com",
  instagram: "https://instagram.com/iArmanArai",
  instagramHandle: "@iArmanArai",
  pinterest: "https://pinterest.com/iarmanarai",
  base: "Montréal",
  blurb:
    "Documentary and editorial wedding photography, based in Montréal and working across Canada, with travel priced openly rather than hidden in a package.",
} as const;

/* ── The ladder ─────────────────────────────────────────────────────────────
 * Three public collections. `price` is the Montréal figure; every other region's
 * figure comes out of quoteFor(). Pre-tax. Core is the default recommendation.
 */

export type Tier = {
  slug: string;
  name: string;
  strap: string;
  coverage: string;
  hours: number;
  price: number;
  crew: string;
  images: string;
  session: string;
  planning: string;
  preview: string;
  delivery: string;
  album: string;
  film: string;
  /** Vertical clips for the couple to post while the gallery is still in edit. */
  social: string;
  includes: string[];
  bestFor: string;
  /** Internal travel-arithmetic key: Story Weekend travels a day longer. */
  feeKey: "standard" | "weekend";
};

export const TIERS: Tier[] = [
  {
    slug: "core",
    name: "Core",
    strap: "Recommended",
    coverage: "8 continuous hours",
    hours: 8,
    price: 4200,
    crew: "One lead photographer",
    images: "550+ edited images",
    session: "Montréal engagement session, or a welcome session on location",
    planning: "Timeline review and a family-photo plan",
    preview: "40 images within 48 hours",
    delivery: "Full gallery in 5 to 7 weeks",
    album: "Available as an add-on",
    film: "Available as an add-on",
    social: "A set of vertical social clips, delivered in the first week",
    includes: [
      "8 continuous hours, one lead photographer",
      "Vertical social clips in the first week, so you have something to post while the gallery is still being edited",
      "550+ edited images, high resolution with print permission",
      "Montréal engagement session or destination welcome session",
      "Timeline review and family-photo planning",
      "40-image preview within 48 hours",
      "Full gallery in 5 to 7 weeks",
    ],
    bestFor: "The primary full-wedding offer, and the right answer for most days",
    feeKey: "standard",
  },
  {
    slug: "signature",
    name: "Signature",
    strap: "One tier above Core",
    coverage: "10 continuous hours",
    hours: 10,
    price: 5900,
    crew: "Lead plus a second photographer for 6 hours",
    images: "800+ edited images",
    session: "Engagement or welcome session",
    planning: "90-minute planning session and a family-photo plan",
    preview: "60 images next day",
    delivery: "Full gallery in 4 weeks",
    album: "C$750 album credit",
    film: "Available as an add-on",
    social: "An expanded set of vertical social clips, delivered in 72 hours",
    includes: [
      "10 continuous hours",
      "An expanded set of vertical social clips within 72 hours",
      "Lead plus a second photographer for six hours",
      "800+ edited images",
      "Engagement or welcome session",
      "90-minute planning session and family-photo plan",
      "C$750 album credit",
      "60-image next-day preview",
      "Full gallery in 4 weeks",
    ],
    bestFor: "Full days with a large guest count or split morning logistics",
    feeKey: "standard",
  },
  {
    slug: "story-weekend",
    name: "Story Weekend",
    strap: "Two days",
    coverage: "12 hours across two days",
    hours: 12,
    price: 8200,
    crew: "Lead plus a second photographer for 8 hours",
    images: "1,000+ edited images",
    session: "Engagement or welcome session",
    planning: "Two planning calls and a location scout",
    preview: "80 images within 24 hours",
    delivery: "Full gallery in 3 weeks",
    album: "C$1,000 album credit",
    film: "Two rolls included",
    social: "Social clips from both days, the first set the morning after",
    includes: [
      "Social clips from both days, the first set delivered the morning after",
      "12 hours split across two days: 2-hour welcome or rehearsal, plus a 10-hour wedding",
      "Lead plus a second photographer for eight hours",
      "1,000+ edited images",
      "Engagement or welcome session",
      "Two planning calls and a location scout",
      "C$1,000 album credit and two rolls of film",
      "80-image preview within 24 hours",
      "Full gallery in 3 weeks",
    ],
    bestFor: "Two-day celebrations and destination weekends",
    feeKey: "weekend",
  },
];

export const tierBySlug = (slug: string) => TIERS.find((t) => t.slug === slug);
export const CORE = TIERS[0];

/* ── Regions ────────────────────────────────────────────────────────────────
 * `fee` and `weekendFee` are INTERNAL ARITHMETIC, never shown. They exist so
 * quoteFor() can produce each region's whole number, and they were derived from
 * real travel cash + the value of the travel time + the regional cost-per-
 * booking premium over Montréal, less a C$300 local allowance already inside
 * the base, rounded up to C$50. Print quoteFor(), never these.
 */

export type Region = {
  slug: string;
  name: string;
  short: string;
  /** The three markets that get their own price card and their own page. */
  primary?: boolean;
  /** Internal only: never rendered. Feeds quoteFor() for Core and Signature. */
  fee: number;
  /** Internal only: Story Weekend travels an extra night, so it computes higher. */
  weekendFee: number;
  /** Signature occasionally needs an extra night on the longer drives. */
  signatureFee?: number;
  bestTier: string;
  promise: string;
  travel: string;
  risk: string;
};

export const REGIONS: Region[] = [
  {
    slug: "montreal",
    primary: true,
    name: "Montréal and Old Montréal",
    short: "Montréal",
    fee: 0,
    weekendFee: 0,
    bestTier: "Core",
    promise: "Calm, editorial-documentary coverage from a photographer who lives here.",
    travel: "Everything within 75 km of Montréal is the same price: the island, Laval, the South Shore, out past Saint-Jérôme.",
    risk: "",
  },
  {
    slug: "eastern-townships",
    name: "Eastern Townships and the Laurentians",
    short: "Townships / Laurentians",
    fee: 950,
    weekendFee: 1350,
    bestTier: "Core",
    promise: "Montréal-quality coverage with vineyard and chalet logistics handled.",
    travel: "A drive and, realistically, one night. Both are already inside the number.",
    risk: "Late-night drives and seasonal lodging are the two things that go wrong here.",
  },
  {
    slug: "quebec-city",
    name: "Québec City and Charlevoix",
    short: "Québec City / Charlevoix",
    fee: 1350,
    signatureFee: 1750,
    weekendFee: 2100,
    bestTier: "Signature",
    promise: "Historic architecture or landscape storytelling, with the route planned in advance.",
    travel: "A long drive, an overnight, and the travel time itself, all priced.",
    risk: "A multi-location timeline over that distance needs a real plan, not optimism.",
  },
  {
    slug: "toronto",
    primary: true,
    name: "Toronto and the GTA",
    short: "Toronto / GTA",
    fee: 2250,
    weekendFee: 2650,
    bestTier: "Core or Signature",
    promise: "Cultural fluency, reliable team logistics, and multi-day scope defined in writing.",
    travel: "Rail or air, two hotel nights and ground transport.",
    risk: "Unbounded multi-day scope. This is why events are quoted individually here.",
  },
  {
    slug: "niagara-muskoka",
    name: "Niagara and Muskoka",
    short: "Niagara / Muskoka",
    fee: 2650,
    weekendFee: 3100,
    bestTier: "Signature",
    promise: "Winery and lake storytelling with transport and timing under control.",
    travel: "Ontario transport, a rental car and hotel nights.",
    risk: "Scattered venues and total car dependency between them.",
  },
  {
    slug: "vancouver",
    primary: true,
    name: "Vancouver, Whistler and Vancouver Island",
    short: "Vancouver / Whistler",
    fee: 4050,
    weekendFee: 4650,
    bestTier: "Signature",
    promise: "Coastal and mountain expertise, with weather and permits handled before the date.",
    travel: "Airfare, three nights and ground transport, all inside the price. Ferries to the Island too.",
    risk: "Peak-season lodging on the Sea-to-Sky is the single biggest cost swing in the country.",
  },
  {
    slug: "whistler",
    name: "Whistler and the Sea-to-Sky",
    short: "Whistler",
    fee: 4050,
    weekendFee: 4650,
    bestTier: "Signature",
    promise: "Mountain weddings with the permits, the access and the weather planned in advance.",
    travel: "Same trip as Vancouver, so the same number.",
    risk: "Peak-season lodging on the corridor is the biggest cost swing in the country.",
  },
  {
    slug: "vancouver-island",
    name: "Vancouver Island and Tofino",
    short: "Vancouver Island",
    fee: 4050,
    weekendFee: 4650,
    bestTier: "Story Weekend",
    promise: "Coastal weddings, with the ferry and the drive west already accounted for.",
    travel: "Ferry and the highway out to the coast are inside the same number as Vancouver.",
    risk: "Tofino is not a day trip; it wants the two-day tier.",
  },
  {
    slug: "banff",
    name: "Banff and Canmore",
    short: "Banff / Canmore",
    fee: 4100,
    weekendFee: 4700,
    bestTier: "Signature or Story Weekend",
    promise: "Mountain wedding storytelling with explicit weather, park and transport planning.",
    travel: "Airfare, three nights, a rental car and high-season lodging.",
    risk: "Parks Canada permits, weather, and hotel rates north of C$450 a night in summer.",
  },
];

export const regionBySlug = (slug: string) => REGIONS.find((r) => r.slug === slug);

/** The three cities with their own price card and their own page. */
export const PRIMARY_REGIONS = REGIONS.filter((r) => r.primary);
/** Everywhere else I work, listed once at the bottom of the pricing page. */
export const OTHER_REGIONS = REGIONS.filter((r) => !r.primary);

/** Internal travel arithmetic for a tier in a region. Never render this. */
export function feeFor(region: Region, tier: Tier): number {
  if (tier.feeKey === "weekend") return region.weekendFee;
  if (tier.slug === "signature" && region.signatureFee !== undefined) return region.signatureFee;
  return region.fee;
}

/** What a couple in this region actually pays, before tax. */
export const quoteFor = (region: Region, tier: Tier) => tier.price + feeFor(region, tier);

/* ── Add-ons ───────────────────────────────────────────────────────────────*/

export type Addon = { name: string; price: number; note: string; group: string };

export const ADDONS: Addon[] = [
  { group: "Coverage", name: "Extra coverage hour", price: 450, note: "One more hour on the day, editing included." },
  { group: "Coverage", name: "Second photographer, up to 6 hours", price: 750, note: "Travel outside the city is quoted separately." },
  { group: "Coverage", name: "Second photographer, up to 10 hours", price: 1050, note: "For a large guest count or split logistics." },
  { group: "Coverage", name: "Additional 2-hour event", price: 900, note: "A tea ceremony, rehearsal or welcome event." },
  { group: "Sessions", name: "Montréal engagement session", price: 700, note: "60 minutes, 50+ edited images. Travel within 75 km included." },
  { group: "Sessions", name: "Destination welcome session", price: 550, note: "45 minutes, when I am already on location. Not a standalone fly-out." },
  { group: "Prints", name: "10×10 heirloom album", price: 1200, note: "Designed album with a defined spread count." },
  { group: "Prints", name: "Parent album", price: 550, note: "A smaller duplicate, priced per copy." },
  { group: "Film and motion", name: "Two-roll film add-on", price: 450, note: "Two rolls, processing and scans. No guaranteed frame count." },
  { group: "Film and motion", name: "Hybrid vertical motion reel", price: 1250, note: "A 60 to 90 second vertical reel with selected audio. Not full videography." },
  { group: "Film and motion", name: "Dedicated videographer, 8 hours", price: 3500, note: "A dedicated operator, highlight film, ceremony and speeches." },
  { group: "Film and motion", name: "Dedicated videographer, 10 hours", price: 4500, note: "A second video operator is additional." },
  { group: "Film and motion", name: "Content creator, 8 hours", price: 1200, note: "A dedicated phone-content operator and next-day clips." },
  { group: "Film and motion", name: "Drone add-on", price: 350, note: "Aerial stills and clips where it is legal and safe." },
  { group: "Delivery", name: "Seven-day gallery rush", price: 900, note: "Capacity-limited. I will not sell this every week." },
];

export const ADDON_GROUPS = [...new Set(ADDONS.map((a) => a.group))];

/* ── The three home markets ─────────────────────────────────────────────────
 * These get their own page. Every other region is covered and priced, but sold
 * from the pricing page rather than a hub of its own.
 */

export type Market = {
  slug: string;
  city: string;
  name: string;
  province: string;
  region: string;
  regionSlug: string;
  areas: string[];
  angle: string;
  lede: string;
  body: string[];
  faqs: { q: string; a: string }[];
};

export const MARKETS: Market[] = [
  {
    slug: "montreal",
    city: "Montréal",
    name: "Montréal",
    province: "Québec",
    region: "Montréal, the Laurentians and the Eastern Townships",
    regionSlug: "montreal",
    areas: [
      "Montréal", "Vieux-Montréal", "Laval", "Longueuil", "Westmount", "Outremont",
      "the Plateau", "Mont-Tremblant", "the Laurentians", "the Eastern Townships",
    ],
    angle: "Documentary coverage from a photographer who actually lives here",
    lede:
      "This is home. Everything within 75 km of Montréal is one price, with no overnight and no surprise line waiting at the end of the invoice.",
    body: [
      "The work here is documentary and editorial: I photograph what happens rather than staging a version of it, then I direct properly for the twenty minutes of portraits where direction is what you actually want. That distinction matters more in Montréal than anywhere else I work, because the market is full of packages that promise a number of images and say nothing about how the day will feel.",
      "Living here is the whole difference. I have already made the mistakes: I know which side of Place d'Armes is lit at five in July and which at five in October, that the Plateau photographs best in falling snow, and which venues lose the light an hour earlier than the couple expects. That is not something a photographer flying in can have, and it is why Montréal is the only market where I charge no travel at all.",
      "Old Montréal, the Plateau, Mont-Royal and the whole island are inside the included radius, so a Core wedding here is C$4,200 and that is the entire number. The Laurentians and the Eastern Townships are a drive and a night, which makes Core C$5,150 there. Québec City and Charlevoix are further out at C$5,550. Each of those is one figure with the drive, the night and the diesel already inside it, published before you ask rather than calculated after you commit.",
    ],
    faqs: [
      {
        q: "Do you speak French?",
        a: "No. I work in English, and I want to be straightforward about that rather than let you find out on the day. In practice it has not been a problem: your planner, your venue and your officiant handle the French side of the day, and photography direction is mostly gesture and a handful of words. If a fully French-language photographer matters to you, say so and I will point you at someone rather than talk you out of it.",
      },
      {
        q: "What exactly does the 75 km radius include?",
        a: "The island, Laval, the South Shore, and out past Saint-Jérôme and Saint-Hyacinthe. If your venue is inside that, Core is C$4,200 and there is no travel line at all. Outside it, the region has its own whole number on the pricing page, already carrying the drive and the night. Either way you are looking at one figure, not a base plus something.",
      },
      {
        q: "We are having a civil ceremony with a notaire. Is that too small?",
        a: "No, and it does not get a lesser version of the work. Core covers a notaire ceremony, portraits and a long dinner comfortably. If your day is genuinely shorter than eight hours, say so and I will scope it down rather than sell you hours you will not use.",
      },
    ],
  },
  {
    slug: "toronto",
    city: "Toronto",
    name: "Toronto",
    province: "Ontario",
    region: "Toronto, the GTA and Southern Ontario",
    regionSlug: "toronto",
    areas: [
      "Toronto", "Mississauga", "Brampton", "Vaughan", "Markham", "Richmond Hill",
      "Oakville", "Burlington", "Hamilton", "Scarborough", "Etobicoke",
      "Niagara-on-the-Lake", "Muskoka", "Prince Edward County",
    ],
    angle: "Cultural fluency and multi-day weddings scoped event by event",
    lede:
      "The GTA is the densest wedding market in the country and the one most often quoted badly. A three-day celebration is not one package with a bigger number on it.",
    body: [
      "So I scope by event rather than by package. How many days, how many venues, how far apart, whether any two events share a day, how many people are in each room, and which twenty minutes of the whole thing you would be heartbroken to lose. Those six answers decide crew, travel and editing volume, which is where the cost actually lives. They also produce a timeline that survives contact with Highway 401 traffic on a Saturday in June, which no flat package has ever done.",
      "The part that gets underestimated is editing capacity rather than shooting capacity. A three-day celebration produces something like fifteen to twenty thousand frames. A photographer whose workflow is built for one Saturday will take four or five months to return that gallery and will quote you eight weeks when you ask. I would rather tell you the real number at the start, which is why the delivery date goes in the contract as a date.",
      "I come in from Montréal, and that is already paid for. A Core wedding in Toronto or anywhere in the GTA is C$6,450, Signature is C$8,150, and the two-day Story Weekend is C$10,850. Rail or air, two hotel nights and ground transport are inside those figures, which is why nothing arrives at the end of the invoice. Niagara, Muskoka and Prince Edward County have their own numbers, starting at C$6,850 for Core, because scattered venues and a rental car cost more than a subway pass.",
    ],
    faqs: [
      {
        q: "How do you price a three-day South Asian wedding?",
        a: "By event, not by package. I need the number of days, the venues, the distance between them, whether any two events run the same day, and how many people are in each room. That decides crew, travel and editing volume, which is where the cost actually lives. You get one quote with the whole thing itemised, and the additional-event add-on is C$900 for a two-hour event.",
      },
      {
        q: "You are based in Montréal. Is that a problem?",
        a: "It costs you nothing extra, because the flight and the hotel nights are already inside the C$6,450. What it buys is that I arrive the day before, rested, having walked your venue in daylight. Toronto photographers who live twenty minutes away frequently do neither.",
      },
      {
        q: "How far outside the GTA do you go?",
        a: "Niagara-on-the-Lake, Muskoka and Prince Edward County are all regularly worked and all priced as one region. Anywhere else in Southern Ontario I will quote from the same formula rather than inventing a number.",
      },
    ],
  },
  {
    slug: "vancouver",
    city: "Vancouver",
    name: "Vancouver",
    province: "British Columbia",
    region: "Vancouver, the Sea-to-Sky corridor and Vancouver Island",
    regionSlug: "vancouver",
    areas: [
      "Vancouver", "Burnaby", "Richmond", "North Vancouver", "West Vancouver",
      "Squamish", "Whistler", "the Sea-to-Sky corridor", "Tofino", "Victoria",
      "the Gulf Islands", "the Fraser Valley",
    ],
    angle: "Coastal and mountain expertise, with weather and permits handled before the date",
    lede:
      "Three products in one region: a Lower Mainland wedding, a Sea-to-Sky or Whistler day, and Vancouver Island. They differ by access and weather, not by how the photographs are made.",
    body: [
      "For a city wedding the work is the same as anywhere: a timeline that respects the light, coverage that does not run out before the dancing, and portraits that take twenty minutes rather than an hour and a half. The local difference is rain. Between October and April a wet ceremony is not the exception, so every timeline I build has a covered plan that is a real plan, scouted in advance, not a shrug on the day.",
      "Sea-to-Sky is a different job. Whistler and Squamish need travel time counted properly, and anything on Crown land or in a provincial park needs its permit sorted well before the date. Vancouver Island adds a ferry and, for Tofino, a further three hours of highway. None of that appears on your invoice: Core is C$8,250 whether the day happens in Kitsilano, in Whistler or in Tofino, and the flight, the three nights, the ground transport and the ferry are already inside that figure.",
      "The all-inclusive mountain packages in this market start around C$8,500 once vendors and travel are bundled together. If that is the day you want, I will tell you what it actually costs to build. If you want photography, the number on this page is the whole price.",
    ],
    faqs: [
      {
        q: "What happens if it rains?",
        a: "We shoot. Every timeline I build names a specific covered location that I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery, but only when the backup was decided in advance rather than in a parking lot.",
      },
      {
        q: "Do you cover Vancouver Island and Tofino?",
        a: "Yes, and they carry the same price as Vancouver and Whistler: C$8,250 for Core, with the ferry and the drive out to the west coast already inside it. What I will not do is pretend Tofino is a day trip. It needs an extra night, which is why Story Weekend at C$12,850 is often the honest collection there.",
      },
      {
        q: "Are permits really necessary?",
        a: "For a ceremony in a provincial park or on Crown land, yes, and they are slow. I arrange them before the date rather than hoping nobody asks. Helicopter access, transport and vendors are quoted as separate lines so you can see each one and decline any of them.",
      },
    ],
  },
];

export const marketBySlug = (slug: string) => MARKETS.find((m) => m.slug === slug);

/** Lowest published number on the site, used for "from" copy that stays true. */
export const STARTING_FROM = CORE.price;
