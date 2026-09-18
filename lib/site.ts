/* Brand facts, the price ladder, and the regions, in one place.
 *
 * armanarai.ca is Canadian wedding photography only. No destination weddings,
 * no elopement curation: that is armanarai.com, a separate business on a
 * separate domain. Email and social handles are shared between the two.
 *
 * ONE PRICE, EVERYWHERE. A collection costs the same in Montréal, Toronto,
 * Vancouver or anywhere else in the country. The city does not move the
 * number; the photography is identical, so the price is identical.
 *
 * TRAVEL IS SEPARATE AND IT IS QUOTED, NOT GUESSED. Everything within 100 km
 * of Montréal is inside the price. Beyond that, travel is billed at what it
 * actually costs and written into the contract before signing. There is no
 * published travel grid, because a flight to Tofino in July and a drive to
 * Québec City in October are not the same number. Never invent one.
 *
 * Source: the owner, 2026-09-17. This supersedes the earlier per-region
 * ladder, in which each city carried its own all-in figure.
 */

export const SITE = {
  name: "Arman Arai",
  domain: "armanarai.ca",
  url: "https://www.armanarai.ca",
  email: "i@armanarai.com",
  instagram: "https://instagram.com/iarmanarai",
  instagramHandle: "@iarmanarai",
  pinterest: "https://pinterest.com/iarmanarai",
  base: "Montréal",
  blurb:
    "Documentary and editorial wedding photography, based in Montréal and working across Canada. One price for a collection wherever it happens, with travel quoted openly on top rather than hidden inside it.",
} as const;

/* ── The ladder ─────────────────────────────────────────────────────────────
 * Three collections. `price` is the whole price of the collection anywhere in
 * Canada. Travel beyond 100 km of Montréal is quoted separately; see TRAVEL.
 */

export type Tier = {
  slug: string;
  name: string;
  strap: string;
  coverage: string;
  hours: number;
  /** The national price of this collection, before tax and before travel. */
  price: number;
  crew: string;
  images: string;
  planning: string;
  preview: string;
  delivery: string;
  album: string;
  /** The colour-graded feature film, where there is one. */
  film: string;
  /** Rolls of real film, processed and scanned. */
  rolls: string;
  /** Vertical social reels. In every collection. */
  reels: string;
  /** Prints handed to guests on the night. In every collection. */
  prints: string;
  includes: string[];
  bestFor: string;
};

/** The spec every album on this site is built to. Written out so the album is
 *  a described object rather than the word "album" with a price beside it. */
export const ALBUM_SPECS = {
  signature: {
    name: "Signature album",
    size: "10×10 inches",
    pages: "30 pages, 15 lay-flat spreads",
    paper: "medium-weight lustre photographic paper on a rigid lay-flat core",
    cover: "linen or vegan leather, with a blind-debossed date",
    long:
      "A 10×10-inch album, 30 pages across 15 lay-flat spreads, printed on " +
      "medium-weight lustre photographic paper on a rigid core so a picture " +
      "can run across the gutter without breaking. Linen or vegan leather " +
      "cover. I design the sequence and you get two rounds of changes.",
  },
  heirloom: {
    name: "Heirloom album",
    size: "12×12 inches",
    pages: "40 pages, 20 lay-flat spreads",
    paper: "heavy 2 mm lay-flat pages in fine-art matte or heavy photographic stock",
    cover: "full-grain leather, hand-bound",
    long:
      "A 12×12-inch album, 40 pages across 20 lay-flat spreads, on heavy " +
      "2 mm pages in either fine-art matte or heavy photographic stock. " +
      "Full-grain leather cover, hand-bound, in a matching slipcase. It is " +
      "the object the photographs are actually for, and it is built to be " +
      "handled for fifty years rather than to survive a shelf.",
  },
  parent: {
    name: "Parent album",
    size: "8×8 inches",
    pages: "30 pages, 15 spreads",
    paper: "the same photographic stock as the album it copies",
    cover: "linen",
    long:
      "An 8×8-inch duplicate of the album you chose, 30 pages across 15 " +
      "spreads, on the same stock, in linen. Priced per copy, so two sets " +
      "of parents is two of them.",
  },
} as const;

export const TIERS: Tier[] = [
  {
    slug: "core",
    name: "Core",
    strap: "Six hours",
    coverage: "6 continuous hours",
    hours: 6,
    price: 3000,
    crew: "One lead photographer",
    images: "400+ edited images",
    planning: "Timeline review and a family-photo plan",
    preview: "30 images within 48 hours",
    delivery: "Full gallery within 2 weeks",
    album: "Available as an add-on",
    film: "",
    rolls: "",
    reels: "Vertical social reels, cut from the day and sent in the first week",
    prints: "Film prints handed to guests on the night",
    includes: [
      "6 continuous hours, one lead photographer",
      "400+ edited images, high resolution with print permission",
      "Vertical social reels, sent in the first week",
      "Film prints handed to guests on the night",
      "Timeline review and a family-photo plan",
      "30-image preview within 48 hours",
      "Full gallery within 2 weeks",
      "No feature film at this tier, and no album. Both are add-ons",
    ],
    bestFor: "A ceremony and a dinner in one place, with no second venue to chase",
  },
  {
    slug: "signature",
    name: "Signature",
    strap: "Most booked",
    coverage: "8 continuous hours",
    hours: 8,
    price: 4500,
    crew: "One lead photographer",
    images: "600+ edited images",
    planning: "A 90-minute planning call and a family-photo plan",
    preview: "40 images next day",
    delivery: "Full gallery in 3 weeks",
    album: `${ALBUM_SPECS.signature.name} included: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}`,
    film: "A 1-minute feature film, colour graded",
    rolls: "2 rolls of film, processed and scanned",
    reels: "Vertical social reels, cut from the day and sent in the first week",
    prints: "Film prints handed to guests on the night",
    includes: [
      "8 continuous hours, one lead photographer",
      "600+ edited images, high resolution with print permission",
      "A 1-minute feature film, colour graded",
      "2 rolls of film, processed and scanned",
      "Vertical social reels, sent in the first week",
      "Film prints handed to guests on the night",
      `A Signature album: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}, on ${ALBUM_SPECS.signature.paper}`,
      "A 90-minute planning call and a family-photo plan",
      "40-image preview next day",
      "Full gallery in 3 weeks",
    ],
    bestFor: "Most full weddings, and the honest default once there is a getting-ready and a reception",
  },
  {
    slug: "heirloom",
    name: "Heirloom",
    strap: "Ten hours",
    coverage: "10 continuous hours",
    hours: 10,
    price: 5000,
    crew: "One lead photographer",
    images: "800+ edited images",
    planning: "Two planning calls and a location scout",
    preview: "50 images within 24 hours",
    delivery: "Full gallery in 3 weeks",
    album: `${ALBUM_SPECS.heirloom.name} included: ${ALBUM_SPECS.heirloom.size}, ${ALBUM_SPECS.heirloom.pages}`,
    film: "A 3-minute feature film, colour graded",
    rolls: "4 rolls of film, processed and scanned",
    reels: "Vertical social reels, cut from the day and sent in the first week",
    prints: "Film prints handed to guests on the night",
    includes: [
      "10 continuous hours, one lead photographer",
      "800+ edited images, high resolution with print permission",
      "A 3-minute feature film, colour graded",
      "4 rolls of film, processed and scanned",
      "Vertical social reels, sent in the first week",
      "Film prints handed to guests on the night",
      `An Heirloom album: ${ALBUM_SPECS.heirloom.size}, ${ALBUM_SPECS.heirloom.pages}, on ${ALBUM_SPECS.heirloom.paper}, in ${ALBUM_SPECS.heirloom.cover}`,
      "Two planning calls and a location scout",
      "50-image preview within 24 hours",
      "Full gallery in 3 weeks",
    ],
    bestFor: "Long days that start with a getting-ready and end on a dance floor, and any wedding you want an album out of",
  },
];

export const tierBySlug = (slug: string) => TIERS.find((t) => t.slug === slug);
export const CORE = TIERS[0];

/* ── Regions ────────────────────────────────────────────────────────────────
 * Regions no longer carry prices. A collection costs the same figure in every
 * one of them; what changes between them is the travel, and travel is quoted
 * per trip rather than published. `primary` marks the three home markets that
 * get a page of their own.
 */

export type Region = {
  slug: string;
  name: string;
  short: string;
  /** True for one of the three home markets, which get a page of their own. */
  primary?: boolean;
  /** Everywhere this region covers. */
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
    covers: [
      "Montréal", "Vieux-Montréal", "Laval", "the South Shore",
      "the Laurentians", "the Eastern Townships", "Québec City", "Charlevoix",
    ],
    tax: "QST 9.975% plus GST 5%, about 14.975% combined",
    marketRange: "CAD 3,000 to 8,000+ for a full day across the market",
    season: "May to October, peaking June to September, with October foliage",
    bestTier: "Core",
    promise: "Calm, editorial-documentary coverage from a photographer who lives here.",
    travel: "Everything within 100 km of Montréal is inside the price. Québec City and Charlevoix are a drive and a night, quoted before you sign.",
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
    covers: [
      "Toronto", "the GTA", "Mississauga", "Vaughan", "Markham", "Oakville",
      "Hamilton", "Niagara", "Niagara-on-the-Lake", "the 1000 Islands",
    ],
    tax: "13% HST",
    marketRange: "CAD 2,700 to 5,500 for a full day across the GTA",
    season: "May to October, peaking June to September, with October foliage",
    bestTier: "Core or Signature",
    promise: "Cultural fluency, reliable team logistics, and multi-day scope defined in writing.",
    travel: "I come in from Montréal the day before. The train or the drive and the hotel night are quoted on top of the collection, at cost.",
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
    covers: [
      "Vancouver", "North Vancouver", "West Vancouver", "Burnaby", "Richmond",
      "Squamish", "Whistler", "the Sea-to-Sky corridor",
    ],
    tax: "5% GST, plus 7% PST where applicable",
    marketRange: "CAD 5,800 to 7,500 for premium local coverage",
    season: "April to October, peaking June to September, plus a Whistler winter season",
    bestTier: "Signature",
    promise: "Coastal and mountain expertise, with weather and permits handled before the date.",
    travel: "A flight from Montréal, ground transport and two or three nights, quoted as one figure on top of the collection before you sign.",
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
  {
    slug: "whistler",
    name: "Whistler and the Sea-to-Sky",
    short: "Whistler",
    covers: ["Whistler", "Squamish", "Pemberton", "the Sea-to-Sky corridor"],
    tax: "5% GST, plus 7% PST where applicable",
    marketRange: "CAD 5,800 to 7,500 for premium local coverage",
    season: "June to September, plus a December to March winter season",
    bestTier: "Signature",
    promise: "Mountain weddings with the permits, the access and the weather planned in advance.",
    travel: "The same trip as Vancouver, plus the corridor drive. Quoted with the collection, never added afterwards.",
    risk: "Peak-season lodging on the corridor, and cloud that sits on the mountain for days.",
    venues: ["Fairmont Chateau Whistler", "Nita Lake Lodge", "Audain Art Museum", "Sea to Sky Gondola"],
    portraits: ["Green Lake", "Lost Lake", "the alpine above the gondola", "the Squamish valley"],
  },
  {
    slug: "vancouver-island",
    name: "Vancouver Island and Tofino",
    short: "Tofino",
    covers: ["Tofino", "Ucluelet", "Victoria", "the Cowichan Valley", "the Gulf Islands"],
    tax: "5% GST, plus 7% PST where applicable",
    marketRange: "Quoted against the venue and the date",
    season: "June to September, with a storm season worth having from November",
    bestTier: "Heirloom",
    promise: "Coastal weddings, with the ferry and the drive west planned rather than hoped about.",
    travel: "A flight, a ferry and, for Tofino, three more hours of highway. Quoted against your venue before you sign.",
    risk: "Tofino is not a day trip. It wants the ten-hour collection and an extra night on the ground.",
    venues: ["Wickaninnish Inn", "Long Beach Lodge", "Hatley Castle", "Cowichan Valley wineries"],
    portraits: ["Chesterman Beach", "Long Beach", "the rainforest boardwalks", "Victoria's inner harbour"],
  },
  {
    slug: "banff",
    name: "Banff and the Canadian Rockies",
    short: "Banff",
    covers: ["Banff", "Lake Louise", "Moraine Lake", "Canmore", "Kananaskis", "Yoho"],
    tax: "5% GST in Alberta",
    marketRange: "Quoted against the venue and the date",
    season: "June to September for the alpine, December to March for snow",
    bestTier: "Signature or Heirloom",
    promise: "Mountain wedding coverage with the Parks Canada paperwork done before the date.",
    travel: "A flight, a rental car and mountain nights. Quoted against your venue before you sign.",
    risk: "Parks Canada permits, shuttle-only access to Moraine Lake, and July hotel rates.",
    venues: ["Fairmont Banff Springs", "Fairmont Chateau Lake Louise", "The Rimrock", "Buffalo Mountain Lodge", "Emerald Lake Lodge"],
    portraits: ["Moraine Lake", "Lake Louise", "Two Jack Lake", "the Vermilion Lakes", "Bow Valley Parkway"],
  },
  {
    slug: "jasper",
    name: "Jasper and the northern Rockies",
    short: "Jasper",
    covers: ["Jasper", "Maligne Lake", "the Icefields Parkway", "Mount Robson"],
    tax: "5% GST in Alberta",
    marketRange: "Quoted against the venue and the date",
    season: "June to September, and a dark-sky season worth planning for",
    bestTier: "Heirloom",
    promise: "The quieter half of the Rockies, with the long drives counted properly.",
    travel: "A flight into Edmonton or Calgary, then a long drive. Quoted against your venue before you sign.",
    risk: "Distance. Everything in Jasper is further apart than the map suggests.",
    venues: ["Fairmont Jasper Park Lodge", "Pyramid Lake Lodge", "Maligne Lake Chalet"],
    portraits: ["Maligne Lake", "Pyramid Island", "Athabasca Falls", "the Icefields Parkway"],
  },
];

export const regionBySlug = (slug: string) => REGIONS.find((r) => r.slug === slug);

/** The three home markets. They get a page of their own; every other region
 *  is covered and costs the same, it just does not have a hub. */
export const PRIMARY_REGIONS = REGIONS.filter((r) => r.primary);
/** Places with a page of their own that are not one of the three home markets. */
export const QUOTED_REGIONS = REGIONS.filter((r) => !r.primary);

/** Everywhere outside the regions with a page of their own. */
export const OUTER_REGIONS_NOTE =
  "Anywhere else in Canada costs the same as anywhere on this page. Muskoka, " +
  "Prince Edward County, Charlevoix, the Rockies and the coast all buy the " +
  "same collection at the same figure. The only thing that moves is the " +
  "travel, and that is quoted against your venue and your date rather than " +
  "guessed at. Send both and you will have a real number.";

/* ── Travel ─────────────────────────────────────────────────────────────────
 * Quoted, never published as a grid. A July flight to Tofino and an October
 * drive to Québec City are not the same number and pretending otherwise is
 * how a couple ends up surprised. Everything below 100 km is free.
 */

export const TRAVEL = {
  /** Kilometres from Montréal inside which travel costs nothing. */
  freeRadiusKm: 100,
  headline:
    "Travel is quoted, and it is quoted before you sign",
  body:
    "Everything within 100 km of Montréal is inside the collection price. " +
    "Beyond that, travel is billed at what it actually costs me: the flight " +
    "or the drive, the ground transport, and the nights I need to be there " +
    "the day before rather than arriving frayed on the morning. It goes into " +
    "the contract as one figure, agreed in writing, and nothing is added to " +
    "it afterwards.",
  /** Honest scale, not a price list. Every one of these is quoted per trip. */
  scale: [
    { where: "Within 100 km of Montréal", note: "The island, Laval, the South Shore, the near Laurentians", cost: "Included" },
    { where: "Québec, the Townships, eastern Ontario", note: "A drive, sometimes a night either side", cost: "Usually C$200 to C$600" },
    { where: "Toronto and southern Ontario", note: "The train or the drive, plus a hotel night before the day", cost: "Usually C$600 to C$900" },
    { where: "Anywhere that needs a flight", note: "Vancouver, Whistler, Tofino, Banff, the Maritimes: airfare, a car and two or three nights", cost: "Usually C$1,200 to C$2,000" },
  ],
  footnote:
    "These are the ranges the last few years have actually produced, not a " +
    "tariff. Your date, your venue and how far in advance you book all move " +
    "them, which is exactly why I quote the trip instead of publishing a grid.",
} as const;

/** What a collection costs, anywhere in Canada, before tax and travel. */
export const priceOf = (tier: Tier): number => tier.price;

/** Booking terms, identical everywhere. */
export const TERMS = {
  retainer: "30% retainer secures your date",
  balance: "Balance due 30 days before the wedding",
  extraHour: 450,
} as const;

/* ── Add-ons ───────────────────────────────────────────────────────────────*/

export type Addon = { name: string; price: number; note: string; group: string };

export const ADDONS: Addon[] = [
  { group: "Coverage", name: "Extra coverage hour", price: 450, note: "One more hour on the day, editing included." },
  { group: "Coverage", name: "Second photographer, up to 6 hours", price: 1000, note: "A second set of eyes for the getting-ready, or the room while I am with you." },
  { group: "Coverage", name: "Second photographer, up to 10 hours", price: 1500, note: "For a large guest count, two getting-ready locations or split logistics." },
  { group: "Coverage", name: "Additional 2-hour event", price: 900, note: "A tea ceremony, rehearsal or welcome event on another day." },
  { group: "Sessions", name: "Engagement session", price: 700, note: "60 minutes, 50+ edited images. Anywhere within 100 km of Montréal." },
  { group: "Sessions", name: "Destination welcome session", price: 550, note: "45 minutes, when I am already on location. Not a standalone fly-out." },
  { group: "Prints", name: `Signature album, ${ALBUM_SPECS.signature.size}`, price: 1200, note: `${ALBUM_SPECS.signature.pages}, ${ALBUM_SPECS.signature.paper}, ${ALBUM_SPECS.signature.cover}. Included in Signature.` },
  { group: "Prints", name: `Heirloom album, ${ALBUM_SPECS.heirloom.size}`, price: 1800, note: `${ALBUM_SPECS.heirloom.pages}, ${ALBUM_SPECS.heirloom.paper}, ${ALBUM_SPECS.heirloom.cover}. Included in Heirloom.` },
  { group: "Prints", name: "Parent album", price: 550, note: `${ALBUM_SPECS.parent.size}, ${ALBUM_SPECS.parent.pages}, ${ALBUM_SPECS.parent.paper}, ${ALBUM_SPECS.parent.cover}. Priced per copy.` },
  { group: "Film and motion", name: "Two-roll film add-on", price: 300, note: "Two more rolls, processing and scans. No guaranteed frame count." },
  { group: "Film and motion", name: "Dedicated videographer, 8 hours", price: 2000, note: "A dedicated operator, a highlight film, the ceremony and the speeches." },
  { group: "Film and motion", name: "Dedicated videographer, 10 hours", price: 3000, note: "The full day on video. A second video operator is additional." },
  { group: "Film and motion", name: "Drone add-on", price: 350, note: "Aerial stills and clips where it is legal and safe." },
  { group: "Delivery", name: "Seven-day gallery rush", price: 500, note: "Capacity-limited. I will not sell this every week." },
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
      "This is home. Everything within 100 km of Montréal carries no travel at all, so the collection price is the whole price.",
    body: [
      "The work here is documentary and editorial: I photograph what happens rather than staging a version of it, then I direct properly for the twenty minutes of portraits where direction is what you actually want. That distinction matters more in Montréal than anywhere else I work, because the market is full of packages that promise a number of images and say nothing about how the day will feel.",
      "Living here is the whole difference. I have already made the mistakes: I know which side of Place d'Armes is lit at five in July and which at five in October, that the Plateau photographs best in falling snow, and which venues lose the light an hour earlier than the couple expects. That is not something a photographer flying in can have, and it is why Montréal is the only market where I charge no travel at all.",
      "A collection costs the same here as it costs anywhere in Canada: Core is C$3,000 for six hours, Signature is C$4,500 for eight, Heirloom is C$5,000 for ten. Old Montréal, the Plateau, Mont-Royal, the island, Laval and the South Shore all sit inside the 100 km radius, which means no travel line at all. The Laurentians, the Eastern Townships, Québec City and Charlevoix are past it, so the drive and the night get quoted as one agreed figure before you sign.",
    ],
    faqs: [
      {
        q: "Do you speak French?",
        a: "No. I work in English, and I want to be straightforward about that rather than let you find out on the day. In practice it has not been a problem: your planner, your venue and your officiant handle the French side of the day, and photography direction is mostly gesture and a handful of words. If a fully French-language photographer matters to you, say so and I will point you at someone rather than talk you out of it.",
      },
      {
        q: "What exactly does the 75 km radius include?",
        a: "Anywhere. The collection costs the same wherever the day happens: C$3,000 for Core. Within 100 km of Montréal, which covers the island, Laval, the South Shore and the near Laurentians, there is no travel line at all. The Townships, Québec City and Charlevoix are a drive and usually a night, quoted as one agreed figure before you commit rather than calculated after.",
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
      "The collection costs what it costs anywhere: Core C$3,000, Signature C$4,500, Heirloom C$5,000. Coming in from Montréal adds the train or the drive and a hotel night, and that is quoted as one figure on top, agreed in writing before you sign. It has typically run C$600 to C$900. Niagara, Niagara-on-the-Lake, the 1000 Islands, Muskoka and Prince Edward County all buy the same collections at the same figures, with their own travel quoted the same way.",
    ],
    faqs: [
      {
        q: "How do you price a three-day South Asian wedding?",
        a: "By event, not by package. I need the number of days, the venues, the distance between them, whether any two events run the same day, and how many people are in each room. That decides crew, travel and editing volume, which is where the cost actually lives. You get one quote with the whole thing itemised, and the additional-event add-on is C$900 for a two-hour event.",
      },
      {
        q: "You are based in Montréal. Is that a problem?",
        a: "It is what the travel figure is for, and it is what that figure buys: I arrive the day before, rested, having walked your venue in daylight. A Toronto photographer who lives twenty minutes away charges nothing for travel and frequently does neither.",
      },
      {
        q: "How far outside the GTA do you go?",
        a: "The same. Niagara, Niagara-on-the-Lake, the 1000 Islands, Muskoka and Prince Edward County all buy the same collection at the same figure as a downtown Saturday. Only the travel differs, and it is quoted against your actual venue rather than printed as a number I have not costed.",
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
      "Sea-to-Sky is a different job. Whistler and Squamish need travel time counted properly, and anything on Crown land or in a provincial park needs its permit sorted well before the date. The photography costs the same as it does in Montréal, Core C$3,000 and Signature C$4,500, whether the day happens in Kitsilano, in Squamish or up at Whistler. What the coast adds is the trip itself, the flight, the car and two or three nights, quoted as one figure before you sign. It has typically run C$1,200 to C$2,000.",
      "Premium local photography in this market runs roughly C$5,800 to C$7,500 for a full day, and multi-service mountain packages start around C$8,500 once vendors are bundled in. If that bundled day is what you want, I will tell you honestly what it costs to build. If you want the photography, Signature is C$4,500 and the trip out is quoted on top, in writing, before you sign.",
    ],
    faqs: [
      {
        q: "What happens if it rains?",
        a: "We shoot. Every timeline I build names a specific covered location that I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery, but only when the backup was decided in advance rather than in a parking lot.",
      },
      {
        q: "Do you cover Vancouver Island and Tofino?",
        a: "Yes. The collection costs the same there as everywhere, C$3,000 for Core and C$4,500 for Signature. The Island adds a ferry and Tofino adds three hours of highway beyond the flight, which is a genuinely different trip, so the travel is quoted against your actual venue and date. What I will not do is pretend Tofino is a day trip: it wants ten hours and an extra night on the ground.",
      },
      {
        q: "Are permits really necessary?",
        a: "For a ceremony in a provincial park or on Crown land, yes, and they are slow. I arrange them before the date rather than hoping nobody asks. Helicopter access, transport and vendors are quoted as separate lines so you can see each one and decline any of them.",
      },
    ],
  },
  {
    slug: "whistler",
    city: "Whistler",
    name: "Whistler",
    province: "British Columbia",
    region: "Whistler, Squamish and the Sea-to-Sky corridor",
    regionSlug: "whistler",
    areas: ["Whistler", "Squamish", "Pemberton", "Creekside", "Blackcomb", "Green Lake", "Lost Lake"],
    angle: "Mountain weddings at the same collection price as a Saturday in the city",
    lede:
      "Ninety minutes north of Vancouver and inside the same number. The corridor is a logistics problem before it is an aesthetic one, and the logistics are the part you are actually paying me for.",
    body: [
      "There are three Whistler weddings and they are not interchangeable. A village wedding happens at a hotel or a restaurant with everything walkable, which is the easiest version and the one that survives bad weather. An alpine wedding puts the ceremony at the top of a lift, which is the most spectacular and the most exposed to cloud. A lake wedding at Green Lake or Lost Lake sits between the two: outdoors, reachable by road, and low enough to stay under the weather most days.",
      "A wedding at the Chateau costs exactly what a wedding in Kitsilano costs, and what one in Old Montréal costs: Core C$3,000, Signature C$4,500, Heirloom C$5,000. The mountain does not make the photography more expensive. What it adds is the trip, the flight, the car and the nights up the corridor, quoted as one agreed figure on top before you sign.",
      "What the corridor asks for is honesty about time. Lifts close, they hold for wind on days that look fine from the valley, and they move a wedding party far more slowly than anyone plans for. Every Whistler timeline I build names a valley-level ceremony site we switch to if the lift is held. That single line is the difference between a day that works and an afternoon spent waiting.",
    ],
    faqs: [
      {
        q: "Is Whistler more expensive than Vancouver?",
        a: "Not for the photography. Whistler, Squamish and Pemberton buy the same collections at the same figures as anywhere else: C$3,000, C$4,500 and C$5,000. What the corridor adds is the trip, and that is quoted with the collection rather than sprung on you afterwards.",
      },
      {
        q: "What happens if the gondola is closed on the day?",
        a: "We move to the site we already named. Lifts hold for wind on mornings that look perfectly fine from the valley, so every corridor timeline I build has a valley-level ceremony location in it from the start. It is not a fallback invented on the morning, it is the second half of the plan.",
      },
      {
        q: "Can we get married here in winter?",
        a: "Yes, and February is genuinely underrated. Real snow, blue hour arriving at four, and a completely different day from the summer version. It works if you actually want winter rather than tolerating it, and if the wedding party owns proper boots.",
      },
    ],
  },
  {
    slug: "tofino",
    city: "Tofino",
    name: "Tofino and Vancouver Island",
    province: "British Columbia",
    region: "Tofino, Ucluelet, Victoria and Vancouver Island",
    regionSlug: "vancouver-island",
    areas: ["Tofino", "Ucluelet", "Victoria", "the Cowichan Valley", "the Gulf Islands", "Nanaimo"],
    angle: "The open Pacific, and a journey planned rather than assumed",
    lede:
      "A ferry, then a drive, then for Tofino three more hours of highway across the middle of the island. The travel is the thing that shapes the wedding, so it gets planned first rather than discovered.",
    body: [
      "The island splits into four propositions. Victoria gives you heritage architecture, formal gardens and an inner harbour, and it is the easiest to run because everything is close and there are beds. The Cowichan Valley, an hour north, is farmland and wineries and reads far warmer than the coast. Tofino and Ucluelet are the dramatic version: open Pacific, storm cloud, and beaches that go on for kilometres. The Gulf Islands are the private version, at the cost of a second ferry and a guest list capped by what the island can sleep.",
      "Most couples arrive attached to Tofino and, once they have counted the drive against their guest list, end up somewhere else on the island. That is a good outcome rather than a compromise, and it is worth having the conversation early rather than after a deposit.",
      "This is the one stretch of coast I quote rather than publish. A ferry crossing and three more hours of mountain highway are a genuinely different trip from a Kitsilano Saturday, and one averaged figure would be wrong for Victoria and wrong for Tofino in opposite directions. Send the venue and the date and you get a real number before you commit to anything.",
    ],
    faqs: [
      {
        q: "Why is the island quoted rather than published?",
        a: "Because a Victoria wedding and a Tofino wedding are not the same journey. Victoria is a ferry and a short drive. Tofino adds three hours of mountain highway and at least one more night. Publishing a single number would overcharge half the island and undercharge the other half, so I price it against your actual venue.",
      },
      {
        q: "Is storm season a real idea or a marketing one?",
        a: "It is real, and November on the west coast is the best value date in British Columbia. Low cloud, spray, wet sand that mirrors everything, and a beach with nobody on it. You will be cold, the light goes by half past four, and the gallery will not look like anybody else's.",
      },
      {
        q: "Which collection do you recommend out here?",
        a: "Heirloom, and I would say so even if it were the cheaper option. The travel has already turned your wedding into a two-day event for everyone attending, there is always a Friday, and the Friday evening light on that coast is frequently better than anything Saturday produces.",
      },
    ],
  },
  {
    slug: "banff",
    city: "Banff",
    name: "Banff and the Rockies",
    province: "Alberta",
    region: "Banff, Lake Louise, Moraine Lake and Canmore",
    regionSlug: "banff",
    areas: ["Banff", "Lake Louise", "Moraine Lake", "Canmore", "Kananaskis", "Yoho", "Emerald Lake"],
    angle: "The most photographed mountains in Canada, and the paperwork nobody mentions",
    lede:
      "Everything you have seen of the Rockies sits inside forty minutes of driving. What decides whether your day works is permits, shuttles, and what time you are willing to get up.",
    body: [
      "Banff is the easiest landscape in Canada to photograph and one of the harder places to run a wedding in, and both facts have the same cause: everybody else wants to be there too. Moraine Lake is shuttle access only, private vehicles are not getting you or your guests to that shoreline, and the good hour at Lake Louise is the one before the coaches arrive. A photographer who has not worked there finds this out on your morning.",
      "A ceremony on Parks Canada land needs a permit, and the process is slow, seasonal and capped by site. It is the single most common reason a Rockies plan falls apart in the final month. I arrange it rather than hoping nobody asks, which means I need your site months out rather than weeks.",
      "What you get in return is scale nothing else in the country matches. Glacier-fed water that reads turquoise without a slider being moved, larches turning gold for two weeks in late September, and mountains close enough to fill the frame behind two people standing still. Put a wedding party in front of them and they do not get any smaller.",
    ],
    faqs: [
      {
        q: "What does a Banff wedding cost to photograph?",
        a: "The photography is published and it is the same as everywhere: C$3,000 for Core, C$4,500 for Signature, C$5,000 for Heirloom. The travel is quoted, because a Canmore Saturday and a Moraine Lake sunrise are different jobs with different access. A Rockies trip has typically run C$1,200 to C$2,000 once the flight, the car and the mountain nights are counted. Send the venue and the date and you get the real figure in the first reply.",
      },
      {
        q: "Do we really need a permit?",
        a: "For a ceremony on Parks Canada land, yes, and it is not a formality. Sites are capped, seasons are limited and the paperwork is slow. Arrange it early, or choose a private venue that carries its own permissions, such as the Springs or Emerald Lake Lodge.",
      },
      {
        q: "Is Moraine Lake still worth it with the shuttle?",
        a: "For two people and a photographer, absolutely. For a wedding party of twelve it is a logistical fight you will not enjoy. The honest answer for most weddings is a private venue for the ceremony and a sunrise trip to Moraine the next morning with just the two of you.",
      },
    ],
  },
  {
    slug: "jasper",
    city: "Jasper",
    name: "Jasper",
    province: "Alberta",
    region: "Jasper, Maligne Lake and the Icefields Parkway",
    regionSlug: "jasper",
    areas: ["Jasper", "Maligne Lake", "Pyramid Lake", "Athabasca Falls", "the Icefields Parkway", "Mount Robson"],
    angle: "The quieter half of the Rockies, and the darkest sky in the country",
    lede:
      "Three hours north of Banff and a different proposition entirely: fewer people, longer drives, and a designated dark-sky preserve overhead once the sun has gone.",
    body: [
      "Jasper is what Banff was before everybody found it. The same glacial water and the same scale with a fraction of the traffic, and that is the whole argument for making the longer journey. Maligne Lake, Pyramid Island and Athabasca Falls are genuinely quiet on a weekday morning in a way nothing in Banff has been for a decade.",
      "The cost is distance, and it is not a small one. Everything in Jasper is further apart than the map suggests, and the Icefields Parkway between the two parks is three hours of driving with no shortcuts and, for long stretches, no signal. A timeline built on Banff assumptions does not survive up here. Guests need telling plainly how far it is before they book flights.",
      "Jasper is a designated dark-sky preserve, which is a real photographic product rather than a brochure line. On a clear moonless night the Milky Way is visible to the naked eye from the lakeshore, and a portrait under it is something almost no Canadian wedding gallery contains. It needs a clear forecast, a moon phase checked months ahead, and about forty minutes of everybody's patience.",
    ],
    faqs: [
      {
        q: "Is Jasper worth the extra drive over Banff?",
        a: "If quiet matters to you, yes. You get the same water and the same mountains with a fraction of the crowd, and Maligne Lake on a weekday morning is a completely different experience from Lake Louise at any hour. If your guests are flying in from far away and you want to minimise driving, Banff is the kinder choice.",
      },
      {
        q: "Can you actually photograph the night sky at a wedding?",
        a: "Yes, and Jasper is one of very few places in Canada where it is reliably possible. It needs a clear forecast, a moon phase I check months out, and roughly forty minutes late in the evening. I will tell you honestly in the week beforehand whether it is on, rather than promising it in a brochure.",
      },
      {
        q: "What does a Jasper wedding cost?",
        a: "Quoted against your venue and date rather than published, because the drive and the accommodation vary enormously depending on where in the park you are. Send both and you will have a real number in the first reply rather than the third.",
      },
    ],
  },
];

export const marketBySlug = (slug: string) => MARKETS.find((m) => m.slug === slug);

/** The three home markets. /pricing and the home page link these; the nav
 *  and the hubs use all of MARKETS. */
export const CORE_MARKETS = MARKETS.filter((m) =>
  ["montreal", "toronto", "vancouver"].includes(m.slug),
);

/** The lowest collection price on the site. The same figure in every city. */
export const STARTING_FROM = CORE.price;
