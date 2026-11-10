const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const storage = () => { const values = new Map(); return { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v) }; };
function browser({ path = '/christmas/confirmation', query = '', blocked = false, noRuntime = false, local = storage(), session = storage() } = {}) {
  const appended = []; let offset=0;
  class BrowserDate extends Date { static now(){return Date.now()+offset;} }
  const location = { hostname: 'www.armanarai.ca', pathname: path, search: query, hash: '', origin: 'https://www.armanarai.ca' };
  const window = { location, setTimeout, clearTimeout, history: { state: { next: true }, replaceState: (_state, _unused, url) => { const u = new URL(url, location.origin); location.pathname = u.pathname; location.search = u.search; location.hash = u.hash; } } };
  const context = vm.createContext({ window, Date:BrowserDate, require:n=>{if(n.includes('advertising-preferences'))return load('lib/advertising-preferences.ts');throw Error(n);}, document: { title: 'Christmas', getElementById:()=>null, createElement: () => ({ dataset: {} }), head: { appendChild: script => { appended.push(script); queueMicrotask(() => { if(blocked)return script.onerror();if(script.id==='aa-meta-pixel'&&!noRuntime)window.fbq.callMethod=(...args)=>window.fbq.queue.push(args);script.onload(); }); } } }, localStorage: local, sessionStorage: session, URL, URLSearchParams, setTimeout, clearTimeout });
  const load = file => { const mod = { exports: {} }; context.module = mod; const compiled = ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText; vm.runInContext(`(function(module,exports){${compiled}\n})(module,module.exports)`, context); return mod.exports; };
  return { window, appended, local, session, load, recover:()=>{blocked=false;noRuntime=false;offset+=11000;}, meta: () => (window.fbq?.queue || []).map(args => [...args]) };
}
const paid = { eventId: 'a'.repeat(64), paidCents: 33754, albums: 1 };

test('private and preview pages never load general advertising tags or report a sample purchase', async () => {
  for (const path of ['/christmas/confirmation', '/christmas/confirmation/preview', '/christmas/questionnaire', '/christmas/questionnaire/preview', '/christmas/operations/preview', '/christmas/cart/return', '/christmas/cart/unsubscribe']) {
    const b = browser({ path }); const a = b.load('lib/analytics.ts');
    await a.trackPageView();
    if (path !== '/christmas/confirmation') await a.trackChristmasPurchase(paid);
    assert.equal(b.appended.length, 0);
  }
});

test('private access is removed before Meta starts; a verified purchase reports once with only campaign data', async () => {
  const token = 'b'.repeat(64), slot = '2026-12-05_1100';
  const b = browser({ query: `?slot=${slot}&token=${token}&email=private` });
  const a = b.load('lib/analytics.ts');
  await a.trackChristmasPurchase(paid); assert.equal(b.appended.length, 0);
  const access = b.load('lib/christmas/confirmation-access.ts');
  assert.equal(access.confirmationAccess().token, token);
  assert.equal(b.window.location.search, '');
  assert.equal(access.confirmationAccess().slot, slot);
  await Promise.all([a.trackChristmasPurchase(paid), a.trackChristmasPurchase(paid)]);
  await a.trackChristmasPurchase(paid);
  assert.equal(b.appended.length, 1); assert.match(b.appended[0].src, /connect.facebook.net/);
  const events = b.meta().filter(e => e[0] === 'trackCustom');
  assert.equal(events.length, 1); assert.equal(events[0][1], 'ChristmasSessionPurchase');
  assert.equal(events[0][2].value, 337.54); assert.equal(events[0][2].currency, 'CAD');
  assert.equal(events[0][3].eventID, paid.eventId);
  assert.doesNotMatch(JSON.stringify(events), /token|private|2026-12-05|email|questionnaire|reference/);
  const purchases = b.meta().filter(e => e[0] === 'track' && e[1] === 'Purchase');
  assert.equal(purchases.length, 1);
  assert.equal(purchases[0][2].value, 337.54); assert.equal(purchases[0][2].currency, 'CAD');
  assert.equal(purchases[0][2].content_category, 'christmas_sessions');
  assert.equal(purchases[0][3].eventID, paid.eventId);
  assert.doesNotMatch(JSON.stringify(purchases), /token|private|2026-12-05|email|questionnaire|reference/);
  assert.equal(b.meta().filter(e => ['PageView', 'Schedule', 'Lead'].includes(e[1])).length, 0);
  const refreshed = browser({ local: b.local, session: b.session });
  assert.equal(refreshed.load('lib/christmas/confirmation-access.ts').confirmationAccess().token, token);
  await refreshed.load('lib/analytics.ts').trackChristmasPurchase(paid);
  assert.equal(refreshed.appended.length, 0);
});

test('blocked tags and invalid payloads do not mark a purchase as sent', async () => {
  const local = storage(); const blocked = browser({ blocked: true, local });
  await blocked.load('lib/analytics.ts').trackChristmasPurchase(paid);
  assert.equal(blocked.meta().filter(e => e[0] === 'trackCustom').length, 0);
  assert.equal(blocked.meta().filter(e => e[1] === 'Purchase').length, 0);
  const retry = browser({ local }); const a = retry.load('lib/analytics.ts');
  for (const bad of [{ ...paid, paidCents: 0 }, { ...paid, albums: 4 }, { ...paid, eventId: 'private-booking-id' }]) await a.trackChristmasPurchase(bad);
  assert.equal(retry.appended.length, 0);
  await a.trackChristmasPurchase(paid);
  assert.equal(retry.meta().filter(e => e[0] === 'trackCustom').length, 1);
  assert.equal(retry.meta().filter(e => e[1] === 'Purchase').length, 1);
});

test('landing and paid confirmation reuse one pixel; later private navigation revokes it', async () => {
  const b = browser({ path: '/christmas' }); const a = b.load('lib/analytics.ts');
  await a.trackPageView(); b.window.location.pathname = '/christmas/confirmation'; a.suspendTracking();
  await a.trackChristmasPurchase(paid);
  assert.equal(b.meta().filter(e => e[0] === 'init').length, 1);
  assert.equal(b.meta().filter(e => e[0] === 'trackCustom').length, 1);
  assert.equal(b.meta().filter(e => e[1] === 'Purchase').length, 1);
  b.window.location.pathname = '/christmas/questionnaire'; a.suspendTracking();
  assert.equal(b.meta().at(-1)[1], 'revoke');
});

test('standard Purchase uses the verified total for every album quantity', async () => {
  const b = browser(); const a = b.load('lib/analytics.ts');
  const totals = [26250, 33754, 39914, 44954];
  for (let albums = 0; albums <= 3; albums++) {
    await a.trackChristmasPurchase({ eventId: String(albums).repeat(64), paidCents: totals[albums], albums });
  }
  const purchases = b.meta().filter(e => e[0] === 'track' && e[1] === 'Purchase');
  assert.equal(purchases.length, 4);
  assert.deepEqual(Array.from(purchases, e => e[2].value), [262.5, 337.54, 399.14, 449.54]);
  assert.ok(purchases.every(e => e[2].currency === 'CAD'));
});

test('adding standard Purchase preserves the receipt for the existing Christmas custom event', async () => {
  const local = storage(); local.setItem(`aa_christmas_purchase_v1:${paid.eventId}`, 'sent');
  const b = browser({ local });
  await b.load('lib/analytics.ts').trackChristmasPurchase(paid);
  assert.equal(b.meta().filter(e => e[1] === 'Purchase').length, 1);
  assert.equal(b.meta().filter(e => e[0] === 'trackCustom').length, 0);
  const refreshed = browser({ local });
  await refreshed.load('lib/analytics.ts').trackChristmasPurchase(paid);
  assert.equal(refreshed.appended.length, 0);
});

test('preview hosts cannot send standard or custom purchases', async () => {
  const b = browser(); b.window.location.hostname = 'canadian-weddings-preview.vercel.app';
  await b.load('lib/analytics.ts').trackChristmasPurchase(paid);
  assert.equal(b.appended.length, 0);
  assert.equal(b.meta().length, 0);
});

test('storage failure preserves current booking access and invalid links do not reuse another booking', () => {
  const unavailable = { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } };
  const b = browser({ query: `?slot=2026-12-05_1100&token=${'b'.repeat(64)}`, session: unavailable });
  const access = b.load('lib/christmas/confirmation-access.ts');
  assert.equal(access.confirmationAccess().slot, '2026-12-05_1100');
  assert.equal(b.window.location.search, '');
  b.window.location.search = '?slot=invalid';
  assert.equal(access.confirmationAccess(), null);
});

test('a pixel first loaded by paid confirmation can resume on the public landing page', async () => {
  const b = browser(); const a = b.load('lib/analytics.ts');
  await a.trackChristmasPurchase(paid);
  b.window.location.pathname = '/christmas/questionnaire'; a.suspendTracking();
  b.window.location.pathname = '/christmas'; await a.trackPageView();
  assert.equal(b.meta().filter(e => e[0] === 'init').length, 1);
  assert.equal(b.meta().filter(e => e[0] === 'consent').at(-1)[1], 'grant');
  assert.equal(b.window[`ga-disable-${a.GA4_ID}`], false);
});

test('landing PageView waits for the working SDK and Strict Mode does not duplicate it',async()=>{
 const b=browser({path:'/christmas'}),a=b.load('lib/analytics.ts');
 await Promise.all([a.trackPageView(),a.trackPageView()]);assert.equal(b.meta().filter(e=>e[1]==='PageView').length,1);assert.equal(b.meta().filter(e=>e[0]==='init').length,1);
});
test('the checkout event uses the verified amount, deduplicates and does not fire for calendar selection',async()=>{
 const b=browser({path:'/christmas'}),a=b.load('lib/analytics.ts');await a.trackPageView();
 assert.equal(b.meta().filter(e=>e[1]==='InitiateCheckout').length,0);
 await Promise.all([a.trackChristmasCheckout({...paid,paidCents:5000}),a.trackChristmasCheckout({...paid,paidCents:5000})]);
 await a.trackChristmasCheckout({...paid,paidCents:5000});const events=b.meta().filter(e=>e[1]==='InitiateCheckout');assert.equal(events.length,1);assert.equal(events[0][2].value,50);assert.equal(events[0][3].eventID,paid.eventId);
 assert.equal(b.meta().filter(e=>e[1]==='Purchase').length,0);
});
test('blocked checkout measurement never prevents checkout and explicit browser opt-outs suppress all events',async()=>{
 const b=browser({path:'/christmas',blocked:true}),a=b.load('lib/analytics.ts');await a.trackPageView();await a.trackChristmasCheckout(paid);assert.equal(b.meta().filter(e=>['PageView','InitiateCheckout','Purchase'].includes(e[1])).length,0);
 const denied=browser({path:'/christmas'});denied.window.navigator={globalPrivacyControl:true};const d=denied.load('lib/analytics.ts');await d.trackPageView();await d.trackChristmasCheckout(paid);denied.window.location.pathname='/christmas/confirmation';await d.trackChristmasPurchase(paid);assert.equal(denied.appended.length,0);
});

test('a detected stub or loaded script without a runtime is not mistaken for a sent event, and a later event can recover',async()=>{
 for(const opts of [{blocked:true},{noRuntime:true}]){
  const b=browser({path:'/christmas',...opts}),a=b.load('lib/analytics.ts');await a.trackPageView();assert.equal(b.meta().filter(e=>e[1]==='PageView').length,0);
  b.recover();await a.trackPageView();assert.equal(b.meta().filter(e=>e[1]==='PageView').length,1);assert.equal(b.meta().filter(e=>e[0]==='init').length,1);
 }
});
