/* "My price against everybody else" (owner, 2026-11-15).
 *
 * This lived in the welcome email until 2026-11-23, when the owner moved it
 * to the wedding guide. The data lives here so there is one copy of it
 * wherever it is shown.
 *
 * The right-hand column is what C$3,000 buys from a Canadian wedding
 * photographer in 2026 according to the published pricing guides, checked
 * across several of them on 2026-11-15: Bridebook's Canadian photography and
 * videography guides, Bark's Canadian videography prices, Candid Studios'
 * 2026 pricing statistics, Ruah Creative House on film pricing, and Imagen's
 * delivery-turnaround guide. They disagree on exact averages, so nothing here
 * is printed as a statistic: every cell is a range or a "usually", which is
 * what the sources actually support. No competitor is named, and the left
 * column is read from TIERS so it can never drift from the real collection.
 *
 * If you widen a claim here, source it first. An overstated market claim is
 * the one thing on these pages a couple can catch out.
 */

import { ENTRY, type Tier } from "./site";

export const MARKET_ROWS: [string, (tier: Tier) => string, string][] = [
  ["Hours on the day", (tier) => tier.coverage, "6 to 8, charged by the hour beyond that"],
  ["Edited images", (tier) => tier.images, "300 to 600, sometimes web-size only"],
  ["First look at them", (tier) => tier.preview, "a handful of favourites within a few days"],
  ["Full gallery", (tier) => tier.delivery, "4 to 8 weeks, and 8 to 12 in peak season"],
  ["Engagement session", (tier) => tier.engagement, "an add-on, priced separately"],
  ["A film of your day", (tier) => tier.film, "not offered; a separate videographer is usually C$2,000 to C$4,000"],
  ["Real 35mm film", (tier) => tier.rolls, "not offered"],
  ["Vertical reels", () => "Cut from the day, in the first week", "rarely offered"],
];

export const MARKET_TITLE = "The same money, a different list.";

const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The comparison as a block for the wedding guide, in the guide's own
 *  classes so it needs no CSS of its own. The tier it compares against is
 *  the entry collection, read from lib/site.ts, so the heading figure and
 *  the left-hand column cannot drift from the real price. */
export function marketComparisonHtml(tier: Tier = ENTRY) {
  const rows = MARKET_ROWS.map(
    ([label, mine, theirs]) =>
      `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(mine(tier))}</td><td>${escapeHtml(theirs)}</td></tr>`,
  ).join("");
  return `<div class="market-compare">
  <p class="eyebrow">My price against everybody else's</p>
  <h3>${escapeHtml(MARKET_TITLE)}</h3>
  <p>What ${money(tier.price)} usually buys from a wedding photographer in Canada, against what it buys here. The right-hand column is drawn from the published Canadian pricing guides for 2026, not from one studio.</p>
  <div class="table-scroll"><table><caption class="visually-hidden">${escapeHtml(tier.name)} against the typical Canadian collection at the same price</caption>
    <thead><tr><th scope="col"></th><th scope="col">${escapeHtml(tier.name)} · ${money(tier.price)}</th><th scope="col">Typical at this price</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <p class="small-text">Legacy and Photo + Film widen the same gap: a second photographer, a printed album, and in Photo + Film a filmmaker beside me for all twelve hours rather than a second vendor you book and brief yourself. Prices in CAD, before tax.</p>
</div>`;
}
