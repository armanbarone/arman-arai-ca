/* Brand facts and the three markets, in one place.
 *
 * armanarai.ca is Canadian wedding photography only. No destination weddings,
 * no elopement curation: that is armanarai.com, a separate business on a
 * separate domain. Email and social handles are shared between the two.
 */

export const SITE = {
  name: "Arman Arai",
  domain: "armanarai.ca",
  url: "https://www.armanarai.ca",
  email: "i@armanarai.com",
  instagram: "https://instagram.com/iArmanArai",
  instagramHandle: "@iArmanArai",
  pinterest: "https://pinterest.com/iarmanarai",
  tagline: "Canadian wedding photography",
  // What the business actually is, in one sentence, reused in metadata.
  blurb:
    "Wedding photography across Canada, coast to coast, with home markets in Toronto, Montréal and Vancouver.",
} as const;

export type Tier = {
  name: string;
  hours: number;
  price: number;
  crew: string;
  images: string;
  includes: string[];
  bestFor: string;
};

export type Market = {
  slug: string;
  city: string;
  /** How the city is written in running copy. */
  name: string;
  province: string;
  /** The catchment this market actually covers. */
  region: string;
  /** Places inside the travel radius, used on the city page and in schema. */
  areas: string[];
  /** The angle this market is sold on, from the 2026 market research. */
  angle: string;
  lede: string;
  /** Paragraphs for the city page body. */
  body: string[];
  tiers: Tier[];
  /** Questions couples in this market actually ask. */
  faqs: { q: string; a: string }[];
};

const COMMON_ADDONS = [
  { name: "Second photographer", price: 650, note: "A defined block of hours, not an open tab." },
  { name: "Extra hour of coverage", price: 450, note: "Editing on the extra frames included." },
  { name: "Engagement session", price: 700, note: "Already included in Core and Signature." },
  { name: "Album credit", price: 750, note: "A credit toward a printed album, so you see the ceiling." },
  { name: "Photo and video", price: 2500, note: "Priced from real crew and edit cost, quoted per wedding." },
];

export const ADDONS = COMMON_ADDONS;

export const MARKETS: Market[] = [
  {
    slug: "toronto",
    city: "Toronto",
    name: "Toronto",
    province: "Ontario",
    region: "Toronto and the GTA",
    areas: [
      "Toronto", "Mississauga", "Brampton", "Vaughan", "Markham", "Richmond Hill",
      "Oakville", "Burlington", "Hamilton", "Scarborough", "Etobicoke", "Niagara",
    ],
    angle: "Cultural fluency and multi-day weddings scoped event by event",
    lede:
      "The GTA is the densest wedding market in the country and the one most often quoted badly. A three-day celebration is not one package with a bigger number on it.",
    body: [
      "Toronto weddings are rarely a single afternoon. A Sikh wedding runs from an early Anand Karaj to a reception that ends near midnight. A Pakistani celebration spreads mehndi, nikah and walima across three days and often three venues. A Tamil or Persian or Ethiopian wedding carries its own order of events, its own moment that matters most, and its own idea of what a photographer should never miss. Quoting all of that as one flat number is how couples end up paying for hours they did not need, or losing the ceremony because coverage started too late.",
      "So I scope by event. How many days, how many venues, how far apart, how many people in the room, and which twenty minutes of the whole thing you would be heartbroken to lose. That produces a real number instead of a guess, and it produces a timeline that survives contact with Highway 401 traffic on a Saturday in June.",
      "For a single-day wedding, the ladder below is the whole story. For anything multi-day or multi-venue, tell me the shape of it and I will quote it properly.",
    ],
    tiers: [
      {
        name: "Essential", hours: 6, price: 3500, crew: "One lead photographer", images: "400+ edited frames",
        includes: ["A planning call", "Full-resolution private gallery", "Preview set within 72 hours"],
        bestFor: "Weekday and shorter single-venue weddings",
      },
      {
        name: "Core", hours: 8, price: 4800, crew: "One lead photographer", images: "600+ edited frames",
        includes: ["Engagement session", "Timeline built with you", "Full-resolution private gallery", "Preview set within 48 hours"],
        bestFor: "Most Toronto and GTA weddings",
      },
      {
        name: "Signature", hours: 10, price: 6400, crew: "Lead plus a second photographer for 8 hours", images: "900+ edited frames",
        includes: ["Engagement session", "Album credit or film add-on", "Next-day preview", "Priority delivery"],
        bestFor: "Large celebrations and long multicultural days",
      },
    ],
    faqs: [
      {
        q: "How do you price a three-day South Asian wedding?",
        a: "By event, not by package. I need the number of days, the venues, the distance between them, whether any two events run the same day, and how many people are in each room. That decides crew, travel and editing volume, which is where the cost actually lives. You get one quote with the whole thing itemised.",
      },
      {
        q: "How far into the GTA do you travel without a fee?",
        a: "Anywhere inside the GTA, from Burlington to Whitby, is included. Niagara, Muskoka, Prince Edward County and the rest of Southern Ontario are quoted with travel added, and I will tell you the number before you book, not after.",
      },
      {
        q: "Do you work with a second photographer?",
        a: "Signature includes eight hours of second coverage. On Essential and Core it is an add-on at $650. For a wedding where the two of you are getting ready in different cities, or where the ceremony and the reception overlap, a second is not a luxury and I will say so.",
      },
    ],
  },
  {
    slug: "montreal",
    city: "Montréal",
    name: "Montréal",
    province: "Québec",
    region: "Montréal, the Laurentians and the Eastern Townships",
    areas: [
      "Montréal", "Laval", "Longueuil", "Vieux-Montréal", "Westmount", "Outremont",
      "Mont-Tremblant", "the Laurentians", "the Eastern Townships", "Québec City",
    ],
    angle: "Bilingual documentary coverage with calm timeline guidance",
    lede:
      "Montréal has the widest price spread of the three markets. Volume studios sell below $2,000 and established photographers sit between $3,000 and $5,000. I am not trying to win the bottom of that range.",
    body: [
      "The work here is documentary and editorial: I photograph what happens rather than staging a version of it, then I direct properly for the twenty minutes of portraits where direction is what you actually want. That distinction matters more in Montréal than anywhere else I work, because the market is full of packages that promise a number of images and say nothing about how the day will feel.",
      "I work in French and in English. Your grandmother gets spoken to in the language she is comfortable in, the notaire gets understood, and the vendor emails do not need translating. In a city where half the room may be francophone and half anglophone, that is not a nice extra. It is the job.",
      "Old Montréal, the Plateau, Mont-Royal, the Laurentians and the Eastern Townships are all inside the normal working radius. Québec City is a travel day and is quoted as one.",
    ],
    tiers: [
      {
        name: "Essential", hours: 6, price: 3200, crew: "One lead photographer", images: "350+ edited frames",
        includes: ["A planning call", "Bilingual FR/EN planning guide", "Full-resolution private gallery", "Preview set within 72 hours"],
        bestFor: "City hall ceremonies and shorter weddings",
      },
      {
        name: "Core", hours: 8, price: 4200, crew: "One lead photographer", images: "550+ edited frames",
        includes: ["Engagement session", "Timeline built with you", "Full-resolution private gallery", "Preview set within 48 hours"],
        bestFor: "Most Montréal weddings",
      },
      {
        name: "Signature", hours: 10, price: 5600, crew: "Lead plus a second photographer for 6 hours", images: "800+ edited frames",
        includes: ["Engagement session", "Album credit", "Next-day preview", "Priority delivery"],
        bestFor: "Full days from morning preparation to the last dance",
      },
    ],
    faqs: [
      {
        q: "Travaillez-vous en français ?",
        a: "Oui, entièrement. Planning calls, the guide, the emails and the day itself run in French or in English, whichever suits you and your families. Nothing is translated after the fact.",
      },
      {
        q: "Do you cover the Laurentians and the Eastern Townships?",
        a: "Yes, both are inside the normal radius. Mont-Tremblant, Sutton, Bromont, Knowlton and the rest are a drive, not a destination wedding, and they are priced that way.",
      },
      {
        q: "We are having a civil ceremony with a notaire. Is that too small?",
        a: "No. A six-hour Essential covers a notaire ceremony, portraits and a dinner comfortably. Small does not mean thin, and it does not get a lesser version of the work.",
      },
    ],
  },
  {
    slug: "vancouver",
    city: "Vancouver",
    name: "Vancouver",
    province: "British Columbia",
    region: "Vancouver, the North Shore and the Sea-to-Sky corridor",
    areas: [
      "Vancouver", "Burnaby", "Richmond", "Surrey", "North Vancouver", "West Vancouver",
      "Squamish", "Whistler", "the Sea-to-Sky corridor", "the Fraser Valley", "Bowen Island",
    ],
    angle: "Location and weather expertise, with Sea-to-Sky travel costed honestly",
    lede:
      "Vancouver is really two products. A Lower Mainland wedding, and a Sea-to-Sky or Whistler wedding where access, permits and weather are half the planning.",
    body: [
      "For a city wedding the work is the same as anywhere: a timeline that respects the light, coverage that does not run out before the dancing, and portraits that take twenty minutes rather than an hour and a half. The local difference is rain. Between October and April a wet ceremony is not the exception, so every timeline I build has a covered plan that is a real plan, scouted in advance, not a shrug on the day.",
      "Sea-to-Sky is a different job. Whistler, Squamish and the corridor need travel time counted properly, and anything on Crown land or in a provincial park needs its permit sorted well before the date. Helicopter access, transport, officiant, florals and hair and makeup are all real costs and I price them separately rather than folding them into a headline number that hides what you are paying for.",
      "The all-inclusive mountain packages in this market start around $8,500 once vendors and travel are bundled in. If that is the day you want, I will tell you what it actually costs to build. If you want photography alone, the ladder below is the whole price.",
    ],
    tiers: [
      {
        name: "Essential", hours: 6, price: 3500, crew: "One lead photographer", images: "400+ edited frames",
        includes: ["A planning call", "A scouted weather backup", "Full-resolution private gallery", "Preview set within 72 hours"],
        bestFor: "Local and intimate Lower Mainland weddings",
      },
      {
        name: "Core", hours: 8, price: 4800, crew: "One lead photographer", images: "600+ edited frames",
        includes: ["Engagement session", "Timeline and location plan", "Full-resolution private gallery", "Preview set within 48 hours"],
        bestFor: "Most Vancouver weddings",
      },
      {
        name: "Signature", hours: 10, price: 6500, crew: "Lead plus a second photographer for 8 hours", images: "900+ edited frames",
        includes: ["Engagement session", "Sea-to-Sky planning and permits handled", "Album credit", "Next-day preview"],
        bestFor: "Whistler, Squamish and full mountain days",
      },
    ],
    faqs: [
      {
        q: "What happens if it rains?",
        a: "We shoot. Every timeline I build names a specific covered location that I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery, but only when the backup was decided in advance rather than in a parking lot.",
      },
      {
        q: "Do you cover Whistler and the Sea-to-Sky corridor?",
        a: "Yes. Travel time up the corridor is counted in the quote rather than absorbed, and any permit a provincial park or Crown land site requires is arranged before the date. Helicopter access, transport and vendors are quoted separately so you can see each line.",
      },
      {
        q: "Is a mountain wedding more expensive than a city one?",
        a: "The photography is the same ladder. What changes is travel, permits and access. I would rather show you those as separate lines than quietly build them into a bigger package price.",
      },
    ],
  },
];

export const marketBySlug = (slug: string) => MARKETS.find((m) => m.slug === slug);

/** The lowest Core price across the markets, for "from" copy that stays true. */
export const CORE_FROM = Math.min(...MARKETS.map((m) => m.tiers[1].price));
export const STARTING_FROM = Math.min(...MARKETS.flatMap((m) => m.tiers.map((t) => t.price)));
