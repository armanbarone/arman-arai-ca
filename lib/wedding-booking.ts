export const WEDDING_CALENDAR = "https://calendly.com/i-armanarai/30-minute-meeting-wedding";

export function weddingCalendarUrl(search: string, hostname: string, embedded = true, options: { page?: string; theme?: "light" | "dark" } = {}) {
  const incoming = new URLSearchParams(search);
  const params = new URLSearchParams();
  if (embedded) {
    params.set("embed_domain", hostname);
    params.set("embed_type", "Inline");
    params.set("hide_event_type_details", "1");
    params.set("hide_gdpr_banner", "1");
    params.set("background_color", options.theme === "dark" ? "141210" : "ffffff");
    params.set("text_color", options.theme === "dark" ? "e8e0d0" : "292f29");
    params.set("primary_color", options.theme === "dark" ? "b8956a" : "344b3c");
  }
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = incoming.get(key);
    if (value) params.set(key, value);
  }
  if (!params.has("utm_source")) params.set("utm_source", options.page ?? "2728-cc-weddings");
  if (options.page && !params.has("utm_content")) params.set("utm_content", options.page);
  return `${WEDDING_CALENDAR}?${params}`;
}

// An unrelated frame or an arbitrary postMessage must never cause a booking redirect.
export function isCompletedWeddingBooking(origin: string, isCalendarFrame: boolean, data: unknown): boolean {
  if (origin !== "https://calendly.com" || !isCalendarFrame || !data || typeof data !== "object") return false;
  // The provider's completion notification is sufficient. Do not depend on
  // optional invitee metadata, which this page neither needs nor collects.
  return (data as { event?: unknown }).event === "calendly.event_scheduled";
}
