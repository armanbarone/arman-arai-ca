/** No site consent manager is installed. Honour explicit browser opt-outs in
 * addition to keeping advertising off private and preview routes. */
export function advertisingOptOut() {
  if (typeof window === "undefined") return false;
  const browser = window.navigator as Navigator & { globalPrivacyControl?: boolean };
  return browser?.globalPrivacyControl === true || browser?.doNotTrack === "1" ||
    (window as Window & { doNotTrack?: string }).doNotTrack === "1";
}
