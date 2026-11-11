const KEY = "aa_christmas_confirmation_access_v1";
type Access = { slot: string; token: string; savedAt: number };
const valid = (a: Access | null): a is Access => !!a && /^2026-(?:\d{2}-\d{2}_\d{4}|reservation_[a-f0-9]{20})$/.test(a.slot) && /^[a-f0-9]{64}$/.test(a.token) &&
  Number.isFinite(a.savedAt) && Date.now() >= a.savedAt && Date.now() - a.savedAt < 86400000;

/** Store access in this tab so Meta never sees a booking token in the URL.
 * Original private email links continue to work. */
export function confirmationAccess(): Access | null {
  const params = new URLSearchParams(window.location.search);
  const incoming = { slot: params.get("slot") || "", token: params.get("token") || "", savedAt: Date.now() };
  if (params.has("slot") || params.has("token")) {
    if (!valid(incoming)) return null;
    try { sessionStorage.setItem(KEY, JSON.stringify(incoming)); } catch { /* This view still works with storage blocked. */ }
    try { window.history.replaceState(window.history.state, "", window.location.pathname); } catch { /* Tracking refuses an unsanitized URL. */ }
    return incoming;
  }
  try { const saved = JSON.parse(sessionStorage.getItem(KEY) || "null"); return valid(saved) ? saved : null; }
  catch { return null; }
}
