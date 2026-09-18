/* Conversion hooks for the ads landing pages.
 *
 * armanarai.ca carries no GA4, Google Ads or Meta tag today: the only analytics
 * on the site is Vercel's, which is pageview-only and needs nothing from here.
 * These functions exist so the landing pages are wired for conversion tracking
 * the day a tag is added, without a code change at that point.
 *
 * Everything below is defensive on purpose. A landing page must never break
 * because a tag is missing, blocked by an extension, or still loading: each
 * call is wrapped, and a missing dataLayer is created rather than treated as an
 * error, so events queue and flush whenever GTM actually arrives.
 */

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Push an event, queueing it if no tag manager has loaded yet. */
function push(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  } catch {
    // A blocked or sandboxed dataLayer is not worth failing a lead over.
  }
}

/** A landing-page form was submitted successfully. */
export function trackLead(method: string) {
  push({ event: "generate_lead", method, currency: "CAD" });
}

/** A call was booked through the embedded Calendly. `payload` is Calendly's
 *  own message body, kept whole so a tag can read the event URI later. */
export function rememberBooking(payload: unknown) {
  push({ event: "schedule_call", method: "calendly", calendly: payload });
}
