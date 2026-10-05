/* Photographs from the armanarai.com city hubs, shown on the pricing pages as
 * samples of similar work (owner, 2026-10-02: "BC gallery is on vancouver hub
 * on armanarai.com (use those pictures); same goes for other cities").
 *
 * Copied into the .ca bucket (cities/<city>/hub/) as WebP so they load like
 * every other photograph here. Generated from the hub albums by the import
 * script; the order is the one the pages show. Left out on purpose, because
 * the original file carries Google's C2PA "AI-generated" label: the Lions Gate
 * couple from the Vancouver album, 00007.png from the Banff album, and every
 * frame of the Tofino / Vancouver Island album. The Québec hub says in its own
 * code that its photographs are not from a client shoot, so Montréal has none.
 * Alt text is written from each photograph. */

export type WorkPhoto = { src: string; alt: string; width: number; height: number };
const CDN = "https://cdn.armanarai.ca";

/** The BC gallery: the Vancouver hub's "What I've Shot" album. */
export const BC_WORK: WorkPhoto[] = [
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-14.webp`, alt: "A couple walking hand in hand through a formal garden with a fountain", width: 1611, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-12.webp`, alt: "A couple under pink cherry blossoms at dusk", width: 1342, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-33.webp`, alt: "A bride with a white dog on a city street at dusk", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-37.webp`, alt: "A couple under an umbrella beside the pixelated orca sculpture, black and white", width: 1493, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-03.webp`, alt: "A couple standing in a garden under purple wisteria", width: 1200, height: 1800 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-09.webp`, alt: "A groom leaning over his bride by lantern light on a beach at sunset", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-23.webp`, alt: "A couple on a covered terrace among the trees at dusk", width: 1342, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-32.webp`, alt: "A groom leaning on a tree as his bride reaches for his hand in a park", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-18.webp`, alt: "A couple walking the shoreline into the sun, her dress catching the light", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-10.webp`, alt: "A couple laughing at a candlelit dinner table on a mountainside", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-26.webp`, alt: "A couple kissing beneath cherry blossoms in a park", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-34.webp`, alt: "A groom beside a vintage car as his bride steps out, black and white", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-01.webp`, alt: "A couple walking a path through a tall green forest", width: 1800, height: 1200 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-02.webp`, alt: "A bride by the water, her dress lifting in the wind, mountains across the bay", width: 1800, height: 1200 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-04.webp`, alt: "A couple embracing in a Japanese garden beside a wooden gate", width: 1800, height: 1200 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-05.webp`, alt: "A couple on a grassy summit with mountains and clouds behind them", width: 1800, height: 1200 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-06.webp`, alt: "A couple in a snowy clearing among tall evergreens", width: 1800, height: 1200 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-07.webp`, alt: "A couple on a rocky summit above a valley of mountains", width: 1800, height: 1200 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-08.webp`, alt: "A couple holding hands with their officiant in a snow-covered forest", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-11.webp`, alt: "A couple on the rocks beside a rushing mountain river", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-13.webp`, alt: "A couple sitting on the rocks below a waterfall", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-15.webp`, alt: "A couple laughing together on a beach at golden hour", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-16.webp`, alt: "A couple among giant old-growth trees in a dark forest", width: 2000, height: 1333 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-17.webp`, alt: "A couple sitting on a fallen tree beside a green meadow", width: 2000, height: 1342 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-19.webp`, alt: "A couple riding a ski chairlift, she in her gown and he in a top hat", width: 2000, height: 1333 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-20.webp`, alt: "A bride standing on the bow of a sailboat at sunset", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-21.webp`, alt: "A couple embracing under cherry blossoms against an evening sky", width: 2000, height: 1342 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-22.webp`, alt: "A bride reclining in her dress beside the water on an overcast day", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-25.webp`, alt: "A couple walking through a misty meadow in soft morning light", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-27.webp`, alt: "A couple laughing in falling snow, her bouquet bright red and orange", width: 1333, height: 2000 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-28.webp`, alt: "A couple kissing on a snowy summit with a helicopter overhead", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-29.webp`, alt: "A couple lying beside a boat on a dark harbour at night", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-30.webp`, alt: "A couple framed by pink cherry blossoms in front of a house", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-31.webp`, alt: "A couple beneath a wide old tree in a misty valley", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-35.webp`, alt: "A bride lying at the water's edge on a beach at sunset", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/hub/vancouver-hub-36.webp`, alt: "A bride smiling with her bouquet, black and white", width: 2000, height: 1500 },
];

/** The Banff hub's "A few of mine" album. */
export const BANFF_WORK: WorkPhoto[] = [
  { src: `${CDN}/cities/banff/hub/banff-hub-01.webp`, alt: "A couple standing in a turquoise mountain lake below a glacier", width: 1333, height: 2000 },
  { src: `${CDN}/cities/banff/hub/banff-hub-03.webp`, alt: "A couple forehead to forehead with the mountains behind them", width: 1500, height: 2000 },
  { src: `${CDN}/cities/banff/hub/banff-hub-04.webp`, alt: "A couple holding hands on a ridge in golden mountain light", width: 1333, height: 2000 },
  { src: `${CDN}/cities/banff/hub/banff-hub-07.webp`, alt: "A couple in a wooden canoe on a mountain lake", width: 1500, height: 2000 },
  { src: `${CDN}/cities/banff/hub/banff-hub-02.webp`, alt: "A man in red dress uniform kissing the bride's hand on a mountain lookout", width: 1333, height: 2000 },
  { src: `${CDN}/cities/banff/hub/banff-hub-05.webp`, alt: "A couple kissing on a snowy summit with a helicopter overhead", width: 2000, height: 1500 },
];

/** New Vancouver photographs the owner uploaded (canadian-wedding/"New
 *  Vancouver Images/", 2026-10-04), copied as WebP to cities/vancouver/new/.
 *  Image 16 is the same photograph as image 1, so it is used once. */
const VANCOUVER_NEW: WorkPhoto[] = [
  { src: `${CDN}/cities/vancouver/new/vancouver-new-06.webp`, alt: "A couple on the deck of a sailboat, her veil blowing in the wind", width: 1333, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-10.webp`, alt: "A couple among red and orange autumn leaves", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-08.webp`, alt: "A couple on a stone bridge in a garden beside a waterfall", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-02.webp`, alt: "A couple under a clear umbrella on a rain-soaked street at night", width: 1125, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-14.webp`, alt: "A couple standing in a beam of light in a misty old-growth forest", width: 1125, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-12.webp`, alt: "A couple dancing on the stage of an ornate theatre, her train spread behind her", width: 2000, height: 1333 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-13.webp`, alt: "A couple dancing through a shower of sparks at night", width: 2000, height: 1333 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-03.webp`, alt: "A couple in a snowy forest, her red cape over her gown", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-05.webp`, alt: "A couple beside a vintage car under golden autumn trees in front of a Tudor house", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-11.webp`, alt: "A couple on the steps of a stone building surrounded by autumn trees", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-09.webp`, alt: "A bride in red and her groom under an umbrella in a garden hung with paper lanterns", width: 1500, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-04.webp`, alt: "A couple sitting on the edge of a pool beside a red and white lifeguard tower", width: 2000, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-07.webp`, alt: "A couple in the middle of a green hedge maze, seen from above", width: 2000, height: 1500 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-15.webp`, alt: "A couple kissing in smoke lit by a single light at night", width: 1333, height: 2000 },
  { src: `${CDN}/cities/vancouver/new/vancouver-new-01.webp`, alt: "A bride holding her veil across her face below a tall window, black and white", width: 1333, height: 2000 },
];

/** The Vancouver album: the first four of the BC gallery, then the new
 *  photographs in place of the rest (owner, 2026-10-04: "pictures from 05/36
 *  to 36/36 are not good anyways so replace them with this new images"). */
export const VANCOUVER_WORK: WorkPhoto[] = [...BC_WORK.slice(0, 4), ...VANCOUVER_NEW];

