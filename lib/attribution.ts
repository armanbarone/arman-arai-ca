/* Ad attribution read in the browser and sent with a lead, so the lead email
   can name the campaign and click that produced it. */

export const ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
] as const;

/** Google Ads writes the click id into _gcl_aw as "GCL.<ts>.<gclid>". Reading
 *  it back covers a visitor who lands on the ad and comes back to the form on a
 *  URL that no longer carries ?gclid. */
/** Meta's pixel keeps the click id in _fbc as "fb.<n>.<ts>.<fbclid>", for a
 *  visitor whose URL no longer carries ?fbclid. */
export function fbclidFromCookie(): string {
  const m = /(?:^|;\s*)_fbc=([^;]*)/.exec(document.cookie);
  if (!m) return "";
  const parts = decodeURIComponent(m[1]).split(".");
  return parts.length >= 4 ? parts.slice(3).join(".") : "";
}

export function gclidFromCookie(): string {
  const m = /(?:^|;\s*)_gcl_aw=([^;]*)/.exec(document.cookie);
  if (!m) return "";
  const parts = decodeURIComponent(m[1]).split(".");
  return parts.length >= 3 ? parts.slice(2).join(".") : "";
}
