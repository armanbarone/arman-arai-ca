import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

let scenario = 0;
function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}
async function environment({ pathname = '/2728-cc-weddings-dark', blocked = false, gpc = false } = {}) {
  const appended = [];
  const redirects = [];
  globalThis.localStorage = storage();
  globalThis.sessionStorage = storage();
  Object.defineProperty(globalThis, 'navigator', { value: { globalPrivacyControl: gpc }, configurable: true });
  globalThis.window = { location: { pathname, search: '?utm_source=google&gclid=test-click&email=private', origin: 'https://www.armanarai.ca', assign: (url) => redirects.push(url) }, setTimeout, clearTimeout };
  globalThis.document = { title: 'Wedding photography', createElement: () => ({ dataset: {} }), head: { appendChild: (script) => { appended.push(script); queueMicrotask(() => blocked ? script.onerror() : script.onload()); } } };
  const analytics = await import(`../lib/analytics.ts?test=${++scenario}`);
  return { analytics, appended, redirects, google: () => (window.dataLayer || []).map((args) => [...args]), meta: () => (window.fbq?.queue || []).map((args) => [...args]) };
}
const scheduled = { event: 'calendly.event_scheduled', payload: { invitee: { uri: 'https://api.calendly.com/scheduled_events/event-123/invitees/invitee-456' }, name: 'Do not transmit', email: 'private@example.com' } };

test('the tags load on the first view of a public page, with no interaction and whatever the browser signals', async () => {
  for (const options of [{}, { gpc: true }]) {
    const { analytics, appended } = await environment(options);
    analytics.trackPageView();
    assert.equal(appended.length, 2);
  }
});

test('PublicTracking mounts start real page-view tracking without waiting for input', async () => {
  const { analytics, appended, google, meta } = await environment({ pathname: '/wedding-photography/vancouver-dark' });
  const effects = [];
  const module = { exports: {} };
  const source = readFileSync(new URL('../components/PublicTracking.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const require = (name) => {
    if (name === 'react') return { useEffect: (effect) => effects.push(effect) };
    if (name === 'next/navigation') return { usePathname: () => window.location.pathname };
    if (name === '@/lib/analytics') return analytics;
    throw new Error(`Unexpected import: ${name}`);
  };
  runInNewContext(compiled, { exports: module.exports, module, require });
  module.exports.default();
  // Mount effects only: no pointer, scroll, keyboard, submit or booking event.
  effects.forEach((effect) => effect());
  assert.equal(appended.length, 2);
  assert.equal(google().filter((e) => e[1] === 'page_view').length, 1);
  assert.equal(meta().filter((e) => e[1] === 'PageView').length, 1);
  assert.equal(meta().filter((e) => ['Lead', 'Schedule'].includes(e[1])).length, 0);
  // React Strict Mode replay must not duplicate the page view.
  effects.forEach((effect) => effect());
  assert.equal(meta().filter((e) => e[1] === 'PageView').length, 1);
});

test('a successful inquiry sends Lead separately from PageView and Schedule', async () => {
  const { analytics, google, meta } = await environment();
  analytics.trackPageView();
  analytics.trackLead('wedding_date_check');
  assert.equal(meta().filter((e) => e[1] === 'PageView').length, 1);
  assert.equal(meta().filter((e) => e[1] === 'Lead').length, 1);
  assert.equal(meta().filter((e) => e[1] === 'Schedule').length, 0);
  assert.equal(google().filter((e) => e[1] === 'generate_lead').length, 1);
});

test('local development never sends test inquiries to advertising accounts', async () => {
  const { analytics, appended } = await environment();
  window.location.hostname = 'localhost';
  analytics.trackPageView();
  analytics.trackLead('wedding_date_check');
  assert.equal(appended.length, 0);
});

test('no tags on the private portal, the admin pages or the API routes', async () => {
  for (const pathname of ['/portal/client-123', '/admin', '/api/inquiry']) {
    const { analytics, appended } = await environment({ pathname });
    analytics.trackPageView();
    assert.equal(appended.length, 0);
  }
});

test('a page view configures both Ads accounts with one Google script and filters the Google page URL', async () => {
  const { analytics, appended, google, meta } = await environment();
  analytics.trackPageView(); analytics.trackPageView();
  assert.equal(appended.length, 2);
  const configs = google().filter((e) => e[0] === 'config');
  assert.deepEqual(configs.map((e) => e[1]), [analytics.GA4_ID, 'AW-18464850778', 'AW-18154542346']);
  const googleScripts = appended.filter((script) => script.src.includes('googletagmanager.com/gtag/js'));
  assert.equal(googleScripts.length, 1);
  assert.equal(googleScripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=AW-18464850778');
  const pageViews = google().filter((e) => e[1] === 'page_view');
  assert.equal(pageViews.length, 1);
  assert.match(pageViews[0][2].page_location, /gclid=test-click/);
  assert.doesNotMatch(pageViews[0][2].page_location, /email|private/);
  assert.equal(meta().filter((e) => e[1] === 'PageView').length, 1);
  assert.equal(meta().find((e) => e[0] === 'init')[1], analytics.META_PIXEL_ID);
});

test('confirmed booking redirects immediately then reports once on thank-you, without personal information', async () => {
  const { analytics, redirects, google, meta } = await environment();
  analytics.trackPageView();
  await analytics.completeWeddingBooking(scheduled);
  assert.deepEqual(redirects, ['/thank-you']);
  assert.equal(google().filter((e) => e[1] === 'conversion').length, 0);
  const booking = JSON.parse(sessionStorage.getItem(analytics.BOOKING_KEY));
  assert.equal(booking.id, 'ca-invitee-456');
  assert.doesNotMatch(JSON.stringify(booking), /private|api.calendly|name|email/);
  window.location.pathname = '/thank-you';
  await Promise.all([analytics.reportPendingBooking(), analytics.reportPendingBooking()]);
  await analytics.reportPendingBooking();
  const conversion = google().filter((e) => e[1] === 'conversion');
  assert.equal(conversion.length, 1);
  assert.equal(conversion[0][2].send_to, 'AW-18154542346/LzlaCPST9cMcEIqq4dBD');
  assert.equal(conversion[0][2].transaction_id, booking.id);
  assert.equal(google().filter((e) => e[1] === 'generate_lead').length, 1);
  const schedule = meta().filter((e) => e[1] === 'Schedule');
  assert.equal(schedule.length, 1);
  assert.equal(schedule[0][3].eventID, booking.id);
  // Re-import simulates a refresh: in-memory flags are gone; persistent dedupe remains.
  const refreshed = await import(`../lib/analytics.ts?test=${++scenario}`);
  await refreshed.reportPendingBooking();
  assert.equal(google().filter((e) => e[1] === 'conversion').length, 1);
  assert.equal(meta().filter((e) => e[1] === 'Schedule').length, 1);
});

test('direct thank-you visits and stale markers never report conversions', async () => {
  for (const kind of ['direct', 'stale']) {
    const { analytics, google, meta } = await environment({ pathname: '/thank-you' });
    if (kind === 'stale') {
      sessionStorage.setItem(analytics.BOOKING_KEY, JSON.stringify({ id: 'ca-test-123', page: '/2728-cc-weddings', createdAt: Date.now() - 31 * 60 * 1000 }));
    }
    await analytics.reportPendingBooking();
    assert.equal(google().filter((e) => e[1] === 'conversion').length, 0);
    assert.equal(meta().filter((e) => e[1] === 'Schedule').length, 0);
  }
});

test('missing invitee metadata still creates a valid opaque booking id', async () => {
  const { analytics } = await environment();
  const b = analytics.bookingFromMessage({ event: 'calendly.event_scheduled' }, '/2728-cc-weddings?email=private', 'fallback-123', 10000);
  assert.equal(b.id, 'ca-fallback-123');
  assert.equal(b.page, '/2728-cc-weddings');
  assert.equal(analytics.validBooking(b, 10001), true);
  assert.equal(analytics.validBooking(b, 9999), false);
});

test('blocked tags do not stop the redirect or falsely mark a conversion as sent', async () => {
  const { analytics, redirects, google, meta } = await environment({ blocked: true });
  analytics.trackPageView();
  await analytics.completeWeddingBooking(scheduled);
  window.location.pathname = '/thank-you';
  await analytics.reportPendingBooking();
  assert.deepEqual(redirects, ['/thank-you']);
  assert.equal(google().filter((e) => e[1] === 'conversion').length, 0);
  assert.equal(meta().filter((e) => e[1] === 'Schedule').length, 0);
});

test('storage failure still navigates and sends the booking before leaving when tags work', async () => {
  const { analytics, redirects, google, meta } = await environment();
  analytics.trackPageView();
  globalThis.sessionStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  await analytics.completeWeddingBooking(scheduled);
  assert.deepEqual(redirects, ['/thank-you']);
  assert.equal(google().filter((e) => e[1] === 'conversion').length, 1);
  assert.equal(meta().filter((e) => e[1] === 'Schedule').length, 1);
});

test('loaded tags are suspended when navigation enters the private portal', async () => {
  const { analytics, google, meta } = await environment();
  analytics.trackPageView();
  window.location.pathname = '/portal/client-123';
  analytics.suspendTracking();
  analytics.trackPageView();
  assert.equal(window[`ga-disable-${analytics.GA4_ID}`], true);
  assert.equal(meta().at(-1)[1], 'revoke');
  assert.equal(google().filter((e) => e[1] === 'page_view').length, 1);
  window.location.pathname = '/portfolio';
  analytics.trackPageView();
  assert.equal(window[`ga-disable-${analytics.GA4_ID}`], false);
  assert.equal(google().filter((e) => e[1] === 'page_view').length, 2);
});
