/** Public marketing measurement. No names, emails or Calendly payloads are sent. */
export const GA4_ID = "G-V2GKTHF0W6";
export const GOOGLE_ADS_ID = "AW-18154542346";
export const META_PIXEL_ID = "1110472461323039";
export const SCHEDULE_CONVERSION_LABEL = "LzlaCPST9cMcEIqq4dBD";
export const CONSENT_KEY = "aa_ca_measurement_consent_v1";
export const BOOKING_KEY = "aa_ca_completed_booking_v1";
const SENT_KEY = "aa_ca_booking_events_v1";
const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;
const BOOKING_LIFETIME = 30 * 60 * 1000;
export type Consent = "accepted" | "declined";
export type Booking = { id: string; page: string; createdAt: number };
type Tag = (...args: unknown[]) => void;
type MetaTag = Tag & { queue: IArguments[]; callMethod?: Tag; push?: MetaTag; loaded?: boolean; version?: string };
type TrackingWindow = Window & { dataLayer?: unknown[]; gtag?: Tag; fbq?: MetaTag; _fbq?: MetaTag };
let memoryConsent: Consent | null = null;
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

export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return "declined";
  if (memoryConsent) return memoryConsent;
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    if (saved && Date.now() - saved.at < CONSENT_LIFETIME && ["accepted", "declined"].includes(saved.choice)) return saved.choice;
  } catch { /* Storage is optional. */ }
  return null;
}

export function setConsent(choice: Consent) {
  memoryConsent = choice;
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, at: Date.now() })); } catch { /* Keep the choice for this page. */ }
  if (initialized) {
    const w = window as TrackingWindow;
    const status = choice === "accepted" ? "granted" : "denied";
    w.gtag?.("consent", "update", { analytics_storage: status, ad_storage: status, ad_user_data: status, ad_personalization: status });
    w.fbq?.("consent", choice === "accepted" ? "grant" : "revoke");
  }
}

function permitted() {
  return typeof window !== "undefined" && isPublicTrackingPath(window.location.pathname) && getConsent() === "accepted";
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
      setConsent("accepted");
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
  w.gtag("config", GOOGLE_ADS_ID);
  googleReady = loadTag("aa-google-tag", `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`);

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
  const w = window as TrackingWindow;
  w.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  w.fbq?.("consent", "revoke");
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
      w.gtag?.("event", "generate_lead", { send_to: GA4_ID, method: "calendly_booking", landing_page: booking.page, currency: "CAD" });
      w.gtag?.("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${SCHEDULE_CONVERSION_LABEL}`, transaction_id: booking.id, currency: "CAD" });
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
