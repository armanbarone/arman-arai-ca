import { CITY_PHOTOS, CITY_WORK, HOME_GRID, HOME_HERO_POOL, type Photo } from "../images";
import { GALLERIES } from "../galleries";

export type WeddingCity = {
  slug: string;
  name: string;
  hero: Photo;
  heroPosition?: string;
  inset: Photo;
  interlude: Photo[];
  coverage: [string, string];
  about: string;
  coverageQuestion: string;
  coverageAnswer: string;
  planningQuestion: string;
  planningAnswer: string;
  albums: string[];
};

const photograph = (slug: string, number: string): Photo => {
  const image = GALLERIES.find((gallery) => gallery.slug === slug)!.chapters
    .flatMap((chapter) => chapter.images).find((image) => image.url.endsWith(`/${number}.webp`))!;
  return { src: image.url, alt: image.alt };
};

// Scene-setting images from the existing .com hubs stay separate from the
// complete client albums below. Their filenames retain the source provenance.
const banff = (name: string, alt: string): Photo => ({ src: `https://cdn.armanarai.com/elopement/banff-hub/${name}.webp`, alt });
const hatley = (number: number, alt: string): Photo => ({
  src: `https://cdn.armanarai.com/${encodeURI(`Vancouver Island/Vancouver Island Elopement - Arman Arai New (${number}).png`)}`,
  alt,
});
const defaultAlbums = ["luca-lauren", "elisha-michael", "nicole-js"];

export const WEDDING_CITIES: WeddingCity[] = [
  {
    slug: "vancouver", name: "Vancouver",
    hero: CITY_PHOTOS.vancouver.hero,
    inset: CITY_WORK.vancouver[15],
    interlude: [CITY_PHOTOS.vancouver.places[0], CITY_PHOTOS.vancouver.places[1], CITY_WORK.vancouver[3]],
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
    hero: { ...photograph("eathon-jessica", "013"), alt: "A wedding couple with their dog in a sunlit garden" }, inset: HOME_HERO_POOL[14],
    interlude: [photograph("eathon-jessica", "028"), photograph("elisha-michael", "001"), HOME_GRID[5]],
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
    hero: photograph("luca-lauren", "011"), heroPosition: "48% center",
    inset: photograph("parsa-marjan", "004"),
    interlude: [photograph("luca-lauren", "001"), photograph("nicole-js", "053"), photograph("parsa-marjan", "005")],
    coverage: ["Montréal & the surrounding area", "Old Port, city rooms & country estates"],
    about: "From a celebration in Old Montréal to a wedding in the Townships, we’ll plan portraits around the places you love and the time you want with your guests. A few quiet moments together, then back to the party.",
    coverageQuestion: "Do you cover weddings outside Montréal?",
    coverageAnswer: "Yes. Montréal, Laval, the South Shore, the Laurentians and the Eastern Townships. Share your venue and date on our call, and we’ll talk through coverage and any travel before you book.",
    planningQuestion: "Can we have Old Montréal portraits without leaving our guests for hours?",
    planningAnswer: "Yes. We’ll choose a small number of spots near your venue and allow time for walking, family photographs and a weather backup. You don’t need a long list of locations to come back with photographs you love.",
    albums: ["luca-lauren", "nicole-js", "parsa-marjan"],
  },
  {
    slug: "banff", name: "Banff",
    hero: banff("hero", "A wedding couple in the mountains of Banff"),
    inset: banff("real-lakelouise", "A couple together beside the turquoise water of Lake Louise"),
    interlude: [banff("real-minnewanka", "A wedding couple in a canoe on Lake Minnewanka"), banff("act-dinner", "A candlelit table on a mountain lodge terrace"), HOME_GRID[5]],
    coverage: ["Banff & Lake Louise", "Canmore & the Bow Valley"],
    about: "A mountain backdrop, your favourite people, and time to take it all in. We’ll build the photography around your ceremony and reception, with room for portraits and a plan for changing weather.",
    coverageQuestion: "Do you photograph weddings in Lake Louise and Canmore too?",
    coverageAnswer: "Yes. Banff, Lake Louise, Canmore and the Bow Valley. Tell me where your ceremony and reception will be, and we’ll work through coverage, portrait locations and any travel together.",
    planningQuestion: "Can mountain portraits fit around a full wedding day?",
    planningAnswer: "Yes. We’ll choose locations that suit your venue, the light and the time available, with an indoor or sheltered alternative. We’ll discuss access, travel time and any location requirements before settling the photography plan.",
    albums: defaultAlbums,
  },
  {
    slug: "victoria", name: "Victoria",
    hero: hatley(1, "A wedding couple in the knot garden below Hatley Castle in Greater Victoria"),
    inset: hatley(6, "Hatley Castle lit at blue hour, seen from the garden urn walk"),
    interlude: [hatley(6, "The illuminated stone facade and gardens of Hatley Castle at blue hour"), HOME_GRID[3], HOME_GRID[5]],
    coverage: ["Victoria & Greater Victoria", "Gardens, heritage rooms & the coast"],
    about: "From a garden ceremony to a celebration by the water, we’ll make space for photographs that feel like you. We’ll keep the portrait plan close to your day, so you can get back to the people who came to celebrate.",
    coverageQuestion: "Do you cover Greater Victoria and the rest of the island?",
    coverageAnswer: "Yes. Victoria, Oak Bay, Saanich, Sidney, the West Shore and weddings elsewhere on Vancouver Island. Share your venue and date, and we’ll confirm the coverage and any travel costs before you book.",
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
