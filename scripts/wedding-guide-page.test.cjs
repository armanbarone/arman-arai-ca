const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loader } = require("./wedding-test-loader.cjs");

/* /wedding-guide is the standalone guide the welcome email sends every couple
   to. The page is the HTML design the owner uploaded on 2026-11-24, held in
   app/wedding-guide/guide-html.ts as one template literal, so almost nothing
   in it is computed and almost nothing here can be checked by reading code.
   What these tests guard is the handful of things that can silently rot: the
   prices, the comparison the owner moved here out of the email, and the
   photographs and fonts, which were extracted out of his file and would
   404 in silence if a path were mistyped. */

const root = path.resolve(__dirname, "..");
const load = loader();
const guide = load("@/app/wedding-guide/guide-html").default;
const { TIERS, ADDONS, tierBySlug } = load("@/lib/site");
const { MARKET_TITLE } = load("@/lib/market-comparison");

const money = (amount) => `C$${amount.toLocaleString("en-CA")}`;
/* The market comparison states what OTHER photographers charge, so its
   figures are market claims and are not in lib/site.ts. The price audit below
   is about the guide's own prices, so it reads the page without that block. */
const withoutComparison = guide.replace(/<div class="market-compare">[\s\S]*?<\/div>\s*<a class="text-link"/, "<a");

test("every price in the guide is a price lib/site.ts actually sells", () => {
  const known = new Set();
  for (const tier of TIERS) known.add(tier.price);
  for (const addon of ADDONS) {
    known.add(addon.price);
    if (addon.priceMax) known.add(addon.priceMax);
  }
  const figures = [...withoutComparison.matchAll(/C\$([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, "")));
  /* The range on the framed print is written C$300-900, so the second number
     carries no C$ of its own. */
  for (const match of withoutComparison.matchAll(/C\$([\d,]+)\s*[-–—]\s*([\d,]+)/g)) {
    figures.push(Number(match[2].replace(/,/g, "")));
  }
  assert.ok(figures.length > 20, `only ${figures.length} prices found; did the markup change?`);
  for (const figure of new Set(figures)) {
    assert.ok(known.has(figure), `the guide prints C$${figure}, which lib/site.ts does not sell`);
  }
});

test("each collection is priced from lib/site.ts, never from a typed-in figure", () => {
  for (const slug of ["signature", "complete", "photo-film"]) {
    const tier = tierBySlug(slug);
    assert.ok(guide.includes(money(tier.price)), `${tier.name} is missing ${money(tier.price)}`);
  }
  /* The card and the inclusions table each state all three, so two of each. */
  for (const slug of ["signature", "complete", "photo-film"]) {
    const tier = tierBySlug(slug);
    const count = guide.split(money(tier.price)).length - 1;
    assert.ok(count >= 2, `${money(tier.price)} appears ${count} times, expected the card and the table`);
  }
});

test("the comparison the owner moved out of the email is on this page", () => {
  assert.ok(guide.includes(MARKET_TITLE), "the market comparison is missing");
  assert.match(guide, /Typical at this price/);
  /* It must not use .comparison: that class is display:none below 640px
     because the collection cards repeat it, and nothing repeats this one. */
  const block = guide.slice(guide.indexOf('<div class="market-compare">'));
  assert.match(block.slice(0, 2600), /class="market-table"/);
  assert.doesNotMatch(block.slice(0, 2600), /class="comparison"/);
  /* Each cell names its column, for the stacked phone layout, with the short
     label: the price is in the paragraph above and would otherwise be
     repeated on all eight rows. */
  assert.ok(block.includes('data-label="Signature"'));
  assert.ok(block.includes('data-label="Typical"'));
  assert.ok(block.includes(`Signature · ${money(tierBySlug("signature").price)}`), "the table head still names the collection and its price");
  /* And it sits inside the investment section, above the link to /pricing. */
  assert.ok(guide.indexOf('<div class="market-compare">') < guide.indexOf("See full pricing details"));
});

test("every photograph, font and stylesheet the page asks for is on disk", () => {
  const referenced = new Set([...guide.matchAll(/["(](\/wedding-guide\/[^"')\s]+)/g)].map((m) => m[1]));
  assert.ok(referenced.size >= 17, `only ${referenced.size} local assets referenced`);
  for (const href of referenced) {
    assert.ok(fs.existsSync(path.join(root, "public", href)), `${href} is referenced by the guide and is not in /public`);
  }
  /* The fonts and photographs were inline base64 in the uploaded file, which
     made the document 4MB on a route that is served no-store. */
  assert.doesNotMatch(guide, /base64/);
  assert.ok(guide.length < 120_000, `the guide document is ${guide.length} bytes`);
});

test("the guide stays out of search, and the pixel is still injected", () => {
  assert.match(guide, /<meta name="robots" content="noindex,nofollow">/);
  assert.ok(guide.includes("</head>"), "the route injects the Meta pixel before </head>");
  const route = loader({ "./guide-html": { __esModule: true, default: guide } })("@/app/wedding-guide/route");
  assert.equal(route.dynamic, "force-dynamic");
  const response = route.GET();
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
  assert.match(response.headers.get("Content-Type"), /text\/html/);
});

test("the guide's own facts match the collections it is selling", () => {
  for (const slug of ["signature", "complete", "photo-film"]) {
    const tier = tierBySlug(slug);
    assert.ok(guide.includes(`${tier.hours} hours`), `${tier.name} should state ${tier.hours} hours`);
  }
  /* Travel is inside the collection price everywhere on this site, and this
     page is where the welcome email now sends couples for the detail. */
  assert.match(guide, /travel is included/i);
  assert.match(guide, /two days early/i);
  assert.doesNotMatch(guide, /out-of-town surcharge|travel fee|mileage/i);
});
