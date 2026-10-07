const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { loader } = require("./wedding-test-loader.cjs");
const load = loader();
const guideData = load("@/lib/guide");
const { GUIDE_PORTFOLIO_ALBUMS } = load("@/lib/guide-content");
const { EDITORIAL, FILM, ANALOGUE, DREAMY_FINE_ART, DOCUMENTARY } = load("@/lib/images");
const minimal = {
  v: 1, id: "abcdefghijklmnopqrstuv", createdAt: 0, market: "vancouver",
  names: "Sarah & James", email: "couple@example.com", location: "",
  coverage: "unsure", budget: "unsure",
};

function pageFor(record) {
  return loader({
    "@/lib/guide": { ...guideData, readGuide: async () => record },
    "next/navigation": { notFound() { throw new Error("NOT_FOUND"); } },
    "next/image": ({ src, alt }) => React.createElement("img", { src, alt }),
    "./guide.module.css": { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) },
    "@/app/wedding-photography/AlbumBrowser": ({ albums }) => React.createElement("div", null,
      albums.map(album => React.createElement("button", { key: album.id }, album.title))),
    "@/app/wedding-photography/wedding-calendar": () => null,
  })("@/app/guide/[id]/page");
}
async function htmlFor(record) {
  const element = await pageFor(record).default({ params: Promise.resolve({ id: minimal.id }) });
  return renderToStaticMarkup(element);
}

test("the five guide albums preserve every portfolio photograph in order", () => {
  const canonical = [EDITORIAL, FILM, ANALOGUE, DREAMY_FINE_ART, DOCUMENTARY];
  assert.deepEqual(GUIDE_PORTFOLIO_ALBUMS.map(album => album.title),
    ["Editorial", "Film Inspired", "1980s Film", "Dreamy Fine Art", "Documentary"]);
  GUIDE_PORTFOLIO_ALBUMS.forEach((album, index) => {
    assert.deepEqual(album.chapters.flatMap(chapter => chapter.photos.map(photo => photo.src)),
      canonical[index].map(photo => photo.src));
  });
});

test("names-only inquiries get guidance and all prices without an invented recommendation", async () => {
  const html = await htmlFor(minimal);
  for (const price of ["C$3,000", "C$4,200", "C$5,900"]) assert.ok(html.includes(price));
  for (const album of GUIDE_PORTFOLIO_ALBUMS) assert.ok(html.includes(album.title));
  assert.match(html, /The help you can expect/);
  assert.doesNotMatch(html, /Starting point from your inquiry|Your plans so far|The priorities you shared/);
  assert.doesNotMatch(html, /couple@example.com|undefined|Date to be decided|Not given/);
  assert.match(html, /The call is optional/);
  assert.ok(html.includes(`mailto:${load("@/lib/site").SITE.email}`));
  assert.match(html, /https:\/\/wa.me\//);
});

test("existing guides keep the couple's details, priorities and coverage context", async () => {
  const html = await htmlFor({ ...minimal, coverage: "10", location: "Cecil Green Park House",
    weddingDate: "2027-08-14", priorities: ["candid", "family"] });
  assert.match(html, /Cecil Green Park House/);
  assert.match(html, /The priorities you shared/);
  assert.match(html, /Starting point from your inquiry/);
  assert.match(html, /coverage you previously selected/);
  assert.doesNotMatch(html, /couple@example.com/);
});

test("unknown records and unsupported markets do not render a guide", async () => {
  await assert.rejects(htmlFor(null), /NOT_FOUND/);
  await assert.rejects(htmlFor({ ...minimal, market: "unknown" }), /NOT_FOUND/);
});

test("guide metadata and tracking keep the private route out of search and analytics", () => {
  const page = pageFor(minimal);
  assert.equal(page.dynamic, "force-dynamic");
  assert.equal(page.metadata.robots.index, false);
  assert.equal(page.metadata.robots.follow, false);
  assert.equal(load("@/lib/analytics").isPublicTrackingPath("/guide/abcdefghijklmnopqrstuv"), false);
});
