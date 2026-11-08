import "server-only";
/** Real Stripe test payments are restricted to loopback and isolated private data.
 * This opt-in cannot enable test payments on a production or public preview URL. */
export function christmasPaymentMode(): "live" | "test" | null {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (process.env.VERCEL_ENV === "production") return /^(sk|rk)_live_/.test(key) ? "live" : null;
  let loopback = false;
  try { const u = new URL(process.env.APP_URL || ""); loopback = u.protocol === "http:" && ["127.0.0.1", "localhost"].includes(u.hostname); } catch { /* fail closed */ }
  return process.env.CHRISTMAS_TEST_MODE === "1" && /^(sk|rk)_test_/.test(key) && loopback && /^dev\/christmas-e2e\/[a-zA-Z0-9_-]+\/$/.test(process.env.PORTAL_BLOB_PREFIX || "") ? "test" : null;
}

export function christmasSameOrigin(req: Request) {
  // Next's local server normalizes Request.url to localhost even when the
  // browser uses 127.0.0.1. Only the strictly gated local test opts into APP_URL.
  const expected = christmasPaymentMode() === "test" ? new URL(process.env.APP_URL!).origin : new URL(req.url).origin;
  return req.headers.get("origin") === expected;
}
