export const WEDDING_CALENDAR = "https://calendly.com/i-armanarai/30-minute-meeting-wedding";

export function weddingCalendarUrl(search: string, hostname: string, embedded = true) {
  const incoming = new URLSearchParams(search);
  const params = new URLSearchParams();
  if (embedded) {
    params.set("embed_domain", hostname);
    params.set("embed_type", "Inline");
    params.set("hide_landing_page_details", "1");
    params.set("background_color", "ffffff");
    params.set("text_color", "292f29");
    params.set("primary_color", "344b3c");
  }
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = incoming.get(key);
    if (value) params.set(key, value);
  }
  if (!params.has("utm_source")) params.set("utm_source", "2728-cc-weddings");
  return `${WEDDING_CALENDAR}?${params}`;
}

// An unrelated frame or an arbitrary postMessage must never cause a booking redirect.
export function isCompletedWeddingBooking(origin: string, isCalendarFrame: boolean, data: unknown): boolean {
  if (origin !== "https://calendly.com" || !isCalendarFrame || !data || typeof data !== "object") return false;
  const message = data as { event?: unknown; payload?: { event?: { uri?: unknown }; invitee?: { uri?: unknown } } };
  if (message.event !== "calendly.event_scheduled") return false;
  const eventUri = message.payload?.event?.uri;
  const inviteeUri = message.payload?.invitee?.uri;
  return typeof eventUri === "string" && /^https:\/\/api\.calendly\.com\/scheduled_events\/[\w-]+$/.test(eventUri)
    && typeof inviteeUri === "string" && inviteeUri.startsWith(`${eventUri}/invitees/`) && inviteeUri.length > eventUri.length + 10;
}
