const test = require("node:test");
const assert = require("node:assert/strict");
const { loader } = require("./wedding-test-loader.cjs");

/* The custom collection builder prices a real quote, so the arithmetic is
   worth guarding. The rule it exists to enforce: every figure comes from
   lib/site.ts, an option a collection already carries can never be charged
   for, and anything without a published price stays without one. */

const load = loader();
const site = load("@/lib/site");
const cc = load("@/lib/custom-collection");

const { ADDONS, QUOTED_ADDONS, TIERS, TERMS } = site;
const signature = TIERS[0];
const legacy = TIERS.find((t) => t.slug === "complete");
const photoFilm = TIERS.find((t) => t.slug === "photo-film");
const addon = (name) => ADDONS.find((a) => a.name === name);
const build = (base, items = {}, quoted = []) => cc.priceBuild({ base, items, quoted });

test("an empty build is exactly the collection price, and nothing else", () => {
  for (const tier of TIERS) {
    const result = build(tier.slug);
    assert.equal(result.totalMin, tier.price);
    assert.equal(result.totalMax, tier.price);
    assert.equal(result.lines.length, 0);
    assert.equal(result.approximate, false);
  }
});

test("an unknown collection falls back to the entry one rather than to zero", () => {
  const result = build("not-a-collection");
  assert.equal(result.base.slug, signature.slug);
  assert.equal(result.totalMin, signature.price);
});

test("options are added at their published price, and quantities multiply", () => {
  const hour = addon("Extra coverage hour");
  const result = build(signature.slug, { "Extra coverage hour": 3 });
  assert.equal(result.totalMin, signature.price + hour.price * 3);
  /* The hourly rate a couple is quoted here has to be the one in the terms,
     or the builder and every contract disagree. */
  assert.equal(hour.price, TERMS.extraHour);
});

test("a quantity above what is sensible is clamped, not trusted", () => {
  const hour = addon("Extra coverage hour");
  const result = build(signature.slug, { "Extra coverage hour": 99 });
  assert.equal(result.lines[0].quantity, cc.maxQuantity("Extra coverage hour"));
  assert.equal(result.totalMin, signature.price + hour.price * cc.maxQuantity("Extra coverage hour"));
});

test("what a collection already includes is never charged for again", () => {
  const second = addon("Second photographer, 4 hours");
  const album = ADDONS.find((a) => a.name.startsWith("Signature album"));
  const filmmaker = addon("Dedicated filmmaker, 8 hours");

  const onLegacy = build(legacy.slug, {
    [second.name]: 1,
    [album.name]: 1,
  });
  assert.equal(onLegacy.totalMin, legacy.price, "Legacy already has both");
  assert.ok(onLegacy.included.includes(second.name));
  assert.ok(onLegacy.included.includes(album.name));

  const onPhotoFilm = build(photoFilm.slug, { [filmmaker.name]: 1, [album.name]: 1 });
  assert.equal(onPhotoFilm.totalMin, photoFilm.price, "Photo + Film already has both");

  /* On Signature they are genuine add-ons and do cost money. */
  const onSignature = build(signature.slug, { [second.name]: 1 });
  assert.equal(onSignature.totalMin, signature.price + second.price);
});

test("an option that needs crew is blocked until the crew is on the day", () => {
  const extra = "Extra second-photographer hour";
  const blocked = cc.blockedBy(extra, { base: signature.slug, items: {}, quoted: [] });
  assert.ok(blocked, "no second photographer on Signature, so the hour is blocked");
  assert.match(blocked.why, /second photographer/i);
  /* And it cannot be bought by posting it anyway. */
  assert.equal(build(signature.slug, { [extra]: 2 }).totalMin, signature.price);

  /* Once the four-hour option is chosen it is available and priced. */
  const withCrew = build(signature.slug, { "Second photographer, 4 hours": 1, [extra]: 2 });
  assert.equal(
    withCrew.totalMin,
    signature.price + addon("Second photographer, 4 hours").price + addon(extra).price * 2,
  );
  /* Legacy carries one already, so the hour is available there with no
     four-hour line to buy first. */
  assert.equal(cc.blockedBy(extra, { base: legacy.slug, items: {}, quoted: [] }), undefined);
});

test("the filmmaker gates behave the same way", () => {
  for (const name of ["Extra filmmaking hour", "Full ceremony and speeches films"]) {
    assert.ok(cc.blockedBy(name, { base: signature.slug, items: {}, quoted: [] }));
    assert.equal(cc.blockedBy(name, { base: photoFilm.slug, items: {}, quoted: [] }), undefined);
    assert.equal(
      cc.blockedBy(name, { base: signature.slug, items: { "Dedicated filmmaker, 8 hours": 1 }, quoted: [] }),
      undefined,
    );
  }
});

test("a ranged price stays a range and is never averaged into a figure", () => {
  const framed = addon("Large framed fine-art print");
  assert.ok(framed.priceMax > framed.price);
  const result = build(signature.slug, { [framed.name]: 2 });
  assert.equal(result.totalMin, signature.price + framed.price * 2);
  assert.equal(result.totalMax, signature.price + framed.priceMax * 2);
  assert.equal(result.approximate, true);
  assert.match(cc.buildTotal(result), /^C\$[\d,]+–[\d,]+$/);
});

test("quoted-only options carry no number into the total", () => {
  const name = QUOTED_ADDONS[0].name;
  const result = build(signature.slug, {}, [name]);
  assert.equal(result.totalMin, signature.price);
  assert.deepEqual(result.quoted, [name]);
  assert.equal(result.approximate, true);
  assert.match(cc.buildSummary(result).join("\n"), /quoted, no published figure/);
  /* And something nobody published cannot be smuggled in as one. */
  assert.deepEqual(build(signature.slug, {}, ["A helicopter, free"]).quoted, []);
});

test("an invented option name buys nothing", () => {
  const result = build(signature.slug, { "Free second photographer": 4, "": 2 });
  assert.equal(result.totalMin, signature.price);
  assert.equal(result.lines.length, 0);
});

test("the summary the owner reads names the collection, the lines and the total", () => {
  const result = build(legacy.slug, { "Extra coverage hour": 2, "Parent album": 2 });
  const summary = cc.buildSummary(result).join("\n");
  assert.match(summary, new RegExp(`^${legacy.name} —`));
  assert.match(summary, /Extra coverage hour ×2/);
  assert.match(summary, /Parent album ×2/);
  assert.match(summary, /Signature album[^\n]*included in Legacy/);
  assert.match(summary, new RegExp(`Total before tax: C\\$${result.totalMin.toLocaleString("en-CA")}`));
});
