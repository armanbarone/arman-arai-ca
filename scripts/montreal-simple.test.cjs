const test = require("node:test");
const assert = require("node:assert/strict");
const { loader } = require("./wedding-test-loader.cjs");

const path = "/wedding-photography/montreal-simple";
const inquiryId = "11111111-2222-4333-8444-555555555555";
const fields = {
  firstName: "Test", lastName: "Couple", email: "test@example.com",
  phone: "5145550100", referral: "Instagram", weddingDate: "2027-08-14",
  location: "Old Montréal", message: "Our wedding", promise: "I promise",
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
function harness({ ok = true, response = { success: true, autoReply: true, inquiryId }, blocked = false } = {}) {
  const states = [], refs = [], effects = [], requests = [], redirects = [];
  let stateIndex = 0, refIndex = 0;
  global.window = {
    location: { pathname: path, search: "?utm_source=meta&utm_medium=paid_social&utm_campaign=montreal-simple&utm_content=creative-1&fbclid=test-click", origin: "https://www.armanarai.ca", hostname: "www.armanarai.ca" },
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
    "@/lib/images": { ARMAN: photo, DOCUMENTARY: Array(20).fill(photo), DREAMY_FINE_ART: Array(20).fill(photo), EDITORIAL: Array(20).fill(photo) },
    "@/lib/galleries": { galleryBySlug: () => ({ chapters: [{ images: [{ url: photo.src, alt: photo.alt }] }] }) },
    "@/lib/reviews": { proofByN: () => ({ alt: "Review", w: 1000, h: 800 }), proofSrc: () => photo.src },
    "../vancouver-simple/page.module.css": styles,
    "./page.module.css": styles,
    "./vancouver.module.css": styles,
    "./inquiry.module.css": styles,
    "./wedding-calendar": {},
  });
  const pageModule = load("@/app/wedding-photography/montreal-simple/page");
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

test("Montréal uses the simple design, its own photo album and the existing market funnel", () => {
  const h = harness();
  assert.equal(h.tree.props["data-landing-city"], "montreal");
  assert.equal(h.form.props.city, "Montréal");
  assert.equal(h.form.props.market, "montreal");
  assert.equal(h.form.props.page, path);
  assert.equal(h.form.props.variant, "minimal");
  assert.equal(h.pageModule.metadata.alternates.canonical, path);
  assert.equal(h.pageModule.metadata.robots.index, false);
  assert.match(h.pageModule.metadata.title.absolute, /Montréal/);
  assert.equal(h.pageModule.metadata.openGraph.images[0].url, "https://cdn.armanarai.ca/Landing%20Page%20Pics/TOP%20IMAGE.png");
  assert.ok(h.rail.props.photos.length >= 9);
  assert.equal(new Set(h.rail.props.photos.map(photo => photo.src)).size, h.rail.props.photos.length);
  for (const photo of h.rail.props.photos) {
    assert.match(photo.src, /\/cities\/montreal\/|\/galleries\/luca-lauren\//);
    assert.ok(photo.width > 0 && photo.height > 0);
  }
  assert.equal(h.GalleryRail(h.rail.props).props["aria-label"], "Montréal wedding photographs");
  assert.equal(h.GalleryRail({ photos: h.rail.props.photos }).props["aria-label"], "Vancouver wedding photographs");
});

test("Montréal submission preserves campaign attribution, receipt and existing confirmation URL", async () => {
  for (const blocked of [false, true]) {
    const h = harness({ blocked });
    await h.submit();
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].url, "/api/contact");
    assert.equal(h.requests[0].payload.pricingMarket, "montreal");
    assert.equal(h.requests[0].payload.subjectLabel, "Wedding inquiry — Montréal");
    assert.equal(h.requests[0].payload.page, path);
    assert.equal(h.requests[0].payload.utm_source, "meta");
    assert.equal(h.requests[0].payload.utm_medium, "paid_social");
    assert.equal(h.requests[0].payload.utm_campaign, "montreal-simple");
    assert.equal(h.requests[0].payload.utm_content, "creative-1");
    assert.equal(h.requests[0].payload.fbclid, "test-click");
    assert.equal(h.requests[0].payload.trackingVersion, "wedding-lead-v1");
    assert.deepEqual(h.redirects, ["/wedding-photography/montreal-pricing/thank-you"]);
    const receipt = h.completion.readSentInquiry("montreal");
    assert.equal(receipt.page, path);
    assert.equal(receipt.market, "montreal");
    assert.equal(receipt.id, inquiryId);
    assert.equal(receipt.emailed, true);
    assert.equal(h.completion.readSentInquiry("vancouver"), null);
  }
});

test("failed and ignored Montréal submissions never complete the inquiry", async () => {
  for (const options of [{ ok: false, response: { error: "Delivery failed" } }, { response: { success: false } }, { response: { success: true, ignored: true } }]) {
    const h = harness(options);
    await h.submit();
    assert.deepEqual(h.redirects, []);
    assert.equal(h.completion.readSentInquiry("montreal"), null);
  }
});
