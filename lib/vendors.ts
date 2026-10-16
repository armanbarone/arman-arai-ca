/* The preferred vendor list, sent in the first email to every couple.
 *
 * HOW THIS WAS BUILT, and what it is safe to say about it: every business
 * below was found in Canadian wedding editorial or directory coverage, then
 * its website was fetched and read to confirm three things: the domain belongs
 * to that business, the site is live, and it is actually a wedding business in
 * that city. Twelve candidates were dropped at that step because the obvious
 * domain turned out to belong to somebody else (a recording studio, a Las
 * Vegas chapel, a design firm in Dubai) or because the site was dead.
 *
 * So the LINKS are verified. Do not add an entry whose site you have not
 * opened, and do not write a `note` that claims something the site does not
 * say. If a link starts 404ing, remove the entry rather than guessing a new
 * domain: a dead link in the first email is worse than a shorter list.
 *
 * The page is at /preferred-vendors and is noindex, like /wedding-guide: it
 * is a funnel asset, not a page that should compete in search or read as an
 * endorsement marketplace.
 */

export type VendorCategory = "planning" | "flowers" | "beauty" | "music" | "officiant";

export type Vendor = {
  name: string;
  /** Bare domain; the page and the email both link to https://<site>. */
  site: string;
  /** One line, true to what the business publishes about itself. */
  note: string;
};

export type VendorCity = {
  slug: string;
  /** Matches the pricing market slug, so the email can open on their city. */
  market: string;
  name: string;
  /** The area this list actually covers, said plainly. */
  area: string;
  groups: { category: VendorCategory; vendors: Vendor[] }[];
};

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  planning: "Planners and coordinators",
  flowers: "Flowers",
  beauty: "Hair and makeup",
  music: "Music, DJs and bands",
  officiant: "Officiants",
};

/** What each category is for, in the order a couple actually books them. */
export const CATEGORY_NOTES: Record<VendorCategory, string> = {
  planning:
    "Book first, or at least before the venue if you can. A good coordinator is the difference between a day you host and a day you attend.",
  flowers:
    "Six to nine months out. Bring your florist a colour and a feeling rather than a Pinterest board, and let them tell you what is actually in season on your date.",
  beauty:
    "Book the trial, not just the day. Nine months out for a Saturday in summer; they take one wedding a day and the good ones fill first.",
  music:
    "The single biggest lever on whether people dance. Ask who is actually showing up on your date, by name, and get it in the contract.",
  officiant:
    "In Canada this is the person who makes the marriage legal, so check they are licensed in your province before anything else.",
};

export const VENDOR_CITIES: VendorCity[] = [
  {
    slug: "vancouver",
    market: "vancouver",
    name: "Vancouver",
    area: "Vancouver, Burnaby, Richmond, the North Shore, the Fraser Valley, Squamish and Whistler",
    groups: [
      {
        category: "planning",
        vendors: [
          { name: "Filosophi Events", site: "filosophi.com", note: "Vancouver wedding and event planning and design, and one of the longest-running studios in the city." },
          { name: "DreamGroup", site: "dreamgroup.ca", note: "Full planning and coordination across Vancouver and the Lower Mainland." },
          { name: "Petite Pearl Events", site: "petitepearlevents.com", note: "Vancouver and Squamish, so a strong choice if your day moves up the Sea to Sky." },
        ],
      },
      {
        category: "flowers",
        vendors: [
          { name: "Botany and Bloom", site: "botanybloom.ca", note: "Weddings, botanicals and styling, with decor rentals under the same roof." },
          { name: "Celsia Florist", site: "celsiaflorist.com", note: "A Vancouver shop building custom work rather than selling set pieces." },
          { name: "The Wild Bunch", site: "thewildbunch.ca", note: "A Mount Pleasant studio that works with dried stems as well as fresh." },
          { name: "Adele Rae", site: "adeleraeflorist.com", note: "Burnaby based, and well set up for weddings on the east side and out toward the valley." },
        ],
      },
      {
        category: "beauty",
        vendors: [
          { name: "Faye Smith Agency", site: "fayesmith.ca", note: "A hair and makeup agency covering Vancouver, Vancouver Island and Toronto, so a team rather than one artist." },
          { name: "Pink Orchid Studio", site: "pinkorchidstudio.com", note: "One of the leading studios in the city for South Asian bridal hair and makeup." },
          { name: "Sharon Rai", site: "sharonrai.com", note: "Bridal artist and educator, with a studio team behind her." },
        ],
      },
      {
        category: "music",
        vendors: [
          { name: "Presto Entertainment", site: "prestoentertainment.ca", note: "DJ, lighting and photo booth, and a past BC Wedding Awards DJ of the Year." },
          { name: "The Vancouver DJ Company", site: "vancouverdjcompany.com", note: "A wedding-first DJ company with a deep review history in the city." },
        ],
      },
      {
        category: "officiant",
        vendors: [
          { name: "Young Hip & Married", site: "younghipandmarried.com", note: "A large team of licensed BC marriage commissioners, which means a real chance they are free on your date." },
          { name: "Vancouver Officiant", site: "vancouverofficiant.com", note: "A small boutique team of officiants working across British Columbia." },
        ],
      },
    ],
  },
  {
    slug: "toronto",
    market: "toronto",
    name: "Toronto",
    area: "Toronto, Mississauga, Oakville, Vaughan, Markham and the rest of the GTA",
    groups: [
      {
        category: "planning",
        vendors: [
          { name: "Bisous Events", site: "bisousevents.com", note: "Toronto wedding planning with a classic, French-leaning hand." },
          { name: "Rainbow Chan Weddings", site: "rainbowchan.com", note: "Full-service Toronto planning, and experienced with multicultural and two-ceremony days." },
          { name: "August in Bloom", site: "augustinbloom.com", note: "Planning and design together, which helps when the look matters as much as the logistics." },
        ],
      },
      {
        category: "flowers",
        vendors: [
          { name: "R5 Event Design", site: "r5eventdesign.com", note: "Florals, decor, lighting and rentals from one company, for rooms that need the whole look built." },
          { name: "Creations by Gitta", site: "creationsbygitta.com", note: "Wedding and event floral design, and more than 25 years of it." },
          { name: "Kaas Floral Design", site: "kaasfloraldesign.com", note: "A smaller studio, for couples who want something less arranged-looking." },
          { name: "Gatto Flowers", site: "gattoflowers.ca", note: "A long-standing Toronto florist that handles weddings alongside daily work." },
        ],
      },
      {
        category: "beauty",
        vendors: [
          { name: "Michael Fels Beauty", site: "michaelfels.com", note: "Toronto wedding hair and makeup, with an on-location team." },
          { name: "Corrie Elle Artistry", site: "corrieelleartistry.com", note: "Toronto bridal hair and makeup, trials included in the process rather than sold as an afterthought." },
        ],
      },
      {
        category: "music",
        vendors: [
          { name: "Impact DJ", site: "impactdj.ca", note: "A Toronto wedding DJ company with one of the largest review histories in the city." },
          { name: "Dialed-In DJs", site: "dialedindjs.com", note: "Founded by two women, and openly anti-cheese, which is rarer than it should be." },
          { name: "Something Blue Wedding DJs", site: "somethingblueweddingdjs.com", note: "Weddings only, across Toronto and southern Ontario." },
          { name: "808 Events", site: "808events.com", note: "Books live bands and artists, so worth a call if you want players rather than a playlist." },
        ],
      },
      {
        category: "officiant",
        vendors: [
          { name: "Enduring Promises", site: "enduringpromises.com", note: "A large Ontario officiant group that also covers Alberta, with personalised ceremonies." },
          { name: "My Wedding Officiant", site: "myweddingofficiant.ca", note: "Toronto, Newmarket and Windsor, and used to working around a tight reception start." },
        ],
      },
    ],
  },
  {
    slug: "montreal",
    market: "montreal",
    name: "Montréal",
    area: "Montréal, Laval, the South Shore, the Laurentians and the Eastern Townships",
    groups: [
      {
        category: "planning",
        vendors: [
          { name: "Erika co. Events", site: "erikaco.ca", note: "Weddings and events across Montréal and Québec, working in both languages." },
          { name: "Elyna Kudish Events", site: "elynakudish.com", note: "Design-led celebrations, planning in Montréal and beyond since 2005." },
          { name: "Beautiful Elegant Events", site: "beautifulelegantevents.com", note: "Montréal wedding organisation with a long and consistent review record." },
        ],
      },
      {
        category: "flowers",
        vendors: [
          { name: "Westmount Florist", site: "westmountflorist.com", note: "A Westmount shop doing weddings alongside its daily flower work." },
          { name: "Main Florist", site: "mainflorist.com", note: "Fleuriste Main Florist, a long-standing Montréal florist." },
        ],
      },
      {
        category: "beauty",
        vendors: [
          { name: "Annalisa Pearl", site: "annalisapearl.com", note: "Montréal bridal, wedding and glam makeup, including airbrush and on-location work." },
          { name: "Makeup by MaryK", site: "makeupbymaryk.com", note: "Bridal-focused, and one of the most reviewed makeup artists in the city." },
        ],
      },
      {
        category: "music",
        vendors: [
          { name: "That's Amore Productions", site: "thatsamoreweddings.com", note: "Twenty years of Montréal weddings, and genuinely good on Italian and multicultural receptions." },
          { name: "SG Entertainment", site: "sgentertainment.ca", note: "Montréal DJ and event entertainment, corporate and private." },
        ],
      },
      {
        category: "officiant",
        vendors: [
          { name: "Rose Gold Celebrations", site: "rosegoldcelebrations.com", note: "A Laval-based team of licensed officiants working anywhere in Québec, in English and French, with some trilingual." },
        ],
      },
    ],
  },
  {
    slug: "calgary",
    market: "calgary",
    name: "Calgary & Banff",
    area: "Calgary, Banff, Lake Louise, Canmore, Kananaskis and the Bow Valley",
    groups: [
      {
        category: "planning",
        vendors: [
          { name: "Melissa Alison Events", site: "melissaalisonevents.ca", note: "Calgary, Banff and Canmore, offering full planning or coordination only." },
          { name: "Elope in Banff", site: "elopeinbanff.ca", note: "Banff specialists for small weddings, and the people to ask about mountain permits and venues." },
        ],
      },
      {
        category: "flowers",
        vendors: [
          { name: "Flowers by Janie", site: "flowersbyjanie.com", note: "A Calgary wedding floral studio with an English-garden hand, including setup and take-down." },
          { name: "Finesse Flowers", site: "finesseflowers.ca", note: "A Calgary flower shop that handles weddings alongside same-day work." },
          { name: "Flower Chix", site: "flowerchix.com", note: "Calgary florist and flower delivery, and a practical option for a smaller order." },
        ],
      },
      {
        category: "beauty",
        vendors: [
          { name: "Top Knot Brides", site: "topknotbrides.com", note: "A wedding-only hair and makeup team with its own parlour and a named artist per booking." },
          { name: "Trinity Hair & Makeup", site: "trinityhairmakeup.ca", note: "Mobile, and willing to travel into the Rockies, which not every Calgary team is." },
          { name: "Beautiful Calgary Bride", site: "beautifulcalgarybride.com", note: "A mobile team working Calgary weddings since 2007." },
        ],
      },
      {
        category: "music",
        vendors: [
          { name: "Pez Productions", site: "pezproductions.ca", note: "Calgary DJ services that regularly travel to Banff, Canmore and Lake Louise." },
          { name: "The Two Bit Bandits", site: "twobitbandits.com", note: "A wedding band that scales from an acoustic duo to eight pieces, so one booking covers ceremony and dance floor." },
        ],
      },
      {
        category: "officiant",
        vendors: [
          { name: "Young Hip & Married", site: "younghipandmarried.com", note: "Licensed officiants in Alberta as well as BC, so they cover both ends of a mountain wedding." },
          { name: "Enduring Promises", site: "enduringpromises.com", note: "An officiant group working in Alberta as well as Ontario." },
        ],
      },
    ],
  },
  {
    slug: "victoria",
    market: "victoria",
    name: "Victoria & Vancouver Island",
    area: "Victoria, Oak Bay, Saanich, Sidney, the West Shore and up-island to Tofino",
    groups: [
      {
        category: "planning",
        vendors: [
          { name: "Jewel & Rose", site: "jewelandrose.com", note: "Wedding planning and events on southern Vancouver Island." },
          { name: "Pacific Rim Event Planning", site: "pacificrimeventplanning.com", note: "Tofino based, and the right call if your day is on the west coast rather than in town." },
        ],
      },
      {
        category: "flowers",
        vendors: [
          { name: "Foxgloves Flowers", site: "foxglovesflowers.com", note: "A Victoria florist with a distinctly un-generic hand." },
          { name: "Bespoke Blossoms", site: "bespokeblossoms.com", note: "A fine-art floral studio working wedding-first, with a consultation and proposal process." },
          { name: "Twig & Bloom", site: "victoriatwigandbloom.ca", note: "Saanichton based, booking the 2026 and 2027 seasons, with an elopement package as well as full weddings." },
        ],
      },
      {
        category: "beauty",
        vendors: [
          { name: "Makeup Artistry by Trish", site: "makeupartistrybytrish.com", note: "Victoria bridal hair and makeup, on location." },
          { name: "Melissa Craven", site: "melissacraven.ca", note: "Makeup and hair across Victoria and Vancouver Island." },
        ],
      },
      {
        category: "music",
        vendors: [
          { name: "DJ Chris P Bacon", site: "djchrispbacon.com", note: "A Victoria wedding DJ who writes about the day rather than the gear, which tells you something." },
          { name: "Sound Advice Entertainment", site: "soundadviceentertainment.com", note: "Island DJ and event sound, including ceremony audio." },
        ],
      },
      {
        category: "officiant",
        vendors: [
          { name: "Young Hip & Married", site: "younghipandmarried.com", note: "Licensed BC marriage commissioners with officiants on the Island, not only in Vancouver." },
        ],
      },
    ],
  },
];

export const vendorCity = (slug: string) =>
  VENDOR_CITIES.find((city) => city.slug === slug || city.market === slug);

/** Distinct businesses on the list, for the line that says how long it is.
 *  Deduplicated by website, because a few teams work more than one region
 *  (Young Hip & Married covers BC, Alberta and the Island) and counting them
 *  once per city would overstate the list. */
export const vendorCount = () =>
  new Set(VENDOR_CITIES.flatMap((city) => city.groups.flatMap((group) => group.vendors.map((v) => v.site)))).size;
