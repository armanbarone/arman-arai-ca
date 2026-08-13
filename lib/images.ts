/* Every photograph on the site, in one place.
 *
 * The files live in the Cloudflare R2 bucket `canadian-wedding` (canonical) and
 * are mirrored into `website/ca/…` because cdn.armanarai.com is the CDN host
 * that is live today. When cdn.armanarai.ca is mapped onto the canadian-wedding
 * bucket, change CDN_BASE below and update cloudflareLoader.ts to match; nothing
 * else in the codebase knows a URL.
 *
 * Alt text is written here rather than at each call site so a photograph carries
 * the same description everywhere it appears.
 */

const CDN_BASE = "https://cdn.armanarai.ca";

export type Photo = { src: string; alt: string };

const p = (key: string, alt: string): Photo => ({ src: `${CDN_BASE}/${key}.webp`, alt });

const CDN_HOST = "https://cdn.armanarai.ca";

/** A Cloudflare-transformed URL at a fixed width.
 *
 * next/image goes through cloudflareLoader and never needs this. The flipbook
 * album components render plain <img> inside a 3D transform, where next/image
 * cannot be used, so they ask for one size explicitly rather than downloading
 * a 2400px original into a 500px page. */
export function at(src: string, width: number, quality = 80): string {
  // Mirrors the TRANSFORMS switch in cloudflareLoader.ts. Image Transformations
  // are not enabled on the armanarai.ca zone yet, so asking for one returns a
  // 404 rather than a resized image. Serve the original until it is on.
  const TRANSFORMS = true;
  if (!TRANSFORMS) return src;
  if (!src.startsWith(`${CDN_HOST}/`)) return src;
  const path = src.slice(CDN_HOST.length);
  return `${CDN_HOST}/cdn-cgi/image/format=auto,quality=${quality},width=${width},fit=scale-down${path}`;
}

/** The same, for a whole set. */
export const allAt = (photos: Photo[], width: number) => photos.map((ph) => at(ph.src, width));

/* ── Home ───────────────────────────────────────────────────────────────── */

export const HERO = {
  main: p("home/hero-groom-double-exposure", "Double exposure of a groom in a dark suit layered with his bride's veil in window light"),
  topRight: p("home/hero-hands-reaching-veil", "Two hands reaching toward each other across a black frame, a length of veil between them"),
  bottomRight: p("home/hero-overhead-spiral-floor-dance", "Overhead black and white frame of a couple dancing alone on a spiral marble floor"),
};

export const HOME_GRID: Photo[] = [
  p("home/grid-bride-cape-groom-lounge", "Bride in a beaded cape beside her groom on a leather sofa, white flowers behind them"),
  p("home/grid-colonnade-kiss-bw", "Black and white frame of a couple kissing at the end of a long stone colonnade"),
  p("home/grid-bride-vintage-car-bw", "Bride holding her bouquet at the open door of a vintage car, shot through the window"),
  p("home/grid-couple-laughing-goggles", "Bride and groom laughing with their hands held up like goggles over their eyes"),
  p("home/grid-portrait-gallery-walk", "Bride walking the length of a dark gallery hung with gilt-framed paintings"),
  p("home/grid-first-dance-spin-blur", "Spinning motion blur of a couple's first dance seen from above"),
  p("home/grid-chandelier-staircase-gown", "A gown spread down a gilded staircase beneath a lit chandelier"),
  p("home/grid-cathedral-train-dome", "Bride and her cathedral train laid out on the tiled floor of a domed church"),
];

// The scrolling film strip on the homepage. Frame order is the strip order.
export const FILM_STRIP: (Photo & { label: string | null })[] = [
  { ...p("home/film-lobby-embrace-bw", "Couple embracing in a dark modern lobby, black and white"), label: "KODAK 400 · EXP. 2024" },
  { ...p("home/film-window-light-solitary-bride", "Bride lit only by a tall stained-glass window in an otherwise dark room"), label: null },
  { ...p("home/film-ballroom-kiss-chandeliers", "Couple kissing in a chandeliered ballroom with gardens through the windows"), label: "PORTRA 800 · EXP. 2024" },
  { ...p("home/film-medallion-floor-overhead-bw", "Overhead black and white frame of a couple on a geometric medallion floor"), label: null },
  { ...p("home/film-reception-crowd-blur-bw", "Reception guests blurred in motion around a still couple, black and white"), label: "HP5 · EXP. 2024" },
  { ...p("home/film-grand-staircase-portrait", "Bride and groom on a grand ornate staircase under warm light"), label: null },
  { ...p("home/film-iron-staircase-chandelier", "Bride on a curved wrought-iron staircase beneath a crystal chandelier"), label: "EKTAR 100 · EXP. 2024" },
  { ...p("home/film-shoulder-veil-detail-bw", "Close black and white detail of a bare shoulder and the edge of a veil"), label: null },
  { ...p("home/film-drawing-room-dance", "Couple dancing in a portrait-hung drawing room, light falling through tall windows"), label: "PORTRA 400 · EXP. 2024" },
  { ...p("home/film-south-asian-couple-red-gold", "South Asian couple in a cream sherwani and red and gold lehenga, seated close"), label: null },
  { ...p("home/grid-cathedral-train-dome", "Bride and her cathedral train laid out on the tiled floor of a domed church"), label: "GOLD 200 · EXP. 2024" },
];

/* ── About ──────────────────────────────────────────────────────────────── */

export const ARMAN_PORTRAIT = p(
  "about/arman-portrait-camera-window",
  "Arman Arai with his camera, in a flat cap and suspenders, against a window",
);

export const ABOUT_STORY: Photo[] = [
  p("about/arman-shooting-ivy-wall", "Arman photographing a bride and groom in front of an ivy-covered wall"),
  p("about/arman-shooting-couple-bridge", "Arman photographing a couple embracing on a bridge over a river"),
  p("about/arman-shooting-bridal-party-trees", "Arman photographing a bridal party in an avenue of trees"),
  p("about/arman-with-couple-reception", "Arman standing with a bride and groom at their reception"),
  p("about/arman-with-couple-venue", "Arman between a bride and groom at their venue, all three laughing"),
];

/* ── Portfolio bodies of work ───────────────────────────────────────────── */

export const EDITORIAL: Photo[] = [
  p("portfolio/editorial/dark-hall-chandelier-shaft", "A bride small in a dark hall under a single shaft of chandelier light"),
  p("portfolio/editorial/lace-sleeve-close-bw", "Close black and white portrait of a couple, her lace sleeves against his lapel"),
  p("portfolio/editorial/backlit-tender-close", "Backlit close portrait of a couple with their foreheads together"),
  p("portfolio/editorial/panelled-library-gold-chair", "Couple in a wood-panelled library, the groom in a gold armchair"),
  p("portfolio/editorial/night-courtyard-train-bw", "Black and white night courtyard with a long train lit across the stone"),
  p("portfolio/editorial/candlelit-head-table", "Bride standing at a candlelit head table in a warm panelled room"),
  p("portfolio/editorial/red-lip-shadow-portrait", "Dramatic portrait in deep shadow, red lip catching the only light"),
  p("portfolio/editorial/mirrored-doors-party-bw", "Black and white frame of the wedding party repeated in mirrored doors"),
  p("portfolio/editorial/red-wall-gold-mirror", "Couple seated against a red wall beneath a round gold mirror"),
  p("portfolio/editorial/veil-kiss-highkey-bw", "High contrast black and white kiss seen through the fall of a veil"),
  p("portfolio/editorial/whisky-glass-warm-light", "Bride holding a whisky glass in warm low light"),
  p("portfolio/editorial/graphic-marble-floor-bw", "Couple centred on a graphic black and white marble floor"),
  p("portfolio/editorial/salon-oil-painting-florals", "Couple seated in a salon below a large oil painting, flowers at their feet"),
  p("portfolio/editorial/grid-window-silhouette", "Silhouette holding a bouquet against a large gridded window"),
  p("portfolio/editorial/poolside-recline-turquoise", "Bride reclining in the light reflected off a turquoise pool"),
];

export const FILM: Photo[] = [
  p("portfolio/film/doorway-veil-portrait", "Bride standing in a doorway, veil falling the length of the frame"),
  p("portfolio/film/dim-colonnade-embrace", "Couple embracing in a dim colonnade, light from the far end"),
  p("portfolio/film/taper-candle-ceremony", "Ceremony lit by a row of tall taper candles"),
  p("portfolio/film/ivory-tux-groom-ceremony", "Groom in an ivory tuxedo waiting at an outdoor ceremony"),
  p("portfolio/film/golden-hour-bouquets-detail", "Bouquets and a boutonnière held close in golden hour light"),
  p("portfolio/film/candlelit-banquet-table", "A long banquet table set and lit entirely by candles"),
  p("portfolio/film/theatre-red-curtain-spotlight", "A single spotlight on a dark stage behind a red theatre curtain"),
  p("portfolio/film/velvet-lounge-party", "Wedding party on velvet furniture in a moody lounge"),
  p("portfolio/film/lit-interior-close", "Couple close together in a warmly lit interior"),
  p("portfolio/film/tall-drapes-silhouette", "Silhouette between tall drapes, mirrored in the floor"),
  p("portfolio/film/hands-ring-tulle-detail", "Hands and a wedding ring resting on a tulle skirt"),
  p("portfolio/film/black-fabric-abstract", "Abstract fold of black fabric catching a single edge of light"),
  p("portfolio/film/dim-ballroom-candle-foreground", "A distant couple in a dim ballroom, candle flame in the foreground"),
  p("portfolio/film/seated-floor-set-table", "Bride seated on the floor beside a fully set table"),
  p("portfolio/film/candelabra-table-back", "Bride seen from behind at a candelabra-lit table"),
  p("portfolio/film/long-table-lean-chandelier", "Bride leaning along a long table under a chandelier"),
  p("portfolio/film/under-the-veil-bw", "Black and white frame of a couple together under the veil"),
  p("portfolio/film/window-reflection-groom-bw", "Grainy black and white reflection of a groom in a window"),
  p("portfolio/film/frescoed-hall-banquet", "Banquet laid out in a frescoed hall, warm candlelight"),
  p("portfolio/film/garden-stone-villa-ceremony", "Garden ceremony in front of a stone facade, guests standing"),
];

export const DOCUMENTARY: Photo[] = [
  p("portfolio/documentary/morning-window-vows-read", "Bride reading at a window in the morning, her dress hanging behind her"),
  p("portfolio/documentary/bridesmaids-hotel-bed", "Bridesmaids getting ready across a hotel bed strewn with clothes"),
  p("portfolio/documentary/open-back-gown-mirror", "Bride in an open-back gown seen in a mirror"),
  p("portfolio/documentary/hotel-corridor-groom", "Groom walking away down a hotel corridor"),
  p("portfolio/documentary/private-door-groom", "A door marked PRIVATE with the groom waiting beyond it"),
  p("portfolio/documentary/hanging-dress-window-guests", "The dress hanging in a window with guests toasting in the foreground"),
  p("portfolio/documentary/guests-hands-over-shoulder", "Two guests holding hands, framed over a shoulder in the crowd"),
  p("portfolio/documentary/guests-laughing-champagne", "Guests laughing together with champagne at the reception"),
  p("portfolio/documentary/reception-toast-raised-glass", "A guest raising a glass mid-toast at the reception"),
  p("portfolio/documentary/car-back-seat-teal", "Couple resting together in the back seat of a car in teal evening light"),
  p("portfolio/documentary/dark-chapel-candles-aisle", "Bride walking a dark chapel aisle lined with candles"),
  p("portfolio/documentary/rainy-arcade-umbrella-bw", "Black and white frame of a couple under an umbrella in a rainy arcade"),
];

export const ANALOGUE: Photo[] = [
  p("portfolio/analogue/spin-blur-overhead-bw", "Overhead black and white frame of a spinning dress dissolving into blur"),
  p("portfolio/analogue/veiled-bride-arches-bw", "Black and white portrait of a veiled bride beneath stone arches"),
  p("portfolio/analogue/veil-abstraction-bw", "Soft black and white abstraction of veil fabric in motion"),
  p("portfolio/analogue/blue-veil-eye", "One eye visible behind a blue veil"),
  p("portfolio/analogue/rain-umbrella-night-cobbles", "Couple under an umbrella on wet cobbles at night"),
  p("portfolio/analogue/baroque-church-interior", "A bride small at the centre of a vast baroque church interior"),
  p("portfolio/analogue/arcade-courtyard-night", "Arcaded courtyard at night reflected in still water"),
  p("portfolio/analogue/eighties-orange-sofa", "Couple styled in 1980s dress on an orange sofa"),
  p("portfolio/analogue/retro-window-florals", "Couple by a window with florals, shot in a retro palette"),
  p("portfolio/analogue/fountain-drape-gardens", "Bride draped over a stone fountain in formal gardens"),
  p("portfolio/analogue/surreal-shell-bride", "Surreal frame of a bride seated inside a giant shell"),
];

/* ── The three markets ──────────────────────────────────────────────────────
 * Real Canadian location photography, ported from armanarai.com. Every frame
 * below was looked at before it was placed, so the alt text describes the
 * photograph rather than the folder it came from.
 */

export type CityPhotos = {
  hero: Photo;
  /** Four frames for the "where I shoot" strip on the city page. */
  places: (Photo & { caption: string })[];
};

/** Keys that already carry their own extension (the ported .com files are a mix
 *  of .webp and .png, and the p() helper appends .webp). */
const raw = (key: string, alt: string): Photo => ({ src: `${CDN_BASE}/${key}`, alt });

const place = (key: string, alt: string, caption: string) =>
  ({ ...(key.includes(".") ? raw(key, alt) : p(key, alt)), caption });

export const CITY_PHOTOS: Record<string, CityPhotos> = {
  toronto: {
    hero: raw("cities/toronto/niagara/floral-showhouse/01.webp", "Bride and groom in the glasshouse of the Niagara Floral Showhouse, surrounded by hydrangeas"),
    places: [
      place("cities/toronto/niagara.webp", "Bride holding an orange bouquet among ferns and flowers in a conservatory", "Niagara"),
      place("cities/toronto/muskoka.webp", "Couple on a dock in front of a float plane on a Muskoka lake", "Muskoka"),
      place("cities/toronto/prince-edward-county/cover/01.webp", "Couple laughing in a golden grass field in Prince Edward County", "Prince Edward County"),
      place("cities/toronto/killarney-1.webp", "Circular floral arch set on a dock above a lake in Killarney", "Killarney"),
    ],
  },
  montreal: {
    hero: raw("cities/montreal/places/mtl-oldmontreal-bluehour.png", "Couple walking a cobbled Old Montréal street at blue hour, a church spire beyond"),
    places: [
      place("cities/montreal/places/mtl-montroyal-dusk.png", "Couple embracing on Mont-Royal with the Montréal skyline behind them at dusk", "Mont-Royal"),
      place("cities/montreal/places/mtl-snow-lane.png", "Couple sharing an umbrella in falling snow on a Montréal street of exterior staircases", "The Plateau in winter"),
      place("cities/montreal/jacques-cartier.webp", "Couple kissing at the edge of a lake ringed with autumn forest in Parc de la Jacques-Cartier", "The Laurentians"),
      place("cities/montreal/bic.webp", "Couple walking a snowy rocky shoreline at sunset in Parc national du Bic", "The Lower St Lawrence"),
    ],
  },
  vancouver: {
    hero: raw("cities/vancouver/lions-gate-bridge-lookout.png", "Bride and groom at the Lions Gate Bridge lookout, the bridge and North Shore mountains behind"),
    places: [
      place("cities/vancouver/whytecliff.webp", "Couple seated on the rocks at Whytecliff Park with the islands beyond", "Whytecliff Park"),
      place("cities/vancouver/locations/deep-cove/01.webp", "A beach ceremony at Deep Cove with guests standing and a sailboat on the water", "Deep Cove"),
      place("cities/vancouver/locations/lighthouse-park/01.webp", "Couple embracing on driftwood at Lighthouse Park, the lighthouse above them", "Lighthouse Park"),
      place("cities/vancouver/cypress.webp", "Couple in the snow among the conifers on Cypress Mountain", "Cypress and the Sea-to-Sky"),
    ],
  },
};

/* ── Journal ────────────────────────────────────────────────────────────── */

export const JOURNAL_FALLBACK = p(
  "journal/lace-gown-couple-bw",
  "Black and white frame of a couple, the bride in a lace gown, against a dark ground",
);
