/* The album on the Calgary, Montréal and Victoria pricing pages (owner,
 * 2026-10-05: "just put them in album section of landing pages").
 *
 * These are generated frames, not client shoots: every original PNG in the
 * canadian-wedding bucket carries a Higgsfield `hf-job-id` text chunk, and the
 * Montréal set also carries a C2PA manifest. The WebP conversion drops both,
 * so provenance can only be read from the PNGs, never from the CDN copy.
 *
 * They sit under the fixed heading "See how your day could feel", which is
 * what the section has always said, so nothing here is presented as a wedding
 * that happened. They are deliberately kept out of hub-work.ts, which is the
 * file for real client photographs, and out of the complete wedding albums
 * underneath, which are real.
 *
 * Alt text is written from each photograph.
 */

import type { WorkPhoto } from "./hub-work";

const CDN = "https://cdn.armanarai.ca";
const frame = (city: string, n: string, alt: string, width: number, height: number): WorkPhoto => ({
  src: `${CDN}/cities/${city}/landing/${city}-landing-${n}.webp`,
  alt, width, height,
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

/** Montréal through the seasons. */
export const MONTREAL_LANDING: WorkPhoto[] = [
  frame("montreal", "07", "A couple on a snowy path below the lit cross on Mount Royal", 1152, 2048),
  frame("montreal", "01", "A couple under a street lamp on a snowy cobblestone street in Old Montréal", 1344, 2016),
  frame("montreal", "06", "A couple walking a wet street carpeted with pink blossom between city rowhouses", 2048, 1152),
  frame("montreal", "03", "A couple forehead to forehead through branches of red maple", 1536, 2048),
  frame("montreal", "09", "A couple against a wall of red autumn ivy on a stone building", 2048, 2048),
  frame("montreal", "08", "A couple close together under red paper lanterns at night", 2048, 2048),
  frame("montreal", "10", "A couple under a veil among cherry blossom", 1536, 2048),
  frame("montreal", "02", "A bride's face lit by candles, her partner's hand at her cheek", 1536, 2048),
  frame("montreal", "04", "A bride in long grass beneath wind-bent trees under a heavy sky", 2016, 1344),
];

/** Victoria, its gardens and the coast. */
export const VICTORIA_LANDING: WorkPhoto[] = [
  frame("victoria", "03", "A couple on a stone bridge below a castle in autumn mist", 2048, 1536),
  frame("victoria", "01", "A couple walking a meadow of blue wildflowers under old oaks as the sun breaks through", 2016, 1344),
  frame("victoria", "04", "A couple under string lights beside the painted float homes on the water", 2048, 2048),
  frame("victoria", "05", "A bride on a fallen log in a rainforest gorge, mist between the trees", 1152, 2048),
  frame("victoria", "02", "A couple laughing together in the rain, black and white", 1536, 2048),
];
