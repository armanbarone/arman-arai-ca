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

/* ── First-touch attribution ────────────────────────────────────────────────
 * The site's own forms (the inquiry modal in the header, and /contact) are
 * reached after browsing, so the URL they sit on no longer carries the ?utm_*
 * tags of the ad click. gclid and fbclid survive in the Google and Meta
 * cookies; the utm tags do not survive anywhere. So the first pageview of the
 * visit is stored, and the lead is sent with that rather than with whatever
 * the submit page happens to know. */

const FIRST_TOUCH_KEY = "aa_attribution";

export type Attribution = Record<string, string>;

/** What this pageview can see: its own URL, the ad cookies and the referrer. */
function readAttribution(): Attribution {
  const query = new URLSearchParams(window.location.search);
  const captured: Attribution = { page: window.location.pathname, referrer: document.referrer || "" };
  for (const key of ATTRIBUTION_KEYS) {
    const value = query.get(key);
    if (value) captured[key] = value;
  }
  const gclid = query.get("gclid") || query.get("wbraid") || query.get("gbraid") || gclidFromCookie();
  const fbclid = query.get("fbclid") || fbclidFromCookie();
  if (gclid) captured.gclid = gclid;
  if (fbclid) captured.fbclid = fbclid;
  return captured;
}

/** Store the visit's first pageview. Later pageviews never overwrite it: the
 *  ad click is the first hit of the visit, not the page the form sits on. */
export function captureFirstTouch() {
  try {
    if (sessionStorage.getItem(FIRST_TOUCH_KEY)) return;
    sessionStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(readAttribution()));
  } catch { /* Private mode or blocked storage. The lead still sends. */ }
}

/** The attribution to send with a lead. The first touch owns the campaign
 *  tags; `page` stays the page they actually sent the form from. Empty stored
 *  values never clobber what this pageview can still read, which covers a
 *  cookie written by gtag after the first pageview was stored. */
export function leadAttribution(): Attribution {
  const live = readAttribution();
  let stored: Attribution = {};
  try { stored = JSON.parse(sessionStorage.getItem(FIRST_TOUCH_KEY) || "{}") || {}; } catch { /* nothing stored */ }
  const first = Object.fromEntries(Object.entries(stored).filter(([, value]) => typeof value === "string" && value));
  return { ...live, ...first, page: live.page };
}
