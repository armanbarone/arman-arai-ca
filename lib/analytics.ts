/** Public marketing measurement. No names, emails or Calendly payloads are sent.
 *  Google and Meta load on the first view of any public page. The private client
 *  portal, the admin pages and the API routes carry no advertising tags. */
/** This site's OWN GA4 property. It is deliberately not G-V2GKTHF0W6, which is
 *  armanarai.com's and was collecting both domains into one property. Google
 *  Ads links to a GA4 *property*, not a data stream, so one shared property can
 *  never feed the Elopements and Weddings accounts separately: each account saw
 *  traffic from both websites. Keep this property for the .ca alone. */
export const GA4_ID = "G-W7PGHWW7MF";
/** The "Arman Arai Weddings" Google tag, which is this site's own tag.
 *  GT-W6VMNGBQ, AW-18464850778 and GT-WV3WTKLQ are three IDs for ONE container:
 *  loading any of them loads the same thing, so the script is requested once,
 *  by the GT- ID Google's own install screen hands out. Destinations are then
 *  managed in the Google tag UI rather than by editing this file.
 *  Do not add a second <script> for AW-18464850778; that double-loads it. */
export const WEDDINGS_TAG_ID = "GT-W6VMNGBQ";
/** The same container addressed by its Ads ID: the Google Ads account this site
 *  belongs to. Nothing reads it now, because a booked call is measured by the
 *  BOOKING_EVENT key event and imported from GA4, and an imported conversion
 *  carries no send_to. Kept so the account this site reports into is written
 *  down somewhere, and for the day a snippet-based conversion is added here. */
export const GOOGLE_ADS_ID = "AW-18464850778";
export const META_PIXEL_ID = "1110472461323039";
/* AW-18154542346 ("Arman Arai Elopements") used to load here, and a booked call
   on this site was reported to it with that account's own conversion label.
   That is armanarai.com's Ads account, and it is the reason the two accounts
   each appeared to see the other site's traffic. It is deliberately gone.
   A booked call is now measured by the BOOKING_EVENT key event below, imported
   into "Arman Arai Weddings" (AW-18464850778) from this site's own GA4
   property. Do not reintroduce another site's tag here to record a conversion:
   a conversion label belongs to the account that created it, so borrowing one
   credits the wrong account and pollutes both. */
/** The GA4 event that means "a discovery call was actually booked", and nothing
 *  else. Mark THIS as the key event in GA4 and import it into Google Ads as the
 *  primary conversion. It is deliberately not `generate_lead`, which this site
 *  also fires from the date-check form and the promo lead form. An Ads account
 *  bidding on generate_lead optimises toward form fills rather than bookings. */
export const BOOKING_EVENT = "book_appointment";
export const BOOKING_KEY = "aa_ca_completed_booking_v1";
const SENT_KEY = "aa_ca_booking_events_v1";
const BOOKING_LIFETIME = 30 * 60 * 1000;
export type Booking = { id: string; page: string; createdAt: number };
type Tag = (...args: unknown[]) => void;
type MetaTag = Tag & { queue: IArguments[]; callMethod?: Tag; push?: MetaTag; loaded?: boolean; version?: string };
type TrackingWindow = Window & { dataLayer?: unknown[]; gtag?: Tag; fbq?: MetaTag; _fbq?: MetaTag };
let initialized = false;
let suspended = false;
let googleReady: Promise<boolean> | undefined;
let metaReady: Promise<boolean> | undefined;
let lastPage = "";
let reporting: Promise<void> | undefined;
const sentInMemory = new Set<string>();

export function isPublicTrackingPath(path: string) {
  return !/^\/(portal|admin|api)(?:\/|$)/.test(path);
}

function permitted() {
  return typeof window !== "undefined" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname) &&
    isPublicTrackingPath(window.location.pathname);
}

/** The tags' own on/off switch, used only to silence them inside the portal. */
function setTagState(on: boolean) {
  if (!initialized) return;
  const w = window as TrackingWindow;
  const status = on ? "granted" : "denied";
  w.gtag?.("consent", "update", { analytics_storage: status, ad_storage: status, ad_user_data: status, ad_personalization: status });
  w.fbq?.("consent", on ? "grant" : "revoke");
}

function loadTag(id: string, src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    const timeout = window.setTimeout(() => resolve(false), 8000);
    script.onload = () => { clearTimeout(timeout); script.dataset.loaded = "true"; resolve(true); };
    script.onerror = () => { clearTimeout(timeout); resolve(false); };
    document.head.appendChild(script);
  });
}

export function startTracking() {
  if (!permitted()) return;
  if (initialized) {
    if (suspended) {
      suspended = false;
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = false;
      setTagState(true);
    }
    return;
  }
  initialized = true;
  const w = window as TrackingWindow;
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer!.push(arguments); };
  w.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  w.gtag("js", new Date());
  w.gtag("config", GA4_ID, { send_page_view: false });
  // One config per container. GOOGLE_ADS_ID is the same tag as WEDDINGS_TAG_ID,
  // so configuring both would send this site's page views to Ads twice.
  w.gtag("config", WEDDINGS_TAG_ID);
  googleReady = loadTag("aa-google-tag", `https://www.googletagmanager.com/gtag/js?id=${WEDDINGS_TAG_ID}`);

  if (!w.fbq) {
    const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments as unknown as unknown[]) : fbq.queue.push(arguments); } as MetaTag;
    fbq.queue = []; fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0";
    w.fbq = fbq; w._fbq = fbq;
  }
  w.fbq("set", "autoConfig", false, META_PIXEL_ID);
  w.fbq("init", META_PIXEL_ID);
  metaReady = loadTag("aa-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
}

/** Also stop already-loaded tags after a client-side move into private pages. */
export function suspendTracking() {
  if (!initialized) return;
  suspended = true;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = true;
  setTagState(false);
}

export function trackPageView() {
  if (!permitted()) return;
  startTracking();
  // Never forward arbitrary query parameters (for example a form email).
  const location = new URL(window.location.pathname, window.location.origin);
  const incoming = new URLSearchParams(window.location.search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"]) {
    const value = incoming.get(key);
    if (value) location.searchParams.set(key, value);
  }
  if (lastPage === location.href) return;
  lastPage = location.href;
  const w = window as TrackingWindow;
  w.gtag?.("event", "page_view", { send_to: GA4_ID, page_location: location.href, page_title: document.title });
  w.fbq?.("track", "PageView");
}

export function trackLead(method: string) {
  if (!permitted()) return;
  startTracking();
  const w = window as TrackingWindow;
  w.gtag?.("event", "generate_lead", { send_to: GA4_ID, method, currency: "CAD" });
  w.fbq?.("track", "Lead");
}

export function bookingFromMessage(data: unknown, page: string, fallbackId: string, now = Date.now()): Booking {
  const payload = (data as { payload?: { invitee?: { uri?: string }; event?: { uri?: string } } })?.payload;
  let id = fallbackId;
  try {
    const uri = new URL(payload?.invitee?.uri || payload?.event?.uri || "");
    const token = uri.pathname.split("/").filter(Boolean).at(-1);
    if (uri.origin === "https://api.calendly.com" && token && /^[a-z0-9-]{6,80}$/i.test(token)) id = token;
  } catch { /* Completion works even without optional booking metadata. */ }
  return { id: `ca-${id}`, page: page.split("?")[0], createdAt: now };
}

export function validBooking(value: unknown, now = Date.now()): value is Booking {
  if (!value || typeof value !== "object") return false;
  const b = value as Booking;
  return typeof b.id === "string" && /^ca-[a-z0-9-]{6,100}$/i.test(b.id) && typeof b.page === "string" && b.page.startsWith("/") && typeof b.createdAt === "number" && now >= b.createdAt && now - b.createdAt < BOOKING_LIFETIME;
}

function wasSent(key: string) {
  if (sentInMemory.has(key)) return true;
  try { return (JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]") as string[]).includes(key); } catch { return false; }
}
function markSent(key: string) {
  sentInMemory.add(key);
  try {
    const keys = JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]") as string[];
    sessionStorage.setItem(SENT_KEY, JSON.stringify([...keys, key].slice(-100)));
  } catch { /* In-memory deduplication remains active. */ }
}

async function reportBooking(booking: Booking) {
  if (!permitted()) return;
  startTracking();
  await Promise.all([
    googleReady?.then((ready) => {
      const key = `google:${booking.id}`;
      if (!ready || !permitted() || wasSent(key)) return;
      const w = window as TrackingWindow;
      // A booked call ONLY. Mark this one as the GA4 key event and import it
      // into Google Ads: generate_lead below also fires on the date-check form
      // and the promo lead form, so bidding on generate_lead would chase form
      // fills, which are far cheaper to produce and worth much less.
      w.gtag?.("event", BOOKING_EVENT, { send_to: GA4_ID, method: "calendly_booking", landing_page: booking.page, transaction_id: booking.id, currency: "CAD" });
      w.gtag?.("event", "generate_lead", { send_to: GA4_ID, method: "calendly_booking", landing_page: booking.page, currency: "CAD" });
      markSent(key);
    }),
    metaReady?.then((ready) => {
      const key = `meta:${booking.id}`;
      if (!ready || !permitted() || wasSent(key)) return;
      (window as TrackingWindow).fbq?.("track", "Schedule", { content_name: "Wedding photography discovery call", content_category: booking.page }, { eventID: booking.id });
      markSent(key);
    }),
  ]);
}

/** Only the trusted Calendly completion handler calls this. Ordinary thank-you
 * visits never create a marker and therefore never count as conversions. */
export async function completeWeddingBooking(data: unknown) {
  const booking = bookingFromMessage(data, window.location.pathname, crypto.randomUUID());
  try {
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(booking));
    window.location.assign("/thank-you");
  } catch {
    // With storage blocked, give the tags a bounded chance before navigating.
    await Promise.race([reportBooking(booking), new Promise<void>((resolve) => window.setTimeout(resolve, 1500))]);
    window.location.assign("/thank-you");
  }
}

export function reportPendingBooking(): Promise<void> {
  if (reporting) return reporting;
  if (window.location.pathname !== "/thank-you" || !permitted()) return Promise.resolve();
  let booking: unknown;
  try { booking = JSON.parse(sessionStorage.getItem(BOOKING_KEY) || "null"); } catch { return Promise.resolve(); }
  if (!validBooking(booking)) return Promise.resolve();
  reporting = reportBooking(booking).finally(() => { reporting = undefined; });
  return reporting;
}
