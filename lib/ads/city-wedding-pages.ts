import { CITY_PHOTOS, CITY_WORK, type Photo } from "../images";
import { BANFF_WORK, BC_WORK, type WorkPhoto } from "./hub-work";

/** A hero photograph, with an optional object-position for the phone's wide crop. */
export type HeroPhoto = Photo & { position?: string };

export type WeddingCity = {
  slug: string;
  name: string;
  /** The hero conveyor (HeroConveyor): the large frame shows one, the small
   *  frame the next, and both move up one on each beat. Only the first two
   *  load with the page. Every photo here must work in both crops. */
  heroes: HeroPhoto[];
  interlude: Photo[];
  /** Samples of similar work from the armanarai.com city hub, when it has
   *  photographs that are his (lib/ads/hub-work.ts). Shown instead of the
   *  three-photo interlude strip. */
  work?: { eyebrow: string; title: [string, string]; lead: string; place: string; photos: WorkPhoto[] };
  coverage: [string, string];
  about: string;
  coverageQuestion: string;
  coverageAnswer: string;
  planningQuestion: string;
  planningAnswer: string;
  albums: string[];
};

// City photographs stay in their existing canadian-wedding/cities R2 folders.
// Keep these scene-setting selections separate from the complete client albums.
const described = (photo: Photo, alt: string): Photo => ({ ...photo, alt });
/* A frame from a complete wedding album (lib/galleries.ts). The pricing-page
   heroes are five of the city's own real photographs that roll one into the
   next (owner, 2026-10-01): Vancouver from the hub's work set, Toronto from the
   Niagara and Prince Edward County albums, Montréal from the Old Montréal
   album. The generated "places" PNGs that held these slots carry Higgsfield
   job ids. Every frame here was checked in the desktop and phone crops. */
const albumFrame = (slug: string, frame: string, alt: string): Photo => ({ src: `https://cdn.armanarai.ca/galleries/${slug}/${frame}.webp`, alt });
/** A photograph from the BC gallery (the Vancouver hub album) by its number. */
const bcFrame = (n: number, alt: string): Photo => ({ src: `https://cdn.armanarai.ca/cities/vancouver/hub/vancouver-hub-${String(n).padStart(2, "0")}.webp`, alt });

/** A photograph from the cities/ folder on the .ca bucket. */
const cityFrame = (key: string, alt: string): Photo => ({ src: `https://cdn.armanarai.ca/cities/${key}.webp`, alt });
const defaultAlbums = ["luca-lauren", "elisha-michael", "nicole-js"];

export const WEDDING_CITIES: WeddingCity[] = [
  {
    slug: "vancouver", name: "Vancouver",
    heroes: [
      described(CITY_WORK.vancouver[14], "A bride reclining on a motorboat at a Vancouver marina at sunset, the groom standing behind her"),
      described(CITY_WORK.vancouver[6], "A bride walking a white dog along a downtown Vancouver street at dusk"),
      CITY_WORK.vancouver[10],
      described(CITY_WORK.vancouver[0], "A rainbow over the mountains as a storm clears behind an outdoor ceremony"),
      described(CITY_WORK.vancouver[9], "A couple embracing beside the fountains of a formal garden"),
    ],
    interlude: [CITY_PHOTOS.vancouver.places[0], CITY_PHOTOS.vancouver.places[1], CITY_WORK.vancouver[3]],
    work: { eyebrow: "Recent work", title: ["Vancouver and", "the Sea-to-Sky."], lead: "Couples I’ve photographed across British Columbia, from the city’s gardens and beaches to the mountains an hour north.", place: "BC", photos: BC_WORK },
    coverage: ["Vancouver & the Lower Mainland", "North Shore & Sea-to-Sky"],
    about: "From a celebration downtown to a day on the North Shore or up the Sea-to-Sky, we’ll make a photography plan that fits your wedding.",
    coverageQuestion: "Do you cover the Lower Mainland and the Sea-to-Sky?",
    coverageAnswer: "Yes. Vancouver, Burnaby, Richmond, the North Shore, the Fraser Valley, Squamish and Whistler. Tell me your venue or the area you’re considering, and we’ll discuss the timeline and any travel before you book.",
    planningQuestion: "What if it rains on our wedding day?",
    planningAnswer: "We’ll plan a covered or indoor option for portraits alongside the outdoor locations. You can keep enjoying your day without having to make a new photography plan that morning.",
    albums: defaultAlbums,
  },
  {
    slug: "toronto", name: "Toronto",
    heroes: [
      albumFrame("elisha-michael", "035", "Guests throwing petals as a couple leaves a stone chapel in the Niagara hills"),
      albumFrame("eathon-jessica", "020", "A couple kissing under a floral arch at a glass pavilion in Prince Edward County"),
      albumFrame("elisha-michael", "016", "A couple holding hands through their vows at the flower-framed chapel door"),
      albumFrame("elisha-michael", "038", "A couple at the entrance of a candlelit reception tent at night"),
      albumFrame("elisha-michael", "036", "A couple forehead to forehead under her veil in golden autumn light"),
    ],
    interlude: [CITY_WORK.toronto[0], described(CITY_WORK.toronto[9], "A wedding party under umbrellas among blossoming trees in Niagara"), CITY_PHOTOS.toronto.places[1]],
    coverage: ["Toronto & the GTA", "City celebrations & Ontario weekends"],
    about: "From a downtown celebration to a garden wedding outside the city, we’ll make time for the portraits without losing the afternoon to travel. Your people and your plans come first.",
    coverageQuestion: "Do you photograph weddings across the GTA?",
    coverageAnswer: "Yes. Toronto, Mississauga, Oakville, Vaughan, Markham and the surrounding area. I also photograph weddings in Niagara, Prince Edward County and beyond. Tell me your venue and date; any travel is quoted separately before you book.",
    planningQuestion: "Our ceremony and reception are in different places. How do portraits fit?",
    planningAnswer: "We’ll look at the route together and choose a portrait location that fits it. Time for travel, family photographs and a covered backup goes into the plan, so you can spend more of the day with your guests.",
    albums: ["eathon-jessica", "elisha-michael", "luca-lauren"],
  },
  {
    slug: "montreal", name: "Montréal",
    heroes: [
      albumFrame("luca-lauren", "039", "The Notre-Dame Basilica interior in blue and gold as the bride's train follows her up the aisle"),
      albumFrame("luca-lauren", "038", "A couple seated before the priest under stained glass during their church ceremony"),
      { ...albumFrame("luca-lauren", "048", "A couple embracing on stone steps between tall columns in Old Montréal"), position: "50% 12%" },
      albumFrame("luca-lauren", "032", "A couple under pink flowers with the Montréal skyline behind them"),
      { ...albumFrame("luca-lauren", "050", "A bride and groom standing against an ivy-covered stone wall"), position: "50% 8%" },
    ],
    interlude: [CITY_PHOTOS.montreal.places[0], CITY_PHOTOS.montreal.places[2], CITY_PHOTOS.montreal.places[3]],
    coverage: ["Montréal & the surrounding area", "Old Port, city rooms & country estates"],
    about: "From a celebration in Old Montréal to a wedding in the Townships, we’ll plan portraits around the places you love and the time you want with your guests. A few quiet moments together, then back to the party.",
    coverageQuestion: "Do you cover weddings outside Montréal?",
    coverageAnswer: "Yes. Montréal, Laval, the South Shore, the Laurentians and the Eastern Townships. Share your venue and date on our call, and we’ll talk through coverage and any travel before you book.",
    planningQuestion: "Can we have Old Montréal portraits without leaving our guests for hours?",
    planningAnswer: "Yes. We’ll choose a small number of spots near your venue and allow time for walking, family photographs and a weather backup. You don’t need a long list of locations to come back with photographs you love.",
    albums: ["luca-lauren", "nicole-js", "parsa-marjan"],
  },
  {
    /* Calgary, sold with Banff and the Rockies (owner, 2026-10-01: "calgary
       (banff)"). The photographs are the Banff work in the cities/banff
       folder; the hub's own alt text is wrong for some of them, so each one
       here is described from the photograph itself. */
    slug: "calgary", name: "Calgary & Banff",
    heroes: [
      cityFrame("banff/banff-53", "A couple on a rock above the turquoise water of Moraine Lake, the peaks behind them"),
      cityFrame("banff/banff-14", "A couple at a flower-dressed ceremony arch on a lawn beneath the Rockies"),
      cityFrame("banff/banff-46", "A couple dancing on a mountain slope as the sun breaks through the pines"),
      cityFrame("banff/banff-25", "A couple close together with their guests behind them above a turquoise mountain lake"),
      cityFrame("banff/banff-54", "A couple embracing above a mountain lake under a pink evening sky"),
    ],
    interlude: [
      cityFrame("banff/banff-24", "A ceremony in a mountain meadow, guests standing among golden autumn trees"),
      cityFrame("banff/banff-55", "A couple laughing together in a wooden canoe on Lake Louise"),
      cityFrame("banff/banff-56", "Northern lights over a mountain lake behind a couple"),
    ],
    work: { eyebrow: "Recent work", title: ["Banff and", "the Rockies."], lead: "Couples I’ve photographed in the mountains west of Calgary.", place: "the Rockies", photos: BANFF_WORK },
    coverage: ["Calgary & area", "Banff, Canmore & the Rockies"],
    about: "From a celebration in Calgary to a ceremony in the Rockies, we’ll build the photography around your day, with room for mountain portraits and a plan for changing weather. Your people and your plans come first.",
    coverageQuestion: "Do you photograph weddings in Banff, Lake Louise and Canmore too?",
    coverageAnswer: "Yes. Calgary, Banff, Lake Louise, Canmore, Kananaskis and the Bow Valley.",
    planningQuestion: "Can mountain portraits fit around a full wedding day?",
    planningAnswer: "Yes. We’ll choose locations that suit your venue, the light and the time available, with an indoor or sheltered alternative. We’ll discuss access, travel time and any location requirements before settling the photography plan.",
    albums: defaultAlbums,
  },
  {
    /* Victoria has no folder of its own. Hatley Castle comes from the
       Vancouver work set and the rest from the BC gallery. The Vancouver
       Island frames that were here are copies of originals carrying Google's
       C2PA "AI-generated" label (Vancouver Island/*.png on the .com bucket,
       fingerprint-matched 2026-10-02), so they are not shown as his work. */
    slug: "victoria", name: "Victoria",
    heroes: [
      cityFrame("vancouver/work/40-hatley-castle-grand-front", "A couple seated on the lawn in front of Hatley Castle in late sun"),
      bcFrame(14, "A couple walking hand in hand through a formal garden with a fountain"),
      cityFrame("vancouver/work/20-castle-terrace-monochrome", "A couple holding hands on a castle terrace, black and white"),
      bcFrame(3, "A couple standing in a garden under purple wisteria"),
      bcFrame(18, "A couple walking the shoreline into the sun, her dress catching the light"),
    ],
    interlude: [
      cityFrame("vancouver/work/17-hatley-castle-walkway", "A couple on a stone walkway below Hatley Castle"),
      bcFrame(4, "A couple embracing in a Japanese garden beside a wooden gate"),
      bcFrame(13, "A couple sitting on the rocks below a waterfall"),
    ],
    work: { eyebrow: "Recent work", title: ["Weddings and couples", "across BC."], lead: "Couples I’ve photographed across British Columbia, from formal gardens and quiet beaches to the mountains.", place: "BC", photos: BC_WORK },
    coverage: ["Victoria & Greater Victoria", "Gardens, heritage rooms & the coast"],
    about: "From a garden ceremony to a celebration by the water, we’ll make space for photographs that feel like you. We’ll keep the portrait plan close to your day, so you can get back to the people who came to celebrate.",
    coverageQuestion: "Do you cover Greater Victoria and the rest of the island?",
    coverageAnswer: "Yes. Victoria, Oak Bay, Saanich, Sidney, the West Shore and weddings elsewhere on Vancouver Island.",
    planningQuestion: "What if the weather changes during our garden or coastal wedding?",
    planningAnswer: "We’ll choose a covered or indoor portrait option alongside the outdoor plan. If there’s a break in the weather, we can step out for a few photographs without turning the whole day into a photo session.",
    albums: defaultAlbums,
  },
];

export function weddingCityRoute(route: string) {
  const dark = route.endsWith("-dark");
  const city = WEDDING_CITIES.find((city) => city.slug === (dark ? route.slice(0, -5) : route));
  return city ? { city, theme: dark ? "dark" as const : "light" as const, path: `/wedding-photography/${route}` } : undefined;
}
