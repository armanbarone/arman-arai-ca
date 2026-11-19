const test = require("node:test");
const assert = require("node:assert/strict");
const { loader } = require("./wedding-test-loader.cjs");

/* The builder prices a real quote, so the arithmetic is worth guarding. The
   rules it exists to enforce: a build starts from nothing, coverage is the
   published hourly rate, every option is a published price, and anything
   without a published figure never gets one. */

const load = loader();
const { ADDONS, QUOTED_ADDONS, TERMS, TIERS } = load("@/lib/site");
const cc = load("@/lib/custom-collection");

const option = (name) => ADDONS.find((a) => a.name === name);
const build = (hours, items = {}, quoted = []) => cc.priceBuild({ hours, items, quoted });

test("a build starts from hours, not from a collection", () => {
  /* The first version made a couple pick Signature, Legacy or Photo + Film
     and add to it. The owner's correction on 2026-11-19: from scratch. */
  assert.equal(typeof cc.priceBuild({ hours: 8 }).hours, "number");
  assert.equal(cc.emptySelection().hours, cc.DEFAULT_HOURS);
  assert.equal(cc.emptySelection().base, undefined);
  const bare = build(8);
  assert.equal(bare.lines.length, 0);
  assert.equal(bare.totalMin, 8 * cc.HOURLY);
});

test("the hourly rate is the published one, and nothing else is derived", () => {
  assert.equal(cc.HOURLY, TERMS.extraHour);
  for (let hours = cc.MIN_HOURS; hours <= cc.MAX_HOURS; hours++) {
    assert.equal(build(hours).totalMin, hours * TERMS.extraHour);
  }
});

test("hours are clamped to what is actually sold", () => {
  assert.equal(build(1).hours, cc.MIN_HOURS);
  assert.equal(build(99).hours, cc.MAX_HOURS);
  assert.equal(build(Number.NaN).hours, cc.DEFAULT_HOURS);
  assert.equal(build("10").hours, 10);
});

test("building a set collection from scratch costs more than buying it", () => {
  /* A collection has to be the better buy or the ladder makes no sense. The
     comparison is like for like: Legacy is ten hours AND a second
     photographer AND an album, so a bare ten hours is not a Legacy. */
  const album = ADDONS.find((a) => a.name.startsWith("Signature album")).name;
  const equivalents = [
    ["signature", 8, {}],
    ["complete", 10, { "Second photographer, 4 hours": 1, [album]: 1 }],
    ["photo-film", 12, { "Dedicated filmmaker, 8 hours": 1, [album]: 1 }],
  ];
  for (const [slug, hours, items] of equivalents) {
    const tier = TIERS.find((t) => t.slug === slug);
    const assembled = build(hours, items).totalMin;
    assert.ok(assembled >= tier.price, `${tier.name} assembled (${assembled}) undercuts the collection (${tier.price})`);
  }
});

test("the hourly add-on is not also an option, so hours cannot be bought twice", () => {
  assert.equal(cc.OPTIONS.find((o) => o.name === "Extra coverage hour"), undefined);
  assert.equal(build(8, { "Extra coverage hour": 4 }).totalMin, 8 * cc.HOURLY);
});

test("options are added at their published price, and quantities multiply", () => {
  const roll = option("One more roll of film");
  assert.equal(build(8, { [roll.name]: 3 }).totalMin, 8 * cc.HOURLY + roll.price * 3);
});

test("a quantity above what is sensible is clamped, not trusted", () => {
  const name = "Parent album";
  const result = build(8, { [name]: 99 });
  assert.equal(result.lines[0].quantity, cc.maxQuantity(name));
  assert.equal(result.totalMin, 8 * cc.HOURLY + option(name).price * cc.maxQuantity(name));
});

test("an option that needs crew is blocked until the crew is on the day", () => {
  const extra = "Extra second-photographer hour";
  assert.ok(cc.blockedBy(extra, { hours: 8, items: {}, quoted: [] }));
  assert.equal(build(8, { [extra]: 2 }).totalMin, 8 * cc.HOURLY, "cannot be bought by posting it anyway");

  const withCrew = build(8, { "Second photographer, 4 hours": 1, [extra]: 2 });
  assert.equal(
    withCrew.totalMin,
    8 * cc.HOURLY + option("Second photographer, 4 hours").price + option(extra).price * 2,
  );
  assert.equal(cc.blockedBy(extra, { hours: 8, items: { "Second photographer, 4 hours": 1 }, quoted: [] }), undefined);
});

test("the filmmaker gates behave the same way", () => {
  for (const name of ["Extra filmmaking hour", "Full ceremony and speeches films"]) {
    assert.ok(cc.blockedBy(name, { hours: 8, items: {}, quoted: [] }));
    assert.equal(
      cc.blockedBy(name, { hours: 8, items: { "Dedicated filmmaker, 8 hours": 1 }, quoted: [] }),
      undefined,
    );
  }
});

test("a ranged price stays a range and is never averaged into a figure", () => {
  const framed = option("Large framed fine-art print");
  assert.ok(framed.priceMax > framed.price);
  const result = build(8, { [framed.name]: 2 });
  assert.equal(result.totalMin, 8 * cc.HOURLY + framed.price * 2);
  assert.equal(result.totalMax, 8 * cc.HOURLY + framed.priceMax * 2);
  assert.equal(result.approximate, true);
  assert.match(cc.buildTotal(result), /^C\$[\d,]+–[\d,]+$/);
});

test("quoted-only options carry no number into the total", () => {
  const name = QUOTED_ADDONS[0].name;
  const result = build(8, {}, [name]);
  assert.equal(result.totalMin, 8 * cc.HOURLY);
  assert.deepEqual(result.quoted, [name]);
  assert.match(cc.buildSummary(result).join("\n"), /quoted, no published figure/);
  assert.deepEqual(build(8, {}, ["A helicopter, free"]).quoted, []);
});

test("an invented option name buys nothing", () => {
  const result = build(8, { "Free second photographer": 4, "": 2 });
  assert.equal(result.totalMin, 8 * cc.HOURLY);
  assert.equal(result.lines.length, 0);
});

test("a reference is readable, unique enough, and free of letters people misread", () => {
  const ref = cc.buildReference();
  assert.match(ref, /^CC-[ACDEFGHJKLMNPQRTUVWXY34679]{5}$/);
  for (const bad of ["I", "O", "S", "B", "0", "1", "2", "5", "8"]) {
    assert.doesNotMatch(ref.slice(3), new RegExp(bad));
  }
  const seen = new Set(Array.from({ length: 500 }, () => cc.buildReference()));
  assert.ok(seen.size > 480, `too many collisions in 500: ${seen.size}`);
});

test("the summary the owner reads names the hours, the lines and the total", () => {
  const result = build(10, { "Dedicated filmmaker, 8 hours": 1, "Parent album": 2 });
  const summary = cc.buildSummary(result).join("\n");
  assert.match(summary, /^10 hours of coverage, one lead photographer —/);
  assert.match(summary, /Parent album ×2/);
  assert.match(summary, new RegExp(`Total before tax: C\\$${result.totalMin.toLocaleString("en-CA")}`));
});

test("the owner is told when a set collection would have been cheaper", () => {
  const dear = cc.againstCollections(build(cc.MAX_HOURS));
  assert.ok(dear.some((row) => row.difference > 0), "14 hours à la carte beats at least one package");
  const cheap = cc.againstCollections(build(cc.MIN_HOURS));
  assert.ok(cheap.every((row) => row.difference < 0), "6 hours à la carte is under every package");
});

test("what every build carries is never also sold as an option", () => {
  /* STANDARD is what Signature has at its own price, so charging for any of
     it on top would be charging twice. */
  for (const item of cc.STANDARD) {
    assert.equal(cc.OPTIONS.find((o) => o.name === item), undefined, item);
  }
  assert.ok(cc.STANDARD.some((s) => /engagement session/i.test(s)));
  assert.ok(cc.STANDARD.some((s) => /[Tt]ravel anywhere in Canada/.test(s)));
});
