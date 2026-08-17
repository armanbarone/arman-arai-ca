/* Brand facts, the price ladder, and the regions, in one place.
 *
 * armanarai.ca is Canadian wedding photography only. No destination weddings,
 * no elopement curation: that is armanarai.com, a separate business on a
 * separate domain. Email and social handles are shared between the two.
 *
 * THE PRICE IS ONE WHOLE NUMBER. Each of the three regions publishes its own
 * figure for each collection and that figure already contains travel and
 * accommodation. Never describe anything as a fee, supplement, mileage or
 * destination charge. The owner was explicit: "There is no additional fee to
 * the price." Only sales tax and chosen add-ons can raise an invoice.
 *
 * Anywhere outside the three published regions is quoted on request rather
 * than guessed at. Do not invent a number for it.
 *
 * Source: Arman Arai {Montreal,Toronto,Vancouver} Wedding Prices 2027.pdf.
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
 * Three collections. Hours, crew and deliverables are identical in every
 * region; only the price differs, and it lives on the region. `price` here is
 * the lowest published figure for that collection, used for honest "from" copy.
 */

export type Tier = {
  slug: string;
  name: string;
  strap: string;
  coverage: string;
  hours: number;
  /** The lowest published figure across the three regions. For "from" copy. */
  price: number;
  crew: string;
  images: string;
  session: string;
  planning: string;
  preview: string;
  delivery: string;
  album: string;
  /** The colour-graded feature film included in this collection. */
  film: string;
  /** Rolls of real film, processed and scanned. */
  rolls: string;
  /** Prints handed to guests on the night. In every collection. */
  prints: string;
  includes: string[];
  bestFor: string;
};

export const TIERS: Tier[] = [
  {
    slug: "core",
    name: "Core",
    strap: "Full day",
    coverage: "8 continuous hours",
    hours: 8,
    price: 4000,
    crew: "One lead photographer",
    images: "550+ edited images",
    session: "Engagement session, or a welcome session on location",
    planning: "Timeline review and a family-photo plan",
    preview: "40 images within 48 hours",
    delivery: "Full gallery in 5 to 7 weeks",
    album: "Available as an add-on",
    film: "A 1-minute feature film, colour graded",
    rolls: "",
    prints: "Film prints handed to guests on the night",
    includes: [
      "8 continuous hours, one lead photographer",
      "550+ edited images, high resolution with print permission",
      "A 1-minute feature film, colour graded",
      "Film prints handed to guests on the night",
      "An engagement session, or a welcome session on location",
      "Timeline review and a family-photo plan",
      "40-image preview within 48 hours",
      "Full gallery in 5 to 7 weeks",
    ],
    bestFor: "The primary full-wedding offer, and the right answer for most days",
  },
  {
    slug: "signature",
    name: "Signature",
    strap: "Most booked",
    coverage: "10 continuous hours",
    hours: 10,
    price: 5500,
    crew: "Lead plus a second photographer for 6 hours",
    images: "800+ edited images",
    session: "Engagement session, or a welcome session on location",
    planning: "90-minute planning call and a family-photo plan",
    preview: "60 images next day",
    delivery: "Full gallery in 4 weeks",
    album: "C$750 credit toward an heirloom album",
    film: "A 2-minute feature film, colour graded",
    rolls: "1 roll of film, processed and scanned",
    prints: "Film prints handed to guests on the night",
    includes: [
      "10 continuous hours, lead plus a second photographer for six",
      "800+ edited images, high resolution with print permission",
      "A 2-minute feature film, colour graded",
      "1 roll of film, processed and scanned",
      "Film prints handed to guests on the night",
      "An engagement session, or a welcome session on location",
      "90-minute planning call and a family-photo plan",
      "60-image preview next day",
      "Full gallery in 4 weeks",
      "C$750 credit toward an heirloom album",
    ],
    bestFor: "Full days with a large guest count or split morning logistics",
  },
  {
    slug: "story-weekend",
    name: "Story Weekend",
    strap: "Two days",
    coverage: "12 hours across two days",
    hours: 12,
    price: 7000,
    crew: "Lead plus a second photographer for 8 hours",
    images: "1,000+ edited images",
    session: "Engagement session included",
    planning: "Two planning calls and a location scout",
    preview: "80 images within 24 hours",
    delivery: "Full gallery in 3 weeks",
    album: "C$1,000 credit toward an heirloom album",
    film: "A 2-minute feature film, colour graded",
    rolls: "2 rolls of film, processed and scanned",
    prints: "Film prints handed to guests on the night",
    includes: [
      "12 hours across two days: a 2-hour welcome or rehearsal, plus a 10-hour wedding",
      "1,000+ edited images, high resolution with print permission",
      "A 2-minute feature film, colour graded",
      "2 rolls of film, processed and scanned",
      "Film prints handed to guests on the night",
      "Engagement session included",
      "Two planning calls and a location scout",
      "80-image preview within 24 hours",
      "Full gallery in 3 weeks",
      "C$1,000 credit toward an heirloom album",
    ],
    bestFor: "Two-day celebrations, and any wedding whose guests travel in",
  },
];

export const tierBySlug = (slug: string) => TIERS.find((t) => t.slug === slug);
export const CORE = TIERS[0];

/* ── Regions ────────────────────────────────────────────────────────────────
 * Three published regions. Each `prices` figure is what a couple there pays,
 * with travel and accommodation already inside it. `covers` is the list of
 * places that share that price. Anywhere else is quoted on request; there is
 * no formula to fall back on and inventing one is how this went wrong before.
 */

export type Region = {
  slug: string;
  name: string;
  short: string;
  primary: true;
  /** Keyed by tier slug. This IS the price. Nothing is added to it. */
  prices: Record<string, number>;
  /** Everywhere that shares this price. */
  covers: string[];
  /** Sales tax on top, stated per province. */
  tax: string;
  /** Published market range for context on the pricing page. */
  marketRange: string;
  season: string;
  bestTier: string;
  promise: string;
  travel: string;
  risk: string;
  /** Venues from the 2027 sheet. Real rooms, not a wish list. */
  venues: string[];
  /** Where portraits actually happen in this region. */
  portraits: string[];
};

export const REGIONS: Region[] = [
  {
    slug: "montreal",
    primary: true,
    name: "Montréal and Québec",
    short: "Montréal",
    prices: { core: 4000, signature: 5500, "story-weekend": 7000 },
    covers: [
      "Montréal", "Vieux-Montréal", "Laval", "the South Shore",
      "the Laurentians", "the Eastern Townships", "Québec City", "Charlevoix",
    ],
    tax: "QST 9.975% plus GST 5%, about 14.975% combined",
    marketRange: "CAD 3,000 to 8,000+ for a full day across the market",
    season: "May to October, peaking June to September, with October foliage",
    bestTier: "Core",
    promise: "Calm, editorial-documentary coverage from a photographer who lives here.",
    travel: "Montréal, the surrounding region, Québec City and Charlevoix all share this price.",
    risk: "",
    venues: [
      "Château Ramezay", "Windsor Ballrooms", "Le Gesù", "Fairmont Queen Elizabeth",
      "Terrasse Nelligan", "Château Frontenac", "Eastern Townships wineries",
    ],
    portraits: ["Vieux-Montréal", "Mont-Royal", "the Old Port", "Old Québec"],
  },
  {
    slug: "toronto",
    primary: true,
    name: "Toronto and Southern Ontario",
    short: "Toronto",
    prices: { core: 4000, signature: 6000, "story-weekend": 8500 },
    covers: [
      "Toronto", "the GTA", "Mississauga", "Vaughan", "Markham", "Oakville",
      "Hamilton", "Niagara", "Niagara-on-the-Lake", "the 1000 Islands",
    ],
    tax: "13% HST",
    marketRange: "CAD 2,700 to 5,500 for a full day across the GTA",
    season: "May to October, peaking June to September, with October foliage",
    bestTier: "Core or Signature",
    promise: "Cultural fluency, reliable team logistics, and multi-day scope defined in writing.",
    travel: "Travel and accommodation from Montréal are already inside this price.",
    risk: "Unbounded multi-day scope. This is why multi-day events are quoted by event.",
    venues: [
      "Casa Loma", "The Fermenting Cellar and Archeo", "Graydon Hall Manor",
      "Liberty Grand", "Omni King Edward",
    ],
    portraits: [
      "the Distillery District", "the Toronto Islands", "High Park",
      "Evergreen Brick Works", "the Scarborough Bluffs",
    ],
  },
  {
    slug: "vancouver",
    primary: true,
    name: "Vancouver and the Sea-to-Sky",
    short: "Vancouver",
    prices: { core: 4500, signature: 6500, "story-weekend": 9000 },
    covers: [
      "Vancouver", "North Vancouver", "West Vancouver", "Burnaby", "Richmond",
      "Squamish", "Whistler", "the Sea-to-Sky corridor",
    ],
    tax: "5% GST, plus 7% PST where applicable",
    marketRange: "CAD 5,800 to 7,500 for premium local coverage",
    season: "April to October, peaking June to September, plus a Whistler winter season",
    bestTier: "Signature",
    promise: "Coastal and mountain expertise, with weather and permits handled before the date.",
    travel: "Vancouver, the North Shore, Squamish and Whistler all share this price.",
    risk: "Rain between October and April, and permits on Crown land or in a provincial park.",
    venues: [
      "Stanley Park Pavilion", "Hycroft, University Women's Club", "Fairmont Pacific Rim",
      "Grouse Mountain", "Fairmont Chateau Whistler", "Nita Lake Lodge",
      "Audain Art Museum", "Sea to Sky Gondola",
    ],
    portraits: [
      "Jericho and Kitsilano beaches", "VanDusen", "Queen Elizabeth Park",
      "the Squamish valley",
    ],
  },
];

export const regionBySlug = (slug: string) => REGIONS.find((r) => r.slug === slug);

/** All three regions are primary now. Kept for the call sites that ask. */
export const PRIMARY_REGIONS = REGIONS;

/** Everywhere outside the three published regions. */
export const OUTER_REGIONS_NOTE =
  "Anywhere else in Canada, including Muskoka, Prince Edward County, " +
  "Vancouver Island and the Rockies, is quoted on request rather than " +
  "guessed at. Send the date and the venue and you will have a real number.";

/** What a couple in this region pays for this collection, before tax. */
export const quoteFor = (region: Region, tier: Tier) => region.prices[tier.slug];

/** Booking terms, identical in every region. */
export const TERMS = {
  retainer: "30% retainer secures your date",
  balance: "Balance due 30 days before the wedding",
  extraHour: 450,
} as const;

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
      "One price covers the whole province's worth of ground I work here. Old Montréal, the Plateau, Mont-Royal and the island, then the Laurentians and the Eastern Townships, then Québec City and Charlevoix, all cost the same: Core is C$4,000, Signature is C$5,500, and the two-day Story Weekend is C$7,000. A vineyard in Sutton is not a more expensive wedding than one on Saint-Paul, because the drive and the night are already inside the figure rather than added to it.",
    ],
    faqs: [
      {
        q: "Do you speak French?",
        a: "No. I work in English, and I want to be straightforward about that rather than let you find out on the day. In practice it has not been a problem: your planner, your venue and your officiant handle the French side of the day, and photography direction is mostly gesture and a handful of words. If a fully French-language photographer matters to you, say so and I will point you at someone rather than talk you out of it.",
      },
      {
        q: "What exactly does the 75 km radius include?",
        a: "Further than most photographers include. The island, Laval and the South Shore obviously, but also the Laurentians, the Eastern Townships, Québec City and Charlevoix, all at the same price: C$4,000 for Core. There is no travel line on any of them. Somewhere further out than that gets quoted before you commit rather than calculated after.",
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
      "I come in from Montréal, and that is already paid for. A Core wedding in Toronto or anywhere in the GTA is C$4,000, Signature is C$6,000, and the two-day Story Weekend is C$8,500. Rail or air, the hotel nights and ground transport are inside those figures, which is why nothing arrives at the end of the invoice. Niagara, Niagara-on-the-Lake and the 1000 Islands are the same price as downtown. Muskoka and Prince Edward County sit outside the published region, so those get quoted on request rather than guessed at.",
    ],
    faqs: [
      {
        q: "How do you price a three-day South Asian wedding?",
        a: "By event, not by package. I need the number of days, the venues, the distance between them, whether any two events run the same day, and how many people are in each room. That decides crew, travel and editing volume, which is where the cost actually lives. You get one quote with the whole thing itemised, and the additional-event add-on is C$900 for a two-hour event.",
      },
      {
        q: "You are based in Montréal. Is that a problem?",
        a: "It costs you nothing extra, because the travel and the hotel nights are already inside the C$4,000. What it buys is that I arrive the day before, rested, having walked your venue in daylight. Toronto photographers who live twenty minutes away frequently do neither.",
      },
      {
        q: "How far outside the GTA do you go?",
        a: "Niagara, Niagara-on-the-Lake and the 1000 Islands are inside the published Toronto price, so they cost what a downtown wedding costs. Muskoka and Prince Edward County are outside it and are quoted on request. I work in both regularly; I just will not print a number for them that I have not costed against your actual venue.",
      },
    ],
  },
  {
    slug: "vancouver",
    city: "Vancouver",
    name: "Vancouver",
    province: "British Columbia",
    region: "Vancouver, the North Shore and the Sea-to-Sky corridor",
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
      "Sea-to-Sky is a different job. Whistler and Squamish need travel time counted properly, and anything on Crown land or in a provincial park needs its permit sorted well before the date. None of that appears on your invoice: Core is C$4,500 whether the day happens in Kitsilano, in Squamish or up at Whistler, and the flight, the nights and the ground transport are already inside that figure. Vancouver Island and Tofino sit outside the published region, because a ferry and three more hours of highway are a different trip; those are quoted on request.",
      "Premium local photography in this market runs roughly C$5,800 to C$7,500 for a full day, and multi-service mountain packages start around C$8,500 once vendors are bundled in. If that bundled day is what you want, I will tell you honestly what it costs to build. If you want the photography, the number on this page is the whole price and it already contains the flight.",
    ],
    faqs: [
      {
        q: "What happens if it rains?",
        a: "We shoot. Every timeline I build names a specific covered location that I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery, but only when the backup was decided in advance rather than in a parking lot.",
      },
      {
        q: "Do you cover Vancouver Island and Tofino?",
        a: "Yes, and they are the one part of this coast I quote rather than publish. Vancouver, the North Shore, Squamish and Whistler all share the C$4,500 Core price. The Island adds a ferry and Tofino adds three hours of highway beyond that, which is a genuinely different trip, so I price it against your actual venue and date. What I will not do is pretend Tofino is a day trip: it wants the two-day collection.",
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
