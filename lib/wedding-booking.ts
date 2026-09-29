export const WEDDING_CALENDAR = "https://calendly.com/i-armanarai/30-minute-meeting-wedding";

export function weddingCalendarUrl(search: string, hostname: string, embedded = true, options: { page?: string; theme?: "light" | "dark"; prefill?: { name?: string; email?: string } } = {}) {
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
  // Calendly's own prefill parameters: a couple who has just sent the
  // pricing-request form should not type their name and email a second time.
  if (options.prefill?.name) params.set("name", options.prefill.name);
  if (options.prefill?.email) params.set("email", options.prefill.email);
  if (options.page && !params.has("utm_content")) params.set("utm_content", options.page);
  // %20, not "+", for spaces: Calendly's widget re-encodes the URL it is given
  // and would show a prefilled "Sarah & James" as "Sarah+&+James".
  return `${WEDDING_CALENDAR}?${params.toString().replace(/\+/g, "%20")}`;
}

// An unrelated frame or an arbitrary postMessage must never cause a booking redirect.
export function isCompletedWeddingBooking(origin: string, isCalendarFrame: boolean, data: unknown): boolean {
  if (origin !== "https://calendly.com" || !isCalendarFrame || !data || typeof data !== "object") return false;
  // The provider's completion notification is sufficient. Do not depend on
  // optional invitee metadata, which this page neither needs nor collects.
  return (data as { event?: unknown }).event === "calendly.event_scheduled";
}
