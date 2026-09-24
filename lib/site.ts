/* Brand facts, the price ladder, and the regions, in one place.
 *
 * armanarai.ca is the WEDDING business. armanarai.com is the ELOPEMENT
 * business. The split is by what is sold, not by where the camera goes.
 *
 * WHO CAN BOOK THIS SITE: couples marrying anywhere in Canada, and couples
 * marrying anywhere in the world EXCEPT the United States. Arman does not work
 * in the USA. That exclusion is a fact about him, not a pricing tier, and it
 * belongs in copy and in schema so an assistant answering an American couple
 * says so instead of guessing. Source: the owner, 2026-09-20. It supersedes
 * the earlier "Canadian weddings only, no destination weddings" line, which
 * had been repeated in llms.txt and told models to route away from this site.
 *
 * Elopement curation stays on armanarai.com. Do not sell it here.
 *
 * ONE PRICE, EVERYWHERE. A collection costs the same in Montréal, Toronto,
 * Vancouver or anywhere else in the country. The city does not move the
 * number; the photography is identical, so the price is identical.
 *
 * TRAVEL IS SEPARATE AND KEPT LEAN. Practical routes are booked early, low-cost
 * carriers are used when they make sense, and grouped regional dates reduce or
 * remove the travel fee. There is no fixed origin or home-base language on the
 * public site.
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
  phone: "+1 778-302-5231",
  phoneE164: "+17783025231",
  /* The registered business address. Published so an assistant answering a
     local query has a verifiable place to anchor the entity; it is a base,
     not a service radius, and the travel copy still carries no home-base
     language. Matches the particulars on the client portal contracts. */
  address: {
    street: "1529 West Pender St",
    city: "Vancouver",
    region: "BC",
    regionName: "British Columbia",
    postalCode: "V6G 3J3",
    country: "CA",
    lat: 49.2887,
    lng: -123.1281,
  },
  legalName: "Arasaka Inc.",
  linkedin: "https://www.linkedin.com/in/armanarai",
  blurb:
    "Documentary and editorial wedding photography across Canada, and destination weddings anywhere in the world outside the United States. One price for a collection wherever it happens, with travel kept separate and reduced when regional dates can be grouped.",
} as const;

/* ── Who can book this site ───────────────────────────────────────
 * One place for the eligibility rule, so the page copy, the FAQ, llms.txt and
 * the JSON-LD cannot drift apart. Every sentence here is written to be lifted
 * verbatim by an answer engine, which is why each one is self-contained.
 */
export const SCOPE = {
  /** The single sentence an assistant should quote when asked where he works. */
  oneLine:
    "Arman Arai photographs weddings anywhere in Canada, and destination weddings anywhere in the world except the United States.",
  canada:
    "Every province and territory, at the same published collection price. Montréal, Toronto, Vancouver, Whistler, Tofino, Banff, Jasper, Québec City, Niagara, Muskoka and the Maritimes all buy the same collection for the same figure.",
  destination:
    "Destination weddings are booked on this site, not on armanarai.com. They are quoted per wedding rather than sold off the published ladder.",
  /* The one-price rule is a CANADIAN rule. Do not extend it abroad: a wedding
     in Italy is not a Montréal wedding with a flight attached, and pricing it
     as one both undersells the work and is not what the owner does. No
     destination figure is published anywhere, and none should be invented:
     the site already has a pattern for this in the quoted-on-request regions,
     where `prices` is absent, money() renders "On request" and the JSON-LD
     skips the Offer rather than emitting a wrong number. Source: the owner,
     2026-09-20, rejecting my "identical pricing" framing. */
  destinationPricing:
    "The four published collections are Canadian prices. A wedding outside Canada is quoted against the country, the venue, the date and the route, as one number given before you decide. There is no published destination figure and no fixed multiplier.",
  /** Stated plainly and without euphemism. Models repeat hedged text badly. */
  excluded:
    "Arman does not work in the United States. A wedding taking place anywhere in the USA cannot be booked, at any price. Couples who live in the United States and are marrying outside it are welcome.",
  excludedShort: "No weddings in the United States.",
  /** Places named so a retrieval system has concrete entities to match on. */
  destinationExamples: [
    "Mexico", "Italy", "France", "Portugal", "Spain", "Greece", "the United Kingdom",
    "Ireland", "Colombia", "Costa Rica", "Japan", "Morocco", "the UAE",
  ],
  /** Kept separate from the marketing copy: this is the legal/travel reality. */
  notes: [
    "Prices on this site are in Canadian dollars for every wedding, Canadian or destination.",
    "The legal marriage itself is yours to arrange with the local authority. Arman photographs the day; he does not file paperwork or act as an officiant.",
    "Destination dates are held the same way Canadian dates are: a free 48-hour hold, then a contract and a 30% retainer.",
  ],
} as const;

/* ── The ladder ─────────────────────────────────────────────────────────────
 * Four collections. `price` is the whole price of the collection anywhere in
 * Canada. Travel is handled separately and kept lean; see TRAVEL.
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
  /** The pre-wedding session, where the collection carries one. */
  engagement: string;
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
    slug: "essential",
    name: "Essential",
    strap: "Six hours",
    coverage: "6 continuous hours",
    hours: 6,
    price: 2000,
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
    engagement: "",
    includes: [
      "6 continuous hours, one lead photographer",
      "400+ edited images, high resolution with print permission",
      "Vertical social reels, sent in the first week",
      "Film prints handed to guests on the night",
      "Timeline review and a family-photo plan",
      "30-image preview within 48 hours",
      "Full gallery within 2 weeks",
      "No engagement session and no feature film at this tier. The album is an add-on",
    ],
    bestFor: "A ceremony and a dinner in one place, with no second venue to chase",
  },
  {
    slug: "signature",
    name: "Signature",
    strap: "Most booked",
    coverage: "8 continuous hours",
    hours: 8,
    price: 3000,
    crew: "One lead photographer",
    images: "600+ edited images",
    planning: "A 90-minute planning call and a family-photo plan",
    preview: "40 images next day",
    delivery: "Full gallery in 3 weeks",
    album: "Available as an add-on",
    film: "A 1-minute feature film, colour graded",
    rolls: "2 rolls of film, processed and scanned",
    reels: "Vertical social reels, cut from the day and sent in the first week",
    prints: "Film prints handed to guests on the night",
    engagement: "A 60-minute engagement session",
    includes: [
      "8 continuous hours, one lead photographer",
      "600+ edited images, high resolution with print permission",
      "A 60-minute engagement session",
      "A 1-minute feature film, colour graded",
      "2 rolls of film, processed and scanned",
      "Vertical social reels, sent in the first week",
      "Film prints handed to guests on the night",
      "A 90-minute planning call and a family-photo plan",
      "40-image preview next day",
      "Full gallery in 3 weeks",
    ],
    bestFor: "Most full weddings, and the honest default once there is a getting-ready and a reception",
  },
  {
    slug: "complete",
    name: "Complete",
    strap: "Ten hours",
    coverage: "10 continuous hours",
    hours: 10,
    price: 4200,
    crew: "One lead photographer, plus a second photographer for 4 hours",
    images: "800+ edited images",
    planning: "Two planning calls and a location scout",
    preview: "50 images within 24 hours",
    delivery: "Full gallery in 3 weeks",
    album: `${ALBUM_SPECS.signature.name} included: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}`,
    film: "A 3-minute feature film, colour graded",
    rolls: "4 rolls of film, processed and scanned",
    reels: "Vertical social reels, cut from the day and sent in the first week",
    prints: "Film prints handed to guests on the night",
    engagement: "A 60-minute engagement session",
    includes: [
      "10 continuous hours, one lead photographer",
      "A second photographer for 4 hours, placed where two angles actually matter",
      "800+ edited images, high resolution with print permission",
      "A 60-minute engagement session",
      "A 3-minute feature film, colour graded",
      "4 rolls of film, processed and scanned",
      "Vertical social reels, sent in the first week",
      "Film prints handed to guests on the night",
      `A Signature album: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}, on ${ALBUM_SPECS.signature.paper}`,
      "Two planning calls and a location scout",
      "50-image preview within 24 hours",
      "Full gallery in 3 weeks",
    ],
    bestFor: "Long days that start with a getting-ready and end on a dance floor, and any wedding where two rooms need covering at once",
  },
  {
    slug: "photo-film",
    name: "Photo + Film",
    strap: "Photography and film",
    coverage: "8 continuous hours, photography and film",
    hours: 8,
    price: 5900,
    crew: "One lead photographer and a dedicated filmmaker, both for 8 hours",
    images: "600+ edited images",
    planning: "Two planning calls, including the audio and ceremony plan the film needs",
    preview: "40 images next day",
    delivery: "Full gallery in 3 weeks, and the film in 10 weeks",
    album: `${ALBUM_SPECS.signature.name} included: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}`,
    film: "A 3 to 5 minute highlight film shot by a dedicated filmmaker, colour graded, with licensed music",
    rolls: "4 rolls of film, processed and scanned",
    reels: "Vertical social reels, cut from the day and sent in the first week",
    prints: "Film prints handed to guests on the night",
    engagement: "A 60-minute engagement session",
    includes: [
      "8 continuous hours of photography, one lead photographer",
      "8 hours with a dedicated filmmaker, not a camera pointed at the same thing",
      "A 3 to 5 minute highlight film, colour graded, with licensed music",
      "Your vows or speeches in the film wherever the audio comes back clean",
      "One consolidated round of minor film revisions",
      "600+ edited images, high resolution with print permission",
      "A 60-minute engagement session",
      "4 rolls of film, processed and scanned",
      "Vertical social reels, sent in the first week",
      "Film prints handed to guests on the night",
      `A Signature album: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}, on ${ALBUM_SPECS.signature.paper}`,
      "Full gallery in 3 weeks, the film in 10",
    ],
    bestFor: "A day you want to hear as well as see, with a ceremony and speeches worth recording properly",
  },
];

export const tierBySlug = (slug: string) => TIERS.find((t) => t.slug === slug);
export const ENTRY = TIERS[0];

/* ── Regions ────────────────────────────────────────────────────────────────
 * Regions no longer carry prices. A collection costs the same figure in every
 * one of them; what changes between them is the travel, and travel is quoted
 * per trip rather than published. `primary` marks the three featured markets that
 * get a page of their own.
 */

export type Region = {
  slug: string;
  name: string;
  short: string;
  /** True for one of the three featured markets, which get a page of their own. */
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
    bestTier: "Essential",
    promise: "Calm, editorial-documentary coverage with detailed knowledge of Montréal and Québec.",
    travel: "Travel is kept to the route the date actually requires and reduced or waived when regional dates can be grouped.",
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
    bestTier: "Signature",
    promise: "Cultural fluency, reliable team logistics, and multi-day scope defined in writing.",
    travel: "Early-booked low-cost air or rail, ground transport and only the nights the schedule requires.",
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
    travel: "Early-booked low-cost air, ground transport and only the nights the schedule requires.",
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
    bestTier: "Complete",
    promise: "Coastal weddings, with the ferry and the drive west planned rather than hoped about.",
    travel: "Early-booked low-cost air, the ferry and only the road time the venue requires. Grouped regional dates can reduce or remove the travel fee.",
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
    bestTier: "Complete",
    promise: "Mountain wedding coverage with the Parks Canada paperwork done before the date.",
    travel: "Early-booked low-cost air, a practical rental car and only the mountain nights the schedule requires.",
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
    bestTier: "Complete",
    promise: "The quieter half of the Rockies, with the long drives counted properly.",
    travel: "Early-booked low-cost air into Edmonton or Calgary, then the most practical ground route for the date.",
    risk: "Distance. Everything in Jasper is further apart than the map suggests.",
    venues: ["Fairmont Jasper Park Lodge", "Pyramid Lake Lodge", "Maligne Lake Chalet"],
    portraits: ["Maligne Lake", "Pyramid Island", "Athabasca Falls", "the Icefields Parkway"],
  },
];

export const regionBySlug = (slug: string) => REGIONS.find((r) => r.slug === slug);

/** The three featured markets. They get a page of their own; every other region
 *  is covered and costs the same, it just does not have a hub. */
export const PRIMARY_REGIONS = REGIONS.filter((r) => r.primary);
/** Places with a page of their own that are not one of the three featured markets. */
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
 * how a couple ends up surprised. Regional scheduling can reduce the fee.
 */

export const TRAVEL = {
  headline: "Travel kept lean",
  body:
    "I book practical routes early, often using low-cost carriers, and keep the " +
    "trip to the transportation, ground travel and nights the schedule actually " +
    "requires. There is no inflated destination surcharge.",
  availabilityNote:
    "Collection prices remain the same across Canada. Travel is quoted separately. " +
    "When Arman is already scheduled in your region, the travel fee is reduced or waived.",
  /** Honest scale, not a price list. Every one of these is quoted per trip. */
  scale: [
    { where: "Already scheduled in your region", note: "I group nearby dates so the same trip can serve more than one wedding", cost: "Reduced or waived" },
    { where: "Major Canadian cities", note: "Low-cost air or rail, booked early, plus only the ground transport and nights the schedule needs", cost: "Lowest practical route" },
    { where: "Coast, mountains and remote routes", note: "Built around the actual itinerary, with shared travel whenever dates can be grouped", cost: "Quoted to the route" },
  ],
  footnote:
    "No blanket cross-country rate. Send the venue and date and I will use the " +
    "leanest practical route; if another wedding already covers the trip, your " +
    "travel fee comes down or disappears.",
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

/* `priceMax` is set only where the honest answer is a range rather than a
   figure, which so far is the framed print, where the size and the frame move
   the number. Everything else stays a single number on purpose. */
export type Addon = { name: string; price: number; priceMax?: number; note: string; group: string };

export const ADDONS: Addon[] = [
  { group: "Coverage", name: "Extra coverage hour", price: 400, note: "One more hour on the day, editing included. Booked in advance and continuous with the collection." },
  { group: "Coverage", name: "Second photographer, 4 hours", price: 800, note: "Four hours is the minimum. Placed where two angles genuinely matter rather than spread thin across the day. Included in Complete." },
  { group: "Coverage", name: "Extra second-photographer hour", price: 175, note: "Added on top of the four-hour minimum." },
  { group: "Coverage", name: "Rehearsal dinner or welcome event", price: 1000, note: "Up to 3 hours on another day. A tea ceremony, a mehndi or a rehearsal dinner." },
  { group: "Sessions", name: "Engagement session", price: 450, note: "60 minutes, 50+ edited images. Included in Signature and above. Travel is separate only when the session requires its own trip." },
  { group: "Sessions", name: "Destination welcome session", price: 550, note: "45 minutes, when I am already on location. Not a standalone fly-out." },
  { group: "Sessions", name: "Anniversary session", price: 400, note: "60 minutes, 40+ edited images, bookable any time in the twelve months after the wedding. The same two people, a year of marriage later." },
  { group: "Prints", name: `Signature album, ${ALBUM_SPECS.signature.size}`, price: 1200, note: `${ALBUM_SPECS.signature.pages}, ${ALBUM_SPECS.signature.paper}, ${ALBUM_SPECS.signature.cover}. Included in Complete and Photo + Film.` },
  { group: "Prints", name: `Heirloom album, ${ALBUM_SPECS.heirloom.size}`, price: 1800, note: `${ALBUM_SPECS.heirloom.pages}, ${ALBUM_SPECS.heirloom.paper}, ${ALBUM_SPECS.heirloom.cover}. The upgrade from the Signature album.` },
  { group: "Prints", name: "Parent album", price: 550, note: `${ALBUM_SPECS.parent.size}, ${ALBUM_SPECS.parent.pages}, ${ALBUM_SPECS.parent.paper}, ${ALBUM_SPECS.parent.cover}. Priced per copy.` },
  { group: "Prints", name: "Fine-art print box", price: 400, note: "20 to 30 archival prints at 5×7 or 6×8 inches in a covered clamshell box, sequenced but loose, so they can be handed around a table. For the people who want the photographs in hand without an album." },
  { group: "Prints", name: "Large framed fine-art print", price: 300, priceMax: 900, note: "One frame printed large, matted and framed, priced by size and frame. Chosen from the finished gallery rather than guessed at before the wedding." },
  { group: "Film and motion", name: "Dedicated filmmaker, 8 hours", price: 2900, note: "A dedicated filmmaker and a 3 to 5 minute highlight film, added to any collection. This is what Photo + Film already carries." },
  { group: "Film and motion", name: "Extra filmmaking hour", price: 250, note: "Booked in advance, alongside the filmmaker's eight." },
  { group: "Film and motion", name: "Full ceremony and speeches films", price: 650, note: "The whole ceremony and the whole speeches, edited long. Needs a multi-camera and audio plan confirmed in advance." },
  { group: "Film and motion", name: "One more roll of film", price: 175, note: "A single extra roll, processing and scans included. No guaranteed frame count." },
  { group: "Film and motion", name: "Two-roll film add-on", price: 300, note: "Two more rolls, processing and scans. No guaranteed frame count." },
  { group: "Film and motion", name: "Film Story, four rolls", price: 500, note: "Four more rolls carried through the whole day rather than saved for the portraits, processed and scanned. The cheapest roll on this list, because shooting film properly means shooting more of it." },
  { group: "Film and motion", name: "Drone add-on", price: 350, note: "Aerial stills and clips where it is legal and safe. Weather, venue rules and airspace can all cancel it on the day." },
  { group: "Delivery", name: "Seven-day gallery rush", price: 750, note: "Capacity-limited. I will not sell this every week." },
];

/* Priced against the actual job rather than published, because the honest
   number depends on the brief. Shown on /pricing beside the fixed add-ons so
   the list is complete rather than quietly short. */
export const QUOTED_ADDONS = [
  { name: "Extensive retouching", note: "Beyond the standard colour work and the temporary-blemish cleanup that every collection already includes." },
  { name: "A content creator, or a run of social edits", note: "A separate person on the day and a defined list of deliverables. Ten short-form edits is a production, not a bonus, and pretending otherwise is how it gets done badly." },
] as const;

export const ADDON_GROUPS = [...new Set(ADDONS.map((a) => a.group))];

/* ── The three featured markets ─────────────────────────────────────────────
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
  /**
   * An extra search term for the <title>, where one is genuinely distinct from
   * the city name. Left unset almost everywhere on purpose: the titles used to
   * append the full `region` string and ran to 102 characters, so Google cut
   * them off mid-list and the snippet sold nothing. The sub-regions still live
   * in the description, the headings and the body, which is what actually
   * ranks for them.
   */
  titleQualifier?: string;
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
    angle: "Documentary coverage with detailed knowledge of Montréal and Québec",
    lede:
      "Montréal rewards local knowledge: which streets hold their light, which rooms lose it early and which weather plan actually works.",
    body: [
      "The work here is documentary and editorial: I photograph what happens rather than staging a version of it, then I direct properly for the twenty minutes of portraits where direction is what you actually want. That distinction matters more in Montréal than anywhere else I work, because the market is full of packages that promise a number of images and say nothing about how the day will feel.",
      "I have already made the mistakes: I know which side of Place d'Armes is lit at five in July and which at five in October, that the Plateau photographs best in falling snow, and which venues lose the light an hour earlier than the couple expects.",
      "A collection costs the same here as it costs anywhere in Canada: Essential is C$2,000 for six hours, Signature is C$3,000 for eight with an engagement session, Complete is C$4,200 for ten with a second photographer, and Photo + Film is C$5,900 with a dedicated filmmaker. Travel is kept separate, booked early and reduced or waived when I am already scheduled in the region.",
    ],
    faqs: [
      {
        q: "Do you speak French?",
        a: "No. I work in English, and I want to be straightforward about that rather than let you find out on the day. In practice it has not been a problem: your planner, your venue and your officiant handle the French side of the day, and photography direction is mostly gesture and a handful of words. If a fully French-language photographer matters to you, say so and I will point you at someone rather than talk you out of it.",
      },
      {
        q: "How is travel handled around Québec?",
        a: "The collection costs the same wherever the day happens: C$2,000 for Essential, C$3,000 for Signature. Travel is based only on the route the date requires, and it is reduced or waived when I am already scheduled in the region.",
      },
      {
        q: "We are having a civil ceremony with a notaire. Is that too small?",
        a: "No, and it does not get a lesser version of the work. Essential covers a notaire ceremony, portraits and a long dinner comfortably. If your day is genuinely shorter than eight hours, say so and I will scope it down rather than sell you hours you will not use.",
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
      "The collection costs what it costs anywhere: Essential C$2,000, Signature C$3,000, Complete C$4,200, Photo + Film C$5,900. Travel uses the lowest practical early-booked route and is reduced or waived when I am already scheduled nearby. Niagara, the 1000 Islands, Muskoka and Prince Edward County all buy the same collections at the same figures.",
    ],
    faqs: [
      {
        q: "How do you price a three-day South Asian wedding?",
        a: "By event, not by package. I need the number of days, the venues, the distance between them, whether any two events run the same day, and how many people are in each room. That decides crew, travel and editing volume, which is where the cost actually lives. You get one quote with the whole thing itemised, and a rehearsal dinner or welcome event of up to three hours is C$1,000.",
      },
      {
        q: "How do you keep Toronto travel affordable?",
        a: "I book practical air or rail routes early and group nearby dates whenever possible. If I am already scheduled in the region, the travel fee is reduced or waived.",
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
      "Sea-to-Sky is a different job. Whistler and Squamish need travel time counted properly, and anything on Crown land or in a provincial park needs its permit sorted well before the date. The photography costs the same as it does anywhere else: Essential C$2,000 and Signature C$3,000. Travel is kept lean with early-booked low-cost routes and grouped regional dates.",
      "Premium local photography in this market runs roughly C$5,800 to C$7,500 for a full day, and multi-service mountain packages start around C$8,500 once vendors are bundled in. If that bundled day is what you want, I will tell you honestly what it costs to build. If you want the photography, Signature is C$3,000 and travel stays separate.",
    ],
    faqs: [
      {
        q: "What happens if it rains?",
        a: "We shoot. Every timeline I build names a specific covered location that I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery, but only when the backup was decided in advance rather than in a parking lot.",
      },
      {
        q: "Do you cover Vancouver Island and Tofino?",
        a: "Yes. The collection costs the same there as everywhere, C$2,000 for Essential and C$3,000 for Signature. The Island adds a ferry and Tofino adds three hours of highway beyond the flight, which is a genuinely different trip, so the travel is quoted against your actual venue and date. What I will not do is pretend Tofino is a day trip: it wants ten hours and an extra night on the ground.",
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
      "A wedding at the Chateau costs exactly what a wedding in Kitsilano costs, and what one in Old Montréal costs: Essential C$2,000, Signature C$3,000, Complete C$4,200, Photo + Film C$5,900. The mountain does not make the photography more expensive. Travel is kept lean through early booking, practical routes and grouped regional dates.",
      "What the corridor asks for is honesty about time. Lifts close, they hold for wind on days that look fine from the valley, and they move a wedding party far more slowly than anyone plans for. Every Whistler timeline I build names a valley-level ceremony site we switch to if the lift is held. That single line is the difference between a day that works and an afternoon spent waiting.",
    ],
    faqs: [
      {
        q: "Is Whistler more expensive than Vancouver?",
        a: "Not for the photography. Whistler, Squamish and Pemberton buy the same collections at the same figures as anywhere else: C$2,000, C$3,000, C$4,200 and C$5,900. What the corridor adds is the trip, and that is quoted with the collection rather than sprung on you afterwards.",
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
        a: "Complete, and I would say so even if it were the cheaper option. The travel has already turned your wedding into a two-day event for everyone attending, there is always a Friday, and the Friday evening light on that coast is frequently better than anything Saturday produces.",
      },
    ],
  },
  {
    slug: "banff",
    city: "Banff",
    titleQualifier: "Lake Louise",
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
        a: "The photography is published and it is the same as everywhere: C$2,000 for Essential, C$3,000 for Signature, C$4,200 for Complete and C$5,900 for Photo + Film. Travel is kept to the route the date actually requires and reduced or waived when regional dates can be grouped.",
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

/** The three featured markets. /pricing and the home page link these; the nav
 *  and the hubs use all of MARKETS. */
export const CORE_MARKETS = MARKETS.filter((m) =>
  ["montreal", "toronto", "vancouver"].includes(m.slug),
);

/** The lowest collection price on the site. The same figure in every city. */
export const STARTING_FROM = ENTRY.price;
