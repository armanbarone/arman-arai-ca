const test = require("node:test");
const assert = require("node:assert/strict");
const { loader } = require("./wedding-test-loader.cjs");

const path = "/wedding-photography/canada";
const inquiryId = "11111111-2222-4333-8444-555555555555";
const fields = {
  firstName: "Test", lastName: "Couple", email: "test@example.com",
  phone: "5145550100", referral: "Instagram", weddingDate: "2027-08-14",
  location: "Halifax, NS", message: "Our wedding", promise: "I promise",
};
const styles = new Proxy({}, { get: (_, key) => String(key) });
const photo = { src: "https://cdn.armanarai.ca/test.webp", alt: "Style example" };
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};
function find(node, predicate) {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  return [node.props?.children].flat(Infinity).map(child => find(child, predicate)).find(Boolean);
}
function harness({ ok = true, response = { success: true, autoReply: true, inquiryId }, blocked = false, pageModulePath = "@/app/wedding-photography/canada/page" } = {}) {
  const states = [], refs = [], effects = [], requests = [], redirects = [];
  let stateIndex = 0, refIndex = 0;
  global.window = {
    location: { pathname: path, search: "?utm_source=meta&utm_medium=paid_social&utm_campaign=canada&utm_content=creative-1&fbclid=test-click", origin: "https://www.armanarai.ca", hostname: "www.armanarai.ca" },
  };
  global.document = { cookie: "", referrer: "https://www.instagram.com/" };
  global.sessionStorage = blocked ? { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } } : storage();
  const load = loader({
    react: {
      useState(initial) { const index = stateIndex++; if (!(index in states)) states[index] = initial; return [states[index], value => { states[index] = value; }]; },
      useRef(initial) { const index = refIndex++; return refs[index] ??= { current: initial }; },
      useEffect(effect) { effects.push(effect); },
    },
    "next/image": function Image() {},
    "next/navigation": { useRouter: () => ({ push: value => redirects.push(value) }) },
    "@vercel/analytics/next": { Analytics() {} },
    "@/lib/galleries": { galleryBySlug: () => ({ chapters: [{ images: [{ url: photo.src, alt: photo.alt }] }] }) },
    "@/lib/reviews": { proofByN: () => ({ alt: "Review", w: 1000, h: 800 }), proofSrc: () => photo.src },
    "../vancouver-simple/page.module.css": styles,
    "./page.module.css": styles,
    "./vancouver.module.css": styles,
    "./inquiry.module.css": styles,
    "./wedding-calendar": {},
  });
  const pageModule = load(pageModulePath);
  const { InquiryForm } = load("@/app/wedding-photography/InquiryFunnel");
  const GalleryRail = load("@/app/wedding-photography/vancouver-simple/GalleryRail").default;
  const tree = pageModule.default();
  const form = find(tree, node => node.type === InquiryForm);
  const rail = find(tree, node => node.type === GalleryRail);
  const renderForm = () => { stateIndex = 0; refIndex = 0; return InquiryForm(form.props); };
  const submit = async () => {
    load("@/lib/attribution").captureFirstTouch();
    renderForm();
    for (const effect of effects.splice(0)) effect();
    global.FormData = class { get(key) { return fields[key] || ""; } };
    global.fetch = async (url, options) => { requests.push({ url, payload: JSON.parse(options.body) }); return { ok, json: async () => response }; };
    await find(renderForm(), node => node.type === "form").props.onSubmit({ preventDefault() {}, currentTarget: {} });
  };
  return { pageModule, tree, form, rail, GalleryRail, submit, requests, redirects, completion: load("@/lib/inquiry-completion") };
}

test("Canada uses the simple design, the selected photo album and the existing market funnel", () => {
  const h = harness();
  assert.equal(h.tree.props["data-landing-city"], "canada");
  assert.equal(h.form.props.city, "Canada");
  assert.equal(h.form.props.market, "canada");
  assert.equal(h.form.props.page, path);
  assert.equal(h.form.props.variant, "minimal");
  assert.equal(h.pageModule.metadata.alternates.canonical, path);
  assert.equal(h.pageModule.metadata.robots.index, false);
  assert.match(h.pageModule.metadata.title.absolute, /Canadian/);
  const heading = find(h.tree, node => node.props?.id === "gallery-title");
  assert.equal(heading.props.children[0] + heading.props.children[1].props.children, "Your day, Captured beautifully");
  const originalGallery = loader()("@/app/wedding-photography/vancouver-simple/gallery").VANCOUVER_SIMPLE_GALLERY;
  assert.deepEqual(h.rail.props.photos.slice(0, originalGallery.length), originalGallery);
  assert.equal(h.pageModule.metadata.openGraph.images[0].url, "https://cdn.armanarai.ca/Landing%20Page%20Pics/TOP%20IMAGE.png");
  assert.equal(h.rail.props.photos.length, 25);
  assert.deepEqual(h.rail.props.photos.slice(-2).map(photo => photo.src.split("/").pop()), [
    "montreal-landing-10.webp", "montreal-landing-02.webp",
  ]);
  assert.equal(new Set(h.rail.props.photos.map(photo => photo.src)).size, h.rail.props.photos.length);
  for (const photo of h.rail.props.photos) {
    assert.match(photo.src, /^https:\/\/cdn\.armanarai\.ca\//);
    assert.ok(photo.width > 0 && photo.height > 0);
  }
  assert.equal(h.GalleryRail(h.rail.props).props["aria-label"], "Canadian wedding photographs");
  assert.equal(h.GalleryRail({ photos: h.rail.props.photos }).props["aria-label"], "Vancouver wedding photographs");
});

test("Canada submission preserves campaign attribution, receipt and existing confirmation URL", async () => {
  for (const blocked of [false, true]) {
    const h = harness({ blocked });
    await h.submit();
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].url, "/api/contact");
    assert.equal(h.requests[0].payload.pricingMarket, "canada");
    assert.equal(h.requests[0].payload.subjectLabel, "Wedding inquiry — Canada");
    assert.equal(h.requests[0].payload.page, path);
    assert.equal(h.requests[0].payload.utm_source, "meta");
    assert.equal(h.requests[0].payload.utm_medium, "paid_social");
    assert.equal(h.requests[0].payload.utm_campaign, "canada");
    assert.equal(h.requests[0].payload.utm_content, "creative-1");
    assert.equal(h.requests[0].payload.fbclid, "test-click");
    assert.equal(h.requests[0].payload.trackingVersion, "wedding-lead-v1");
    assert.deepEqual(h.redirects, ["/wedding-photography/canada-pricing/thank-you"]);
    const receipt = h.completion.readSentInquiry("canada");
    assert.equal(receipt.page, path);
    assert.equal(receipt.market, "canada");
    assert.equal(receipt.id, inquiryId);
    assert.equal(receipt.emailed, true);
    assert.equal(h.completion.readSentInquiry("vancouver"), null);
  }
});

test("failed and ignored Canada submissions never complete the inquiry", async () => {
  for (const options of [{ ok: false, response: { error: "Delivery failed" } }, { response: { success: false } }, { response: { success: true, ignored: true } }]) {
    const h = harness(options);
    await h.submit();
    assert.deepEqual(h.redirects, []);
    assert.equal(h.completion.readSentInquiry("canada"), null);
  }
});


test("Canada confirmation keeps the correct market, national travel wording and return URL", () => {
  const load = loader({
    react: { useEffect() {}, useRef() {}, useState() {} },
    "next/navigation": { useRouter() {} },
    "./vancouver.module.css": styles, "./inquiry.module.css": styles,
    "./wedding-calendar": {},
  });
  const confirmation = load("@/app/wedding-photography/canada-pricing/thank-you/page");
  const wrapper = confirmation.default();
  const view = wrapper.type(wrapper.props);
  const { ThankYouFromSession } = load("@/app/wedding-photography/InquiryFunnel");
  const gate = find(view, node => node.type === ThankYouFromSession);
  assert.equal(gate.props.market, "canada");
  assert.equal(gate.props.city, "Canada");
  assert.equal(gate.props.page, "wedding-photography/canada");
  assert.match(gate.props.travelNote, /the same anywhere in Canada/);
  assert.doesNotMatch(gate.props.travelNote, /Local travel within Vancouver/);
  // "Canadian wedding photography", never "Canada wedding photography".
  assert.equal(gate.props.adjective, "Canadian");
  assert.match(confirmation.metadata.title.absolute, /Canadian Wedding Photography/);
  assert.equal(confirmation.metadata.robots.index, false);
});

test("Canada contact processing records a Canada lead and queues the same automatic reply", async () => {
  const notifications = [], replies = [], leads = [], queued = [];
  const load = loader({
    "next/server": { after: work => queued.push(work), NextResponse: { json: (body, options = {}) => ({ status: options.status ?? 200, body }) } },
    "@/lib/ads/city-wedding-pages": { WEDDING_CITIES: [{ slug: "vancouver", name: "Vancouver" }] },
    "@/lib/auto-reply": { autoReplyEnabled: () => true, sendInquiryAutoReply: async inquiry => replies.push(inquiry) },
    "@/lib/portal/leads": { recordLead: async lead => leads.push(lead) },
    "@/lib/meta-conversions": { reportWeddingLead: async () => {} },
    resend: { Resend: class { emails = { send: async message => { notifications.push(message); return { error: null }; } }; } },
  });
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "stub-only";
  try {
    const { POST } = load("@/app/api/contact/route");
    const result = await POST({ json: async () => ({
      ...fields, type: "wedding-inquiry", pricingMarket: "canada", subjectLabel: "Wedding inquiry — Canada",
      page: path, utm_source: "meta", utm_medium: "paid_social", utm_campaign: "canada",
      trackingVersion: "wedding-lead-v1",
    }), headers: {}, cookies: {} });
    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
    assert.equal(notifications.length, 1);
    assert.match(notifications[0].subject, /Wedding inquiry — Canada/);
    assert.match(notifications[0].html, /Canada landing page/);
    await Promise.all(queued.map(work => work()));
    assert.equal(leads[0].market, "Canada");
    assert.equal(leads[0].attribution.landingPage, path);
    assert.equal(replies[0].market.slug, "canada");
    assert.equal(replies[0].cityName, "Canada");
    // One national price, travel quoted separately, and said in Arman's own
    // voice: this sentence is printed in an email he signs.
    assert.match(replies[0].market.travelNote, /the same anywhere in Canada/);
    assert.match(replies[0].market.travelNote, /Travel is quoted separately/);
    assert.doesNotMatch(replies[0].market.travelNote, /Arman/);
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test("Vancouver-simple keeps its own URL, Vancouver wording and market alongside Canada", async () => {
  const fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
  const module = { exports: {} };
  const source = fs.readFileSync(require("node:path").join(__dirname, "../next.config.ts"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, __dirname });
  const redirects = await module.exports.default.redirects();
  assert.equal(redirects.some(rule => rule.source === "/wedding-photography/vancouver-simple"), false);

  const vancouver = harness({ pageModulePath: "@/app/wedding-photography/vancouver-simple/page" });
  assert.equal(vancouver.pageModule.metadata.alternates.canonical, "/wedding-photography/vancouver-simple");
  assert.equal(vancouver.form.props.page, "/wedding-photography/vancouver-simple");
  assert.equal(vancouver.form.props.city, "Vancouver");
  assert.equal(vancouver.form.props.market, "vancouver");
  const heading = find(vancouver.tree, node => node.props?.id === "gallery-title");
  assert.equal(heading.props.children[0] + heading.props.children[1].props.children, "Your day, in Vancouver.");
});
