/* The "See how your day could feel" album on the pricing pages (owner,
 * 2026-10-05: "just put them in album section of landing pages").
 *
 * Two kinds of photograph live here and the difference matters.
 *
 * The cities/<city>/landing/ frames are generated: every original PNG in the
 * canadian-wedding bucket carries a Higgsfield `hf-job-id` text chunk, and the
 * Montréal set also carries a C2PA manifest. The WebP conversion drops both,
 * so provenance can only ever be read from the PNG, never from the CDN copy.
 * They are deliberately kept out of hub-work.ts, which is the file for real
 * client photographs.
 *
 * The galleries/<couple>/ frames are real client weddings, taken from the
 * complete albums with their own alt text.
 *
 * Nothing here is captioned as a wedding that happened; the section's heading
 * is a conditional and has always been.
 *
 * A city's album must never repeat its hero. Montréal and Toronto both did,
 * because neither had an album of its own and the section fell back to
 * `?? [...city.heroes]`, so scrolling from the hero reached the same
 * photographs again. overlapcheck covers it.
 *
 * Alt text is written from each photograph.
 */

import type { WorkPhoto } from "./hub-work";

const CDN = "https://cdn.armanarai.ca";
const frame = (city: string, n: string, alt: string, width: number, height: number): WorkPhoto => ({
  src: `${CDN}/cities/${city}/landing/${city}-landing-${n}.webp`,
  alt, width, height,
});

/** A frame from a complete wedding album on this site. Real client work. */
const gallery = (slug: string, n: string, alt: string, width: number, height: number): WorkPhoto => ({
  src: `${CDN}/galleries/${slug}/${n}.webp`, alt, width, height,
});

/** Calgary, the foothills and the ranch country: the second batch is Western,
 *  so the order alternates the city and the Stampede side of it. */
export const CALGARY_LANDING: WorkPhoto[] = [
  frame("calgary", "08", "A couple riding one horse across the foothills at sunset, the Rockies behind them", 2016, 1344),
  frame("calgary", "01", "A couple on the red arches of the Peace Bridge, the Calgary skyline behind them in falling snow", 2048, 1152),
  frame("calgary", "10", "A couple at the rail of a floodlit rodeo arena as a rider crosses the dust behind them", 1152, 2048),
  frame("calgary", "06", "A couple in cowboy hats, the bride laughing under her veil, black and white", 2048, 2048),
  frame("calgary", "03", "A couple alone in a prairie field as lightning breaks over the mountains at sunset", 2048, 1152),
  frame("calgary", "07", "A bride resting her head against a horse in a barn doorway, her partner beside her in a cowboy hat", 1536, 2048),
  frame("calgary", "02", "A bride laughing under her veil in low golden light, her partner close behind her", 1536, 2048),
  frame("calgary", "05", "A couple beside a red prairie barn as the sun goes down behind the fields", 1344, 2016),
  frame("calgary", "09", "A couple in a vintage car at night, the bride lying back across the seat", 1344, 2016),
  frame("calgary", "04", "A couple nose to nose in deep cold, frost on their hair and lashes", 1344, 2016),
];

/** Montréal through the seasons.
 *
 *  Montréal is the one city whose hero frames are also generated, so this list
 *  has to be the ones the hero does not use. Scrolling from a hero to an album
 *  showing the same four photographs is what it looked like before. Frames 07,
 *  01, 03 and 09 are the hero's, and they are deliberately absent here; the
 *  Luca & Lauren frames the hero gave up are in, which also puts real
 *  photographs back into this section. */
export const MONTREAL_LANDING: WorkPhoto[] = [
  frame("montreal", "06", "A couple walking a wet street carpeted with pink blossom between city rowhouses", 2048, 1152),
  gallery("luca-lauren", "048", "A couple embracing on stone steps between tall columns in Old Montréal", 1024, 1536),
  frame("montreal", "08", "A couple close together under red paper lanterns at night", 2048, 2048),
  gallery("luca-lauren", "032", "A couple under pink flowers with the Montréal skyline behind them", 1023, 1537),
  frame("montreal", "10", "A couple under a veil among cherry blossom", 1536, 2048),
  gallery("luca-lauren", "038", "A couple seated before the priest under stained glass during their church ceremony", 1024, 1536),
  frame("montreal", "02", "A bride's face lit by candles, her partner's hand at her cheek", 1536, 2048),
  gallery("luca-lauren", "050", "A bride and groom standing against an ivy-covered stone wall", 1024, 1536),
  frame("montreal", "04", "A bride in long grass beneath wind-bent trees under a heavy sky", 2016, 1344),
];

/** Toronto, Niagara and Prince Edward County: two real weddings, alternating,
 *  and none of the five frames its hero already uses. */
export const TORONTO_LANDING: WorkPhoto[] = [
  gallery("eathon-jessica", "021", "The first kiss under the floral arch as the guests rise", 1023, 1537),
  gallery("elisha-michael", "021", "The sailcloth tent lit over the vineyard rows at dusk", 1536, 1024),
  gallery("eathon-jessica", "013", "Jessica in the open field at golden hour", 1023, 1537),
  gallery("elisha-michael", "034", "The couple walking the vineyard rows at sunset", 1536, 1024),
  gallery("eathon-jessica", "043", "The couple under a clear umbrella in a summer shower", 1023, 1537),
  gallery("elisha-michael", "015", "The stone chapel from above, guests seated along the path", 1024, 1536),
  gallery("eathon-jessica", "026", "The champagne tower being poured", 1023, 1537),
  gallery("elisha-michael", "012", "A harpist playing under the autumn canopy", 1024, 1536),
];

/** Victoria, its gardens and the coast. */
export const VICTORIA_LANDING: WorkPhoto[] = [
  frame("victoria", "03", "A couple on a stone bridge below a castle in autumn mist", 2048, 1536),
  frame("victoria", "01", "A couple walking a meadow of blue wildflowers under old oaks as the sun breaks through", 2016, 1344),
  frame("victoria", "04", "A couple under string lights beside the painted float homes on the water", 2048, 2048),
  frame("victoria", "05", "A bride on a fallen log in a rainforest gorge, mist between the trees", 1152, 2048),
  frame("victoria", "02", "A couple laughing together in the rain, black and white", 1536, 2048),
];
